import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/exception.filter';
import { MikroORM } from '@mikro-orm/core';
import { MikroOrmMiddleware } from '@mikro-orm/nestjs';

/**
 * E2E spec cho 3 module của Phong: INVENTORY, CART, ORDER.
 * Chỉ exercise read endpoints + validation pipe để không xung đột DB với dev server.
 * Chạy: yarn test:e2e
 */
describe('Phong modules (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const orm = app.get(MikroORM);
    app.use(new MikroOrmMiddleware(orm).use.bind(new MikroOrmMiddleware(orm)));

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('S3-01 INVENTORY (read + validation)', () => {
    it('GET /inventory trả 200 với pagination meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/inventory?page=1&limit=5')
        .expect(200);
      const payload = res.body?.data ?? res.body;
      expect(Array.isArray(payload.items)).toBe(true);
      expect(payload.meta).toMatchObject({ page: 1, limit: 5 });
    });

    it('GET /inventory?low_stock=true trả 200', async () => {
      await request(app.getHttpServer())
        .get('/inventory?low_stock=true')
        .expect(200);
    });

    it('PUT /inventory/:id với quantity âm → 400 (ValidationPipe @Min(0))', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .put(`/inventory/${fakeId}`)
        .send({ quantity: -1 })
        .expect(400);
    });
  });

  describe('S3-02 MOVEMENTS (validation)', () => {
    it('POST /inventory/movements thiếu field bắt buộc → 400', async () => {
      await request(app.getHttpServer())
        .post('/inventory/movements')
        .send({})
        .expect(400);
    });

    it('POST /inventory/movements với type không hợp lệ → 400', async () => {
      await request(app.getHttpServer())
        .post('/inventory/movements')
        .send({
          variantId: '00000000-0000-0000-0000-000000000000',
          type: 'INVALID_TYPE',
          quantity: 1,
        })
        .expect(400);
    });

    it('GET /inventory/movements trả 200', async () => {
      const res = await request(app.getHttpServer())
        .get('/inventory/movements?limit=1')
        .expect(200);
      const payload = res.body?.data ?? res.body;
      expect(Array.isArray(payload.items)).toBe(true);
    });
  });

  describe('S4 CART (validation)', () => {
    it('GET /cart trả 200 (stub user)', async () => {
      await request(app.getHttpServer()).get('/cart').expect(200);
    });

    it('POST /cart/items với variantId không phải UUID → 400', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .send({ variantId: 'not-uuid', quantity: 1 })
        .expect(400);
    });

    it('POST /cart/items với quantity=0 → 400 (@Min(1))', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .send({
          variantId: '00000000-0000-0000-0000-000000000000',
          quantity: 0,
        })
        .expect(400);
    });

    it('POST /cart/items với quantity > 999 → 400 (@Max(999))', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .send({
          variantId: '00000000-0000-0000-0000-000000000000',
          quantity: 1000,
        })
        .expect(400);
    });

    it('POST /cart/merge với items không phải array → 400', async () => {
      await request(app.getHttpServer())
        .post('/cart/merge')
        .send({ items: 'wrong' })
        .expect(400);
    });
  });

  describe('S5 ORDER (read + validation)', () => {
    it('GET /orders trả 200', async () => {
      const res = await request(app.getHttpServer()).get('/orders').expect(200);
      const payload = res.body?.data ?? res.body;
      expect(Array.isArray(payload.items)).toBe(true);
    });

    it('GET /orders?status=PENDING trả 200, items đều PENDING', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders?status=PENDING')
        .expect(200);
      const payload = res.body?.data ?? res.body;
      expect(payload.items.every((o: any) => o.status === 'PENDING')).toBe(true);
    });

    it('GET /orders/:id không tồn tại → 404', async () => {
      await request(app.getHttpServer())
        .get('/orders/00000000-0000-0000-0000-000000000099')
        .expect(404);
    });

    it('POST /orders với phone sai format VN → 400', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({ shippingAddress: 'Test address xxx', phone: 'not-a-phone' })
        .expect(400);
    });

    it('POST /orders/bulk-status với status sai enum → 400', async () => {
      await request(app.getHttpServer())
        .post('/orders/bulk-status')
        .send({
          orderIds: ['00000000-0000-0000-0000-000000000099'],
          status: 'BOGUS',
        })
        .expect(400);
    });

    it('PUT /orders/:id/status với status invalid enum → 400', async () => {
      await request(app.getHttpServer())
        .put('/orders/00000000-0000-0000-0000-000000000099/status')
        .send({ status: 'NOT_VALID' })
        .expect(400);
    });
  });
});
