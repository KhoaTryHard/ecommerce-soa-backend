# E-commerce SOA Backend - NestJS

Backend hoàn chỉnh theo case study Tuần 03: 5 service độc lập, REST + SOAP + event-driven, API Gateway, rate limit và load balancing. Tất cả chạy bằng Docker Compose.

## Kiến trúc

| Thành phần | Công nghệ | Trách nhiệm |
|---|---|---|
| Edge | Nginx | Rate limit, least-connection load balancing, failover |
| API Gateway (2 replicas) | NestJS | Single entry point, route request đến service |
| User Service | NestJS + MySQL | JWT, refresh token, profile, RBAC |
| Product Service | NestJS + Elasticsearch | CRUD, search, filter, tồn kho |
| Order Service | NestJS + PostgreSQL | Workflow đơn hàng, reserve stock, phát sự kiện |
| Payment Service | NestJS + PostgreSQL | REST nội bộ, SOAP gateway, WS-Security, refund |
| Notification Service | NestJS + PostgreSQL | Consumer RabbitMQ cho email/SMS/push |
| Message broker | RabbitMQ | Các queue bền vững `orders`, `payments`, `notifications` |

## Chạy dự án

Yêu cầu: Docker Desktop có Docker Compose v2, tối thiểu khoảng 6 GB RAM trống.

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
curl http://localhost:8080/health
```

API public: `http://localhost:8080/api/v1`. RabbitMQ UI: `http://localhost:15672`.

Tắt hệ thống nhưng giữ dữ liệu:

```bash
docker compose down
```

Xóa cả dữ liệu local (lệnh phá hủy dữ liệu):

```bash
docker compose down -v
```

## API contract

### User Service

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/users/{id}`
- `PUT /api/v1/users/{id}`
- `POST /api/v1/users/{id}/roles` - ADMIN
- `DELETE /api/v1/users/{id}` - ADMIN

### Product Service

- `GET /api/v1/products`
- `GET /api/v1/products/search?q=laptop`
- `GET /api/v1/products/{id}`
- `POST /api/v1/products` - SELLER/ADMIN
- `PUT /api/v1/products/{id}` - SELLER/ADMIN
- `DELETE /api/v1/products/{id}` - SELLER/ADMIN, soft delete
- `POST /api/v1/products/{id}/reservations` - internal order flow

Query list: `page`, `limit`, `sort`, `order`, `category`, `min_price`, `max_price`.

### Order Service

- `POST /api/v1/orders` - bắt buộc header `Idempotency-Key`
- `GET /api/v1/orders/{id}`
- `GET /api/v1/orders?userId={id}`
- `POST /api/v1/orders/{id}/confirm`
- `POST /api/v1/orders/{id}/cancel`
- `PATCH /api/v1/orders/{id}/status`

Workflow: `PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED`; chỉ được hủy trước `SHIPPED`.

### Payment Service

- `POST /api/v1/payments`
- `GET /api/v1/payments/{id}`
- `POST /api/v1/payments/{id}/refund`

Khi `PAYMENT_GATEWAY_URL` để trống, service dùng mock SOAP gateway để chạy demo. Khi cấu hình URL thật, client gửi SOAP Envelope có WS-Security UsernameToken/PasswordDigest.

### Notification Service

- `GET /api/v1/notifications/users/{userId}`
- Consumer events: `OrderCreated`, `PaymentSuccess`, `OrderShipped`, `OrderDelivered`, `LowStock`.

## Rate limit và load balancing

- Rate limit: `100 request/phút/key`, burst 20. Key là toàn bộ Bearer token; request chưa đăng nhập dùng IP.
- Nginx trả HTTP `429` khi vượt ngưỡng.
- `least_conn` phân phối request tới `api-gateway-1` và `api-gateway-2`.
- Upstream có `max_fails=3`, `fail_timeout=10s`, retry một node khác với lỗi 502/503/504.
- Mỗi container có health check; gateway chỉ khởi động sau khi 5 service healthy.

## Ví dụ nhanh

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"buyer@example.com","username":"buyer","password":"BuyerPass123"}'
```

Lấy `access_token` từ response rồi gửi `Authorization: Bearer <token>` cho endpoint được bảo vệ.

## Kiểm tra mã nguồn

```bash
npm ci
npm run build
npm test
```

`DB_SYNCHRONIZE=true` chỉ phục vụ môi trường demo Compose. Trước khi triển khai production, hãy chuyển sang TypeORM migrations, đổi toàn bộ secret, bật TLS, dùng Redis-backed distributed rate limit nếu chạy nhiều edge node, và đưa secret vào secret manager.
