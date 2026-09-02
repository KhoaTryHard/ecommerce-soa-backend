# Luồng nghiệp vụ chính

1. Client gọi Nginx Edge; Nginx rate-limit và cân bằng tải qua hai API Gateway.
2. Gateway chuyển request tới đúng service, giữ nguyên `/api/v1/...`, bearer token và request ID.
3. Order Service kiểm tra Product Service, reserve stock rồi ghi đơn vào PostgreSQL.
4. Order Service phát `order.created` vào queue Payment và Notification.
5. Payment Service gọi SOAP gateway, lưu transaction và phát `payment.succeeded` sang Order/Notification.
6. Order Service nhận kết quả, chuyển `PENDING -> CONFIRMED`.
7. Notification Service lưu bản ghi gửi theo channel phù hợp.

## Quy ước API

- Resource dùng danh từ số nhiều: `/products`, `/orders`, `/payments`.
- Field JSON dùng `snake_case`; entity nội bộ dùng camelCase và DTO làm biên contract.
- HTTP status: 201 create, 200 read/update, 204 delete, 400 validation, 401 auth, 403 RBAC, 404 missing, 409 invalid state/idempotency conflict, 429 rate limit.
- Mọi POST tạo order/payment phải có idempotency key hoặc key ổn định theo order.
