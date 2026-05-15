/**
 * Verbose CRUD test cho 7 task của Phong.
 *
 * Trước mỗi mutation: in snapshot DB hiện tại.
 * Sau mutation: in snapshot mới + diff để mắt người verify.
 *
 * YÊU CẦU:
 *   1. Backend đang chạy tại http://localhost:3003
 *   2. Đã chạy `node test/seed-test-data.js` để có test data sạch
 *
 * Run:  node test/test-phong-crud.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const API_URL = process.env.API_URL || 'http://localhost:3003';
const SEED_FILE = path.join(__dirname, 'seed-result.json');

if (!fs.existsSync(SEED_FILE)) {
  console.error('❌ Chưa có test/seed-result.json — chạy `node test/seed-test-data.js` trước.');
  process.exit(2);
}
const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));

const STUB_USER = '00000000-0000-0000-0000-000000000000';

let passed = 0;
let failed = 0;
const failures = [];

// ----- output helpers -----
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  mag: '\x1b[35m',
};

function log(s = '') {
  process.stdout.write(s + '\n');
}
function section(title) {
  log('\n' + C.bold + C.cyan + '═'.repeat(72) + C.reset);
  log(C.bold + C.cyan + ' ' + title + C.reset);
  log(C.bold + C.cyan + '═'.repeat(72) + C.reset);
}
function step(title) {
  log('\n' + C.bold + '▸ ' + title + C.reset);
}
function snap(label, obj) {
  const formatted = Object.entries(obj)
    .map(([k, v]) => `${k}=${C.yellow}${JSON.stringify(v)}${C.reset}`)
    .join('  ');
  log(`  ${C.dim}${label.padEnd(8)}${C.reset} ${formatted}`);
}
function action(s) {
  log(`  ${C.mag}→ ${s}${C.reset}`);
}
function diff(before, after, keys) {
  const k = keys ?? Object.keys(after);
  const changes = k
    .filter((x) => JSON.stringify(before[x]) !== JSON.stringify(after[x]))
    .map((x) => `${x}: ${before[x]} → ${C.bold}${after[x]}${C.reset}`);
  if (changes.length === 0) {
    log(`  ${C.dim}DIFF    (không thay đổi)${C.reset}`);
  } else {
    log(`  ${C.bold}DIFF${C.reset}    ${changes.join('  |  ')}`);
  }
}
function ok(label) {
  passed++;
  log(`  ${C.green}✓ PASS${C.reset}  ${label}`);
}
function fail(label, detail) {
  failed++;
  failures.push({ label, detail });
  log(`  ${C.red}✗ FAIL${C.reset}  ${label}`);
  if (detail !== undefined) log(`         ${C.red}${JSON.stringify(detail)}${C.reset}`);
}
function assert(cond, label, detail) {
  cond ? ok(label) : fail(label, detail);
}

// ----- HTTP helper -----
async function http(method, p, body) {
  const res = await fetch(`${API_URL}${p}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}
function unwrap(res) {
  return res.data?.data ?? res.data;
}

// ----- DB query helper -----
let conn;
async function db() {
  if (!conn) {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
  return conn;
}
async function fetchInventory(variantId) {
  const c = await db();
  const [rows] = await c.query(
    'SELECT available, reserved, sold, low_stock_threshold FROM inventories WHERE variant_id = ?',
    [variantId],
  );
  return rows[0]
    ? {
        available: rows[0].available,
        reserved: rows[0].reserved,
        sold: rows[0].sold,
        lowStockThreshold: rows[0].low_stock_threshold,
      }
    : null;
}
async function fetchMovements(variantId) {
  const c = await db();
  const [rows] = await c.query(
    'SELECT type, quantity, reference_type, note, created_at FROM inventory_movements WHERE variant_id = ? ORDER BY created_at DESC',
    [variantId],
  );
  return rows;
}
async function fetchCart(userId) {
  const c = await db();
  const [carts] = await c.query(
    `SELECT id, status FROM carts WHERE user_id = ? AND status = 'ACTIVE' LIMIT 1`,
    [userId],
  );
  if (!carts[0]) return { items: [], total: 0 };
  const [items] = await c.query(
    'SELECT id, variant_id, quantity, price_at_time FROM cart_items WHERE cart_id = ?',
    [carts[0].id],
  );
  return {
    id: carts[0].id,
    status: carts[0].status,
    items: items.map((i) => ({
      id: i.id.slice(0, 8) + '…',
      variantId: i.variant_id.slice(0, 8) + '…',
      quantity: i.quantity,
      price: Number(i.price_at_time),
    })),
  };
}
async function fetchOrder(orderId) {
  const c = await db();
  const [rows] = await c.query(
    'SELECT id, status, subtotal, discount_amount, total_price FROM orders WHERE id = ?',
    [orderId],
  );
  return rows[0] || null;
}

// ===========================================================================
//                                 TESTS
// ===========================================================================

async function testS3_01() {
  section('S3-01  INVENTORY CRUD  (variant A — bình thường)');

  // R — read initial state from API + DB
  step('READ — GET /inventory/:variantId');
  const dbBefore = await fetchInventory(seed.variantA);
  snap('DB', dbBefore);
  action(`GET /inventory/${seed.variantA.slice(0, 8)}…`);
  const get1 = await http('GET', `/inventory/${seed.variantA}`);
  const inv1 = unwrap(get1);
  snap('API', {
    available: inv1.available,
    reserved: inv1.reserved,
    sold: inv1.sold,
    lowStock: inv1.lowStock,
  });
  assert(get1.status === 200, 'GET /inventory/:variantId → 200');
  assert(inv1.available === dbBefore.available, 'API.available trùng DB.available');
  assert(inv1.reserved === dbBefore.reserved, 'API.reserved trùng DB.reserved');
  assert(inv1.lowStock === false, 'available=100 > threshold=10 → lowStock=false');

  // R — list with pagination
  step('LIST — GET /inventory?page=1&limit=10');
  const list = await http('GET', '/inventory?page=1&limit=10');
  const listPayload = unwrap(list);
  log(`  ${C.dim}Trả về ${listPayload.items.length} variants, total=${listPayload.meta.total}${C.reset}`);
  assert(list.status === 200, 'GET /inventory → 200');
  assert(
    listPayload.items.some((i) => i.variantId === seed.variantA),
    'List có chứa variant A (seed)',
  );
  assert(listPayload.meta.page === 1 && listPayload.meta.limit === 10, 'Meta pagination đúng');

  // R — filter low_stock
  step('FILTER — GET /inventory?low_stock=true (variant B có available=3 < threshold=5)');
  const low = await http('GET', '/inventory?low_stock=true&limit=50');
  const lowPayload = unwrap(low);
  const hasB = lowPayload.items.some((i) => i.variantId === seed.variantB);
  const hasA = lowPayload.items.some((i) => i.variantId === seed.variantA);
  log(`  ${C.dim}Low-stock variants: ${lowPayload.items.length}${C.reset}`);
  assert(hasB, 'Variant B (available=3, threshold=5) nằm trong low_stock list');
  assert(!hasA, 'Variant A (available=100, threshold=10) KHÔNG nằm trong low_stock list');

  // U — set absolute via PUT
  step('UPDATE — PUT /inventory/:variantA  set available=200');
  snap('BEFORE', dbBefore);
  action(`PUT /inventory/${seed.variantA.slice(0, 8)}…  {quantity: 200}`);
  const upd = await http('PUT', `/inventory/${seed.variantA}`, {
    quantity: 200,
    note: 'CRUD test set 200',
  });
  const dbAfter = await fetchInventory(seed.variantA);
  snap('AFTER', dbAfter);
  diff(dbBefore, dbAfter);
  assert(upd.status === 200, 'PUT trả 200');
  assert(dbAfter.available === 200, 'DB.available = 200');
  assert(dbAfter.reserved === 0, 'reserved giữ nguyên = 0');
  assert(dbAfter.sold === 0, 'sold giữ nguyên = 0');

  // U — update low_stock_threshold
  step('UPDATE — set lowStockThreshold thành 50 (test threshold logic)');
  await http('PUT', `/inventory/${seed.variantA}`, {
    quantity: 200,
    lowStockThreshold: 50,
  });
  const afterThreshold = await fetchInventory(seed.variantA);
  snap('AFTER', afterThreshold);
  assert(
    afterThreshold.lowStockThreshold === 50,
    'lowStockThreshold cập nhật = 50',
  );

  // Verify movement was logged (ADJUST)
  step('VERIFY — Mỗi PUT inventory tạo 1 ADJUST movement record');
  const moves = await fetchMovements(seed.variantA);
  const adjusts = moves.filter((m) => m.type === 'ADJUST');
  log(`  ${C.dim}Movements của variant A: ${moves.length} (${adjusts.length} ADJUST)${C.reset}`);
  assert(adjusts.length >= 2, '≥2 movement ADJUST đã được log (2 lần PUT)');
}

async function testS3_02() {
  section('S3-02  MOVEMENTS  (lifecycle IMPORT → RESERVE → SELL → RELEASE → ADJUST)');

  // Reset variant B về trạng thái sạch để dễ tính toán
  step('SETUP — reset variant B về available=10, reserved=0, sold=0');
  await http('PUT', `/inventory/${seed.variantB}`, { quantity: 10 });
  let inv = await fetchInventory(seed.variantB);
  snap('STATE', inv);

  // IMPORT
  step('CREATE — POST /inventory/movements  IMPORT +5');
  snap('BEFORE', inv);
  action(`POST IMPORT 5`);
  await http('POST', '/inventory/movements', {
    variantId: seed.variantB,
    type: 'IMPORT',
    quantity: 5,
    note: 'CRUD IMPORT',
  });
  let next = await fetchInventory(seed.variantB);
  snap('AFTER', next);
  diff(inv, next);
  assert(next.available === inv.available + 5, 'IMPORT +5 → available tăng 5');
  inv = next;

  // RESERVE
  step('CREATE — POST /inventory/movements  RESERVE 4');
  snap('BEFORE', inv);
  action(`POST RESERVE 4`);
  await http('POST', '/inventory/movements', {
    variantId: seed.variantB,
    type: 'RESERVE',
    quantity: 4,
    note: 'CRUD RESERVE',
  });
  next = await fetchInventory(seed.variantB);
  snap('AFTER', next);
  diff(inv, next);
  assert(
    next.available === inv.available - 4 && next.reserved === inv.reserved + 4,
    'RESERVE 4 → available -4, reserved +4 (chuyển stock)',
  );
  inv = next;

  // SELL — chuyển từ reserved sang sold
  step('CREATE — POST /inventory/movements  SELL 2');
  snap('BEFORE', inv);
  action(`POST SELL 2`);
  await http('POST', '/inventory/movements', {
    variantId: seed.variantB,
    type: 'SELL',
    quantity: 2,
    note: 'CRUD SELL',
  });
  next = await fetchInventory(seed.variantB);
  snap('AFTER', next);
  diff(inv, next);
  assert(
    next.reserved === inv.reserved - 2 && next.sold === inv.sold + 2,
    'SELL 2 → reserved -2, sold +2',
  );
  inv = next;

  // RELEASE — phần còn lại của reserved về available
  step('CREATE — POST /inventory/movements  RELEASE 2');
  snap('BEFORE', inv);
  action(`POST RELEASE 2`);
  await http('POST', '/inventory/movements', {
    variantId: seed.variantB,
    type: 'RELEASE',
    quantity: 2,
    note: 'CRUD RELEASE',
  });
  next = await fetchInventory(seed.variantB);
  snap('AFTER', next);
  diff(inv, next);
  assert(
    next.reserved === inv.reserved - 2 && next.available === inv.available + 2,
    'RELEASE 2 → reserved -2, available +2',
  );
  inv = next;

  // ADJUST — set tuyệt đối
  step('CREATE — POST /inventory/movements  ADJUST → 99 (set tuyệt đối)');
  snap('BEFORE', inv);
  action(`POST ADJUST 99`);
  await http('POST', '/inventory/movements', {
    variantId: seed.variantB,
    type: 'ADJUST',
    quantity: 99,
    note: 'CRUD ADJUST',
  });
  next = await fetchInventory(seed.variantB);
  snap('AFTER', next);
  diff(inv, next);
  assert(
    next.available === 99 && next.reserved === inv.reserved && next.sold === inv.sold,
    'ADJUST 99 → available = 99, reserved/sold giữ nguyên',
  );

  // READ history
  step('READ — GET /inventory/movements?variantId=:variantB');
  const list = await http(
    'GET',
    `/inventory/movements?variantId=${seed.variantB}&limit=50`,
  );
  const payload = unwrap(list);
  log(`  ${C.dim}Movement log có ${payload.items.length} bản ghi cho variant B${C.reset}`);
  for (const m of payload.items.slice(0, 5)) {
    log(`    ${C.dim}- ${m.type.padEnd(8)} qty=${m.quantity}  ref=${m.referenceType || '—'}  note=${m.note || ''}${C.reset}`);
  }
  assert(list.status === 200, 'GET movements → 200');
  assert(
    payload.items.length >= 5,
    `≥5 record (IMPORT, RESERVE, SELL, RELEASE, ADJUST) — có ${payload.items.length}`,
  );

  // Filter by type
  step('FILTER — GET /inventory/movements?type=IMPORT');
  const filterImport = await http(
    'GET',
    `/inventory/movements?type=IMPORT&variantId=${seed.variantB}`,
  );
  const fpayload = unwrap(filterImport);
  log(`  ${C.dim}Chỉ IMPORT: ${fpayload.items.length}${C.reset}`);
  assert(
    fpayload.items.every((m) => m.type === 'IMPORT'),
    'Filter type=IMPORT trả đúng',
  );

  // Negative: RESERVE quá tồn
  step('NEGATIVE — RESERVE vượt available phải bị reject');
  snap('BEFORE', next);
  const overReserve = await http('POST', '/inventory/movements', {
    variantId: seed.variantB,
    type: 'RESERVE',
    quantity: 999_999,
  });
  log(`  ${C.dim}HTTP ${overReserve.status} (mong đợi 409)${C.reset}`);
  const stateAfter = await fetchInventory(seed.variantB);
  snap('AFTER', stateAfter);
  assert(overReserve.status === 409, 'RESERVE 999_999 → 409 Conflict');
  assert(
    stateAfter.available === next.available && stateAfter.reserved === next.reserved,
    'DB state KHÔNG đổi khi reserve fail (atomic)',
  );
}

async function testS4_01() {
  section('S4-01  CART CRUD');

  step('SETUP — set inventory A=100 để có stock dư');
  await http('PUT', `/inventory/${seed.variantA}`, { quantity: 100 });

  step('READ — GET /cart  (cart trống ban đầu)');
  let cart = await fetchCart(STUB_USER);
  snap('DB', { items: cart.items.length, total: 0 });
  const r1 = await http('GET', '/cart');
  const c1 = unwrap(r1);
  snap('API', { items: c1.items.length, total: c1.total });
  assert(r1.status === 200, 'GET /cart → 200');
  assert(c1.items.length === 0, 'Cart ban đầu = 0 items');

  step('CREATE — POST /cart/items  variantA × 2');
  snap('BEFORE', { items: 0 });
  action(`POST /cart/items {variantId: A, quantity: 2}`);
  const a1 = await http('POST', '/cart/items', {
    variantId: seed.variantA,
    quantity: 2,
  });
  cart = await fetchCart(STUB_USER);
  snap('AFTER (DB)', {
    items: cart.items.length,
    item0: cart.items[0],
  });
  const c2 = unwrap(a1);
  log(`  ${C.dim}API total: ${c2.total}  (PriceService stub: 100/đv → 2 × 100 = 200)${C.reset}`);
  assert(a1.status === 201 || a1.status === 200, 'POST → 2xx');
  assert(cart.items.length === 1, 'Cart có 1 item');
  assert(cart.items[0].quantity === 2, 'item.quantity = 2');
  assert(Number(c2.total) === 200, 'total API = 200 (= 2 × stub price 100)');

  step('UPDATE (MERGE) — POST cùng variantA × 3  →  quantity = 5');
  snap('BEFORE', { variantA_qty: cart.items[0].quantity });
  action(`POST /cart/items {variantId: A, quantity: 3}`);
  const a2 = await http('POST', '/cart/items', {
    variantId: seed.variantA,
    quantity: 3,
  });
  cart = await fetchCart(STUB_USER);
  snap('AFTER (DB)', {
    items: cart.items.length,
    variantA_qty: cart.items.find((i) => i.variantId === seed.variantA.slice(0,8)+'…')?.quantity,
  });
  const c3 = unwrap(a2);
  assert(cart.items.length === 1, 'Vẫn 1 item (merge chứ không tạo mới)');
  assert(cart.items[0].quantity === 5, 'Quantity merge → 5');
  assert(Number(c3.total) === 500, 'total API = 500 (= 5 × stub price 100)');

  step('CREATE — Thêm variantB × 1  (DB hiện available=99, threshold=5)');
  await http('PUT', `/inventory/${seed.variantB}`, { quantity: 50 });
  const a3 = await http('POST', '/cart/items', {
    variantId: seed.variantB,
    quantity: 1,
  });
  cart = await fetchCart(STUB_USER);
  log(`  ${C.dim}Cart hiện có ${cart.items.length} items (A: ${cart.items.find(i=>i.quantity===5)?.quantity}, B: ${cart.items.find(i=>i.quantity===1)?.quantity})${C.reset}`);
  assert(cart.items.length === 2, 'Cart có 2 items khác variant');

  step('UPDATE — PUT /cart/items/:id  {quantity: 7}');
  const itemA = cart.items.find((i) => i.quantity === 5);
  // Need full id — fetchCart truncates, fetch real id from DB
  const cFull = await db();
  const [rows] = await cFull.query(
    `SELECT id FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id=? AND status='ACTIVE' LIMIT 1) AND quantity=5`,
    [STUB_USER],
  );
  const itemAId = rows[0]?.id;
  snap('BEFORE', { quantity: 5 });
  action(`PUT /cart/items/${itemAId.slice(0,8)}… {quantity: 7}`);
  const upd = await http('PUT', `/cart/items/${itemAId}`, { quantity: 7 });
  cart = await fetchCart(STUB_USER);
  const updItem = cart.items.find((i) => i.quantity === 7);
  snap('AFTER (DB)', { quantity: updItem?.quantity });
  assert(upd.status === 200, 'PUT → 200');
  assert(updItem?.quantity === 7, 'DB.quantity = 7');

  step('DELETE — DELETE /cart/items/:id  (xoá variantA)');
  snap('BEFORE', { items: cart.items.length });
  action(`DELETE /cart/items/${itemAId.slice(0,8)}…`);
  const del = await http('DELETE', `/cart/items/${itemAId}`);
  cart = await fetchCart(STUB_USER);
  snap('AFTER (DB)', { items: cart.items.length });
  assert(del.status === 200, 'DELETE → 200');
  assert(cart.items.length === 1, 'Còn 1 item sau delete (variantB)');
  assert(
    !cart.items.find((i) => i.quantity === 7),
    'Item variantA biến mất khỏi DB',
  );
}

async function testS4_02() {
  section('S4-02  CART MERGE (guest → server)');

  step('SETUP — clear cart hiện tại + reset variant A=100, B=50');
  // Clear cart
  const cFull = await db();
  await cFull.query(
    `DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)`,
    [STUB_USER],
  );
  await cFull.query(`DELETE FROM carts WHERE user_id = ?`, [STUB_USER]);
  await http('PUT', `/inventory/${seed.variantA}`, { quantity: 100 });
  await http('PUT', `/inventory/${seed.variantB}`, { quantity: 50 });

  // Add A=2 to server cart
  step('SETUP — server cart: variantA × 2');
  await http('POST', '/cart/items', { variantId: seed.variantA, quantity: 2 });
  let cart = await fetchCart(STUB_USER);
  snap('STATE', { items: cart.items.length, A_qty: cart.items[0].quantity });

  // Merge guest: A × 3 (sẽ cộng dồn = 5) + B × 4 (mới)
  step('MERGE — POST /cart/merge  guest: [A×3, B×4]');
  snap('BEFORE', { items: cart.items.length });
  action(`POST /cart/merge {items: [{A, 3}, {B, 4}]}`);
  const merge = await http('POST', '/cart/merge', {
    items: [
      { variantId: seed.variantA, quantity: 3 },
      { variantId: seed.variantB, quantity: 4 },
    ],
  });
  cart = await fetchCart(STUB_USER);
  snap('AFTER (DB)', {
    items: cart.items.length,
    qtys: cart.items.map((i) => i.quantity).sort(),
  });
  const mp = unwrap(merge);
  log(`  ${C.dim}API total: ${mp.total}  (PriceService stub: 100 → 9 × 100 = 900)${C.reset}`);
  assert(merge.status === 200 || merge.status === 201, 'POST merge → 2xx');
  assert(cart.items.length === 2, 'Cart có 2 items (A merged, B mới)');
  const qtys = cart.items.map((i) => i.quantity).sort();
  assert(JSON.stringify(qtys) === '[4,5]', 'Quantities = [4, 5]  (A: 2+3=5, B: 0+4=4)');

  // Cap by stock test
  step('CAP — Merge với qty vượt stock (B available=46) → cap về stock');
  // Server có B=4, stock available=46 (50 - 4). Merge guest B=100 → tổng 104 → cap về 46 (do stock check)
  // Wait — `getAvailableStock` returns Inventory.available (not net after cart). Let me recalculate.
  // PUT đã set B available=50, sau khi add B×4 vào cart, available không đổi (chỉ giảm khi RESERVE).
  // Vậy available=50. Merge guest B=100 → total 4+100=104. Stock cap về 50.
  snap('BEFORE', { B_in_cart: 4, B_stock_available: 50 });
  action(`POST /cart/merge {items: [{B, 100}]}`);
  const cap = await http('POST', '/cart/merge', {
    items: [{ variantId: seed.variantB, quantity: 100 }],
  });
  cart = await fetchCart(STUB_USER);
  const bAfter = cart.items.find(
    (i) => i.variantId === seed.variantB.slice(0, 8) + '…',
  );
  snap('AFTER (DB)', { B_qty: bAfter?.quantity });
  assert(
    bAfter?.quantity === 50,
    'B.quantity cap về 50 (= stock available, không phải 104)',
  );
}

async function testS5_01() {
  section('S5-01  CREATE ORDER  (atomic transaction)');

  step('SETUP — clear cart + reset inventory + add 3 items mới');
  const cFull = await db();
  await cFull.query(
    `DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = ?)`,
    [STUB_USER],
  );
  await cFull.query(`DELETE FROM carts WHERE user_id = ?`, [STUB_USER]);
  await http('PUT', `/inventory/${seed.variantA}`, { quantity: 100 });
  await http('PUT', `/inventory/${seed.variantB}`, { quantity: 50 });

  // Add cart
  await http('POST', '/cart/items', { variantId: seed.variantA, quantity: 3 });
  await http('POST', '/cart/items', { variantId: seed.variantB, quantity: 2 });

  const invA0 = await fetchInventory(seed.variantA);
  const invB0 = await fetchInventory(seed.variantB);
  const cart0 = await fetchCart(STUB_USER);
  log('\n  CART trước checkout:');
  for (const it of cart0.items) {
    log(`    ${C.dim}- variant ${it.variantId}  qty=${it.quantity}  price=${it.price}${C.reset}`);
  }
  log('\n  INVENTORY trước:');
  snap('A', invA0);
  snap('B', invB0);

  step('CREATE — POST /orders');
  action('POST /orders {shippingAddress, phone: +84901234567}');
  const create = await http('POST', '/orders', {
    shippingAddress: '123 Đường Test, Quận 1, TP.HCM',
    phone: '+84901234567',
    note: 'CRUD test order',
  });
  const order = unwrap(create);
  log(`\n  ORDER tạo ra:`);
  snap('  ', {
    id: order.id.slice(0, 8) + '…',
    status: order.status,
    subtotal: order.subtotal,
    total: order.totalPrice,
    items: order.items?.length,
  });

  const invA1 = await fetchInventory(seed.variantA);
  const invB1 = await fetchInventory(seed.variantB);
  log('\n  INVENTORY sau checkout:');
  snap('A', invA1);
  snap('B', invB1);
  diff(invA0, invA1, ['available', 'reserved']);
  diff(invB0, invB1, ['available', 'reserved']);

  // Assertions
  assert(create.status === 201 || create.status === 200, 'POST /orders → 2xx');
  assert(order.status === 'PENDING', 'Order.status = PENDING');
  assert(order.items?.length === 2, 'Order có 2 items snapshot');
  assert(Number(order.subtotal) === 500, 'Subtotal = 500 (= 5 items × stub price 100). LƯU Ý: PriceService là stub.');
  assert(
    invA1.reserved === invA0.reserved + 3,
    `Inventory A.reserved: ${invA0.reserved} → ${invA1.reserved} (+3)`,
  );
  assert(
    invA1.available === invA0.available - 3,
    `Inventory A.available: ${invA0.available} → ${invA1.available} (-3)`,
  );
  assert(
    invB1.reserved === invB0.reserved + 2,
    `Inventory B.reserved: ${invB0.reserved} → ${invB1.reserved} (+2)`,
  );

  // Cart cũ phải CHECKED_OUT
  const [cartRow] = await cFull.query(
    `SELECT status FROM carts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    [STUB_USER],
  );
  // Sau khi GET /cart, cart mới ACTIVE đã được tạo. Cart cũ vẫn CHECKED_OUT.
  const [allCarts] = await cFull.query(
    `SELECT status FROM carts WHERE user_id = ?`,
    [STUB_USER],
  );
  log(`\n  Carts của user sau order: ${allCarts.map((c) => c.status).join(', ')}`);
  assert(
    allCarts.some((c) => c.status === 'CHECKED_OUT'),
    'Có ≥1 cart status = CHECKED_OUT (cart vừa được dùng)',
  );

  return order.id;
}

async function testS5_02(firstOrderId) {
  section('S5-02  LIST + DETAIL ORDER');

  // Tạo thêm 2 orders để test list pagination
  step('SETUP — tạo thêm 2 orders để có dữ liệu list');
  for (let i = 0; i < 2; i++) {
    await http('POST', '/cart/items', { variantId: seed.variantA, quantity: 1 });
    await http('POST', '/orders', {
      shippingAddress: `Addr ${i + 2}`,
      phone: '+84901234567',
    });
  }

  step('LIST — GET /orders?page=1&limit=10');
  const list = await http('GET', '/orders?page=1&limit=10');
  const lp = unwrap(list);
  log(`  ${C.dim}Trả ${lp.items.length} orders, total = ${lp.meta.total}${C.reset}`);
  for (const o of lp.items.slice(0, 5)) {
    log(`    ${C.dim}- ${o.id.slice(0, 8)}…  status=${o.status}  total=${o.totalPrice}${C.reset}`);
  }
  assert(list.status === 200, 'GET /orders → 200');
  assert(lp.items.length >= 3, '≥3 orders đã tạo');

  step('FILTER — GET /orders?status=PENDING');
  const filtered = await http('GET', '/orders?status=PENDING');
  const fp = unwrap(filtered);
  assert(
    fp.items.every((o) => o.status === 'PENDING'),
    `Tất cả ${fp.items.length} items đều PENDING`,
  );

  step('DETAIL — GET /orders/:firstOrderId');
  action(`GET /orders/${firstOrderId.slice(0, 8)}…`);
  const detail = await http('GET', `/orders/${firstOrderId}`);
  const od = unwrap(detail);
  log(`\n  Order detail:`);
  snap('  ', {
    id: od.id.slice(0, 8) + '…',
    status: od.status,
    items: od.items?.length,
    timeline: od.timeline?.length,
  });
  log(`\n  Timeline:`);
  for (const t of od.timeline ?? []) {
    log(`    ${C.dim}${t.fromStatus || '(none)'} → ${t.toStatus}  by ${t.actor}  note="${t.note || ''}"${C.reset}`);
  }
  assert(detail.status === 200, 'GET detail → 200');
  assert(od.id === firstOrderId, 'Đúng order');
  assert(Array.isArray(od.items) && od.items.length === 2, 'Detail có items (2 dòng)');
  assert(
    Array.isArray(od.timeline) && od.timeline.length >= 1,
    'Detail có timeline (≥1 entry)',
  );
}

async function testS5_03() {
  section('S5-03  ADMIN STATUS + USER CANCEL');

  step('SETUP — tạo 3 orders mới');
  const orderIds = [];
  for (let i = 0; i < 3; i++) {
    await http('PUT', `/inventory/${seed.variantA}`, { quantity: 100 });
    await http('POST', '/cart/items', {
      variantId: seed.variantA,
      quantity: 1,
    });
    const r = await http('POST', '/orders', {
      shippingAddress: `S5-03 #${i}`,
      phone: '+84901234567',
    });
    orderIds.push(unwrap(r).id);
  }
  log(`  ${C.dim}Created: ${orderIds.map((x) => x.slice(0, 8) + '…').join(', ')}${C.reset}`);

  // Admin cancel
  step('UPDATE — PUT /orders/:0/status  {status: CANCELLED}  (admin)');
  const inv0Before = await fetchInventory(seed.variantA);
  snap('BEFORE inv A', inv0Before);
  snap('BEFORE order', await fetchOrder(orderIds[0]));
  action(`PUT /orders/${orderIds[0].slice(0, 8)}…/status {status: CANCELLED}`);
  const cancel = await http('PUT', `/orders/${orderIds[0]}/status`, {
    status: 'CANCELLED',
    note: 'Admin CRUD test',
  });
  const inv0After = await fetchInventory(seed.variantA);
  const orderAfter = await fetchOrder(orderIds[0]);
  snap('AFTER inv A', inv0After);
  snap('AFTER order', orderAfter);
  diff(inv0Before, inv0After, ['available', 'reserved']);
  assert(cancel.status === 200, 'PUT status=CANCELLED → 200');
  assert(orderAfter.status === 'CANCELLED', 'DB.order.status = CANCELLED');
  assert(
    inv0After.reserved === inv0Before.reserved - 1,
    `Inventory.reserved giảm 1 (released stock)`,
  );
  assert(
    inv0After.available === inv0Before.available + 1,
    `Inventory.available tăng 1 (released stock)`,
  );

  // Bulk update
  step('BULK — POST /orders/bulk-status  (1 hợp lệ + 1 đã terminal)');
  action(`POST /orders/bulk-status {orderIds: [#1 PENDING, #0 CANCELLED], status: CANCELLED}`);
  const bulk = await http('POST', '/orders/bulk-status', {
    orderIds: [orderIds[1], orderIds[0]],
    status: 'CANCELLED',
    note: 'Bulk CRUD',
  });
  const bp = unwrap(bulk);
  log(`\n  Kết quả bulk:`);
  snap('  ', {
    total: bp.total,
    succeededCount: bp.succeededCount,
    failedCount: bp.failedCount,
  });
  log(`  ${C.dim}Failed: ${JSON.stringify(bp.failed)}${C.reset}`);
  assert(bulk.status === 200 || bulk.status === 201, 'POST bulk → 2xx');
  assert(bp.succeededCount === 1, '1 succeeded (order #1)');
  assert(bp.failedCount === 1, '1 failed (order #0 đã CANCELLED — terminal)');

  // User cancel
  step('USER CANCEL — POST /orders/:2/cancel');
  const o2Before = await fetchOrder(orderIds[2]);
  snap('BEFORE', { status: o2Before.status });
  action(`POST /orders/${orderIds[2].slice(0, 8)}…/cancel`);
  const userCancel = await http('POST', `/orders/${orderIds[2]}/cancel`, {
    note: 'User changed mind',
  });
  const o2After = await fetchOrder(orderIds[2]);
  snap('AFTER', { status: o2After.status });
  assert(
    userCancel.status === 200 || userCancel.status === 201,
    'User cancel → 2xx',
  );
  assert(o2After.status === 'CANCELLED', 'DB.status = CANCELLED');

  // Verify final state of all 3 orders
  step('VERIFY — Cả 3 orders đều CANCELLED');
  for (let i = 0; i < 3; i++) {
    const o = await fetchOrder(orderIds[i]);
    log(`  ${C.dim}order #${i} (${orderIds[i].slice(0, 8)}…)  status=${o.status}${C.reset}`);
    assert(o.status === 'CANCELLED', `Order #${i} = CANCELLED`);
  }
}

// ===========================================================================

async function main() {
  log(C.bold + `\nSmoke target: ${API_URL}` + C.reset);
  log(C.dim + `Seed file:    ${SEED_FILE}` + C.reset);
  log(
    C.dim +
      `Stub user:    ${STUB_USER}  (role=admin per stub auth)\n` +
      C.reset,
  );

  try {
    await testS3_01();
    await testS3_02();
    await testS4_01();
    await testS4_02();
    const firstOrderId = await testS5_01();
    await testS5_02(firstOrderId);
    await testS5_03();
  } catch (e) {
    log(`\n${C.red}UNEXPECTED ERROR: ${e.message}${C.reset}`);
    log(C.dim + e.stack + C.reset);
    failed++;
  } finally {
    if (conn) await conn.end();
  }

  log('\n' + '═'.repeat(72));
  log(
    C.bold +
      `Total: ${passed + failed}   ` +
      C.green +
      `Pass: ${passed}` +
      C.reset +
      C.bold +
      '   ' +
      C.red +
      `Fail: ${failed}` +
      C.reset,
  );
  if (failed > 0) {
    log('\n' + C.red + 'Failed assertions:' + C.reset);
    for (const f of failures) {
      log(`  - ${f.label}`);
      if (f.detail !== undefined) log(`    ${JSON.stringify(f.detail)}`);
    }
    process.exit(1);
  }
  log(C.green + C.bold + '\nALL PASS ✓' + C.reset);
}

main();
