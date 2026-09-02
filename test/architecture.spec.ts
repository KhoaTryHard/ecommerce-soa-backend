import { readFileSync } from 'fs';
import { join } from 'path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('SOA architecture contract', () => {
  it('exposes the endpoint names required by the case study', () => {
    const user = read('apps/user-service/src/user.controller.ts');
    const product = read('apps/product-service/src/product.controller.ts');
    const order = read('apps/order-service/src/order.controller.ts');
    const payment = read('apps/payment-service/src/payment.controller.ts');
    expect(user).toContain("@Post('auth/register')");
    expect(user).toContain("@Post('auth/login')");
    expect(product.indexOf("@Get('search')")).toBeLessThan(product.indexOf("@Get(':id')"));
    for (const endpoint of ["@Post()", "@Get(':id')", "@Post(':id/confirm')", "@Post(':id/cancel')", "@Patch(':id/status')"]) expect(order).toContain(endpoint);
    for (const endpoint of ["@Post()", "@Get(':id')", "@Post(':id/refund')"]) expect(payment).toContain(endpoint);
  });

  it('configures token-aware 100 requests/minute rate limiting and load balancing', () => {
    const nginx = read('infra/nginx/nginx.conf');
    expect(nginx).toContain('rate=100r/m');
    expect(nginx).toContain('$http_authorization');
    expect(nginx).toContain('least_conn');
    expect(nginx.match(/server api-gateway-[12]:3000/g)).toHaveLength(2);
  });

  it('keeps the five service boundaries explicit', () => {
    const compose = read('docker-compose.yml');
    for (const service of ['user-service:', 'product-service:', 'order-service:', 'payment-service:', 'notification-service:']) expect(compose).toContain(service);
  });
});
