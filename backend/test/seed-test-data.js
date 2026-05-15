/**
 * Seed data sạch cho test CRUD của Phong (S3/S4/S5).
 * Kết nối MySQL trực tiếp bằng mysql2.
 *
 * Tạo:
 *   - 1 category (reuse nếu đã có)
 *   - 1 product TEST_PHONG_PRODUCT
 *   - 2 variants TEST_PHONG_VARIANT_{A,B}
 *   - 1 price active (giá 100000 VND)
 *   - 2 inventories: variant A = 100, variant B = 3 (low-stock)
 *
 * Cleanup trước khi tạo: xoá toàn bộ dòng có id bắt đầu bằng 'phong-test-'.
 * Output: ghi IDs ra test/seed-result.json để smoke test đọc lại.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

// UUID v4 hợp lệ (DTO validate bằng @IsUUID()) nhưng dễ nhận dạng = test fixtures.
const IDS = {
  product:    '11111111-1111-4111-8111-111111111111',
  variantA:   'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  variantB:   'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  price:      'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  inventoryA: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  inventoryB: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
};

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecommerce_dev',
    multipleStatements: true,
  });

  console.log('Connected to', process.env.DB_NAME);

  // ---------- CLEANUP previous test data ----------
  console.log('\n[1/6] Cleanup dữ liệu test cũ...');
  // Order of cleanup matters because of FKs.
  // Clear smoke-test orders/carts created by 'stub user' = '00000000-0000-0000-0000-000000000000'
  const STUB_USER = '00000000-0000-0000-0000-000000000000';
  await conn.query(
    `DELETE FROM order_status_history WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)`,
    [STUB_USER],
  );
  await conn.query(
    `DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)`,
    [STUB_USER],
  );
  await conn.query(`DELETE FROM orders WHERE user_id = ?`, [STUB_USER]);
  await conn.query(
    `DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)`,
    [STUB_USER],
  );
  await conn.query(`DELETE FROM carts WHERE user_id = ?`, [STUB_USER]);

  // Clear inventory_movements + inventories + price + variants + product (by fixed test IDs)
  await conn.query(
    `DELETE FROM inventory_movements WHERE variant_id IN (?, ?)`,
    [IDS.variantA, IDS.variantB],
  );
  await conn.query(`DELETE FROM inventories WHERE id IN (?, ?)`, [
    IDS.inventoryA, IDS.inventoryB,
  ]);
  await conn.query(`DELETE FROM prices WHERE id = ?`, [IDS.price]);
  await conn.query(`DELETE FROM product_variants WHERE id IN (?, ?)`, [
    IDS.variantA, IDS.variantB,
  ]);
  await conn.query(`DELETE FROM products WHERE id = ?`, [IDS.product]);
  console.log('  ✓ Đã clean dữ liệu test cũ + cart/order của stub user.');

  // ---------- CATEGORY ----------
  console.log('\n[2/6] Category...');
  const [cats] = await conn.query(
    `SELECT id, name FROM categories WHERE is_deleted = 0 LIMIT 1`,
  );
  const categoryId = cats[0]?.id;
  if (!categoryId) {
    throw new Error('DB chưa có category nào — cần tạo 1 category trước.');
  }
  console.log(`  ✓ Dùng category: ${cats[0].name} (${categoryId})`);

  // ---------- PRODUCT ----------
  console.log('\n[3/6] Product...');
  await conn.query(
    `INSERT INTO products (id, name, slug, sku, category_id, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())`,
    [
      IDS.product,
      'TEST PHONG Product (smoke test)',
      'test-phong-product-' + Date.now(),
      'TEST-PHONG-' + Date.now(),
      categoryId,
    ],
  );
  console.log(`  ✓ Product: ${IDS.product}`);

  // ---------- VARIANTS ----------
  console.log('\n[4/6] Variants...');
  await conn.query(
    `INSERT INTO product_variants (id, product_id, sku, attributes, is_deleted, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, NOW(), NOW()),
            (?, ?, ?, ?, 0, NOW(), NOW())`,
    [
      IDS.variantA, IDS.product, 'TEST-VA-' + Date.now(), JSON.stringify({ color: 'red', size: 'M' }),
      IDS.variantB, IDS.product, 'TEST-VB-' + Date.now(), JSON.stringify({ color: 'blue', size: 'L' }),
    ],
  );
  console.log(`  ✓ Variant A: ${IDS.variantA}`);
  console.log(`  ✓ Variant B: ${IDS.variantB}`);

  // ---------- PRICE ----------
  console.log('\n[5/6] Price (active)...');
  await conn.query(
    `INSERT INTO prices (id, product_id, price, start_date, end_date, is_active, created_at, updated_at)
     VALUES (?, ?, ?, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 30 DAY, 1, NOW(), NOW())`,
    [IDS.price, IDS.product, '100000.00'],
  );
  console.log(`  ✓ Price: 100,000 VND (active, đến +30 ngày)`);

  // ---------- INVENTORIES ----------
  console.log('\n[6/6] Inventories...');
  await conn.query(
    `INSERT INTO inventories (id, variant_id, available, reserved, sold, low_stock_threshold, created_at, updated_at)
     VALUES (?, ?, 100, 0, 0, 10, NOW(), NOW()),
            (?, ?,   3, 0, 0,  5, NOW(), NOW())`,
    [IDS.inventoryA, IDS.variantA, IDS.inventoryB, IDS.variantB],
  );
  console.log(`  ✓ Inventory A: available=100, threshold=10 (BÌNH THƯỜNG)`);
  console.log(`  ✓ Inventory B: available=3,  threshold=5  (LOW STOCK)`);

  await conn.end();

  // ---------- WRITE RESULT ----------
  const out = {
    seededAt: new Date().toISOString(),
    categoryId,
    ...IDS,
    snapshot: {
      inventoryA: { available: 100, reserved: 0, sold: 0, lowStockThreshold: 10 },
      inventoryB: { available: 3, reserved: 0, sold: 0, lowStockThreshold: 5 },
      price: '100000.00',
    },
  };
  fs.writeFileSync(
    path.join(__dirname, 'seed-result.json'),
    JSON.stringify(out, null, 2),
  );
  console.log('\n✅ DONE — IDs ghi tại test/seed-result.json');
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error('\n❌ SEED FAILED:', e.message);
  console.error(e.stack);
  process.exit(1);
});
