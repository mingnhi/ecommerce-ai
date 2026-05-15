const API_URL = process.env.API_URL || 'http://localhost:3003';

let passed = 0;
let failed = 0;
const failures = [];

function log(msg) {
  process.stdout.write(msg + '\n');
}

async function http(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function assert(cond, label, detail) {
  if (cond) {
    passed++;
    log(`  PASS  ${label}`);
  } else {
    failed++;
    failures.push({ label, detail });
    log(`  FAIL  ${label}`);
    if (detail !== undefined) log(`        ${JSON.stringify(detail)}`);
  }
}

function section(title) {
  log(`\n=== ${title} ===`);
}

async function getFirstVariantId() {
  const { status, data } = await http('GET', '/inventory?limit=10');
  if (status !== 200) throw new Error(`GET /inventory failed: ${status}`);
  const payload = data?.data ?? data;
  const items = payload?.items ?? [];
  if (!items.length) {
    throw new Error('DB chưa có inventory nào — hãy seed trước khi test.');
  }
  return items[0].variantId;
}

async function getTwoVariantIds() {
  const { data } = await http('GET', '/inventory?limit=10');
  const payload = data?.data ?? data;
  const items = payload?.items ?? [];
  if (items.length < 2) return [items[0]?.variantId, null];
  return [items[0].variantId, items[1].variantId];
}

async function clearCart() {
  const { data } = await http('GET', '/cart');
  const cart = data?.data ?? data;
  for (const it of cart?.items ?? []) {
    await http('DELETE', `/cart/items/${it.id}`);
  }
}

// ---------------------------------------------------------------------------

async function testS3_01_Inventory(variantId) {
  section('S3-01 INVENTORY');

  // GET list
  const list = await http('GET', '/inventory?page=1&limit=5');
  assert(list.status === 200, 'GET /inventory trả 200', list.status);
  const listPayload = list.data?.data ?? list.data;
  assert(Array.isArray(listPayload?.items), 'GET /inventory có items array');
  assert(listPayload?.meta?.page === 1, 'GET /inventory meta.page = 1');

  // GET filter low_stock
  const lowStock = await http('GET', '/inventory?low_stock=true');
  assert(lowStock.status === 200, 'GET /inventory?low_stock=true trả 200');

  // GET by variant id
  const detail = await http('GET', `/inventory/${variantId}`);
  assert(detail.status === 200, 'GET /inventory/:variantId trả 200');
  const detailPayload = detail.data?.data ?? detail.data;
  assert(
    detailPayload?.variantId === variantId,
    'GET /inventory/:variantId trả đúng variant',
  );
  assert(
    typeof detailPayload?.available === 'number',
    'inventory dto có field available (number)',
  );
  assert(
    typeof detailPayload?.lowStock === 'boolean',
    'inventory dto có field lowStock (boolean)',
  );

  // PUT update — set absolute 250 to ensure plenty stock for cart/order tests
  const update = await http('PUT', `/inventory/${variantId}`, {
    quantity: 250,
    note: 'smoke test set 250',
  });
  assert(
    update.status === 200,
    'PUT /inventory/:variantId — set absolute trả 200',
    update.data,
  );
  const updateInv = (update.data?.data ?? update.data)?.inventory;
  assert(
    updateInv?.available === 250,
    'PUT inventory cập nhật available = 250',
    updateInv,
  );

  // Negative: PUT với quantity âm
  const negQty = await http('PUT', `/inventory/${variantId}`, { quantity: -1 });
  assert(
    negQty.status === 400,
    'PUT inventory với quantity âm → 400',
    negQty.status,
  );
}

async function testS3_02_Movements(variantId) {
  section('S3-02 MOVEMENTS');

  // POST IMPORT +10
  const importMv = await http('POST', '/inventory/movements', {
    variantId,
    type: 'IMPORT',
    quantity: 10,
    note: 'smoke import',
  });
  assert(
    importMv.status === 201 || importMv.status === 200,
    'POST /inventory/movements IMPORT trả 2xx',
    importMv.status,
  );

  // POST RESERVE 5
  const reserve = await http('POST', '/inventory/movements', {
    variantId,
    type: 'RESERVE',
    quantity: 5,
    note: 'smoke reserve',
  });
  assert(
    reserve.status === 201 || reserve.status === 200,
    'POST /inventory/movements RESERVE trả 2xx',
    reserve.status,
  );

  // POST RELEASE 5 — undo
  const release = await http('POST', '/inventory/movements', {
    variantId,
    type: 'RELEASE',
    quantity: 5,
    note: 'smoke release',
  });
  assert(
    release.status === 201 || release.status === 200,
    'POST /inventory/movements RELEASE trả 2xx',
  );

  // Negative: RESERVE quá tồn kho
  const overReserve = await http('POST', '/inventory/movements', {
    variantId,
    type: 'RESERVE',
    quantity: 99_999_999,
  });
  assert(
    overReserve.status === 409,
    'POST RESERVE vượt tồn kho → 409 Conflict',
    overReserve.status,
  );

  // Negative: type không hợp lệ
  const badType = await http('POST', '/inventory/movements', {
    variantId,
    type: 'NOT_A_TYPE',
    quantity: 1,
  });
  assert(badType.status === 400, 'POST với type sai → 400', badType.status);

  // GET history (mặc định)
  const hist = await http('GET', '/inventory/movements?limit=10');
  assert(hist.status === 200, 'GET /inventory/movements trả 200');
  const histPayload = hist.data?.data ?? hist.data;
  assert(
    Array.isArray(histPayload?.items),
    'GET movements có items array',
  );
  assert(
    (histPayload?.items?.length ?? 0) >= 3,
    'GET movements có ít nhất 3 record (import+reserve+release vừa tạo)',
    histPayload?.items?.length,
  );

  // GET filter by variantId
  const filterVar = await http(
    'GET',
    `/inventory/movements?variantId=${variantId}`,
  );
  assert(filterVar.status === 200, 'GET movements filter variantId trả 200');
  const filterPayload = filterVar.data?.data ?? filterVar.data;
  const allMatch = (filterPayload?.items ?? []).every(
    (m) => m.variantId === variantId,
  );
  assert(allMatch, 'GET movements filter chỉ trả về variant đó');

  // GET filter by type
  const filterType = await http('GET', '/inventory/movements?type=IMPORT');
  assert(filterType.status === 200, 'GET movements filter type=IMPORT trả 200');
  const typePayload = filterType.data?.data ?? filterType.data;
  const allImport = (typePayload?.items ?? []).every((m) => m.type === 'IMPORT');
  assert(allImport, 'GET movements filter chỉ trả về type=IMPORT');
}

async function testS4_01_Cart(variantId, variantId2) {
  section('S4-01 CART');

  await clearCart();

  // GET cart rỗng
  const empty = await http('GET', '/cart');
  assert(empty.status === 200, 'GET /cart trả 200');
  const emptyPayload = empty.data?.data ?? empty.data;
  assert(
    (emptyPayload?.items?.length ?? 0) === 0,
    'GET /cart ban đầu rỗng (sau clear)',
  );

  // POST add item, quantity 2
  const add1 = await http('POST', '/cart/items', { variantId, quantity: 2 });
  assert(add1.status === 201 || add1.status === 200, 'POST /cart/items trả 2xx');
  const add1Payload = add1.data?.data ?? add1.data;
  assert(
    add1Payload?.items?.[0]?.quantity === 2,
    'Item vừa add có quantity = 2',
    add1Payload?.items,
  );

  // POST add lại cùng variant → merge thành 5
  const add2 = await http('POST', '/cart/items', { variantId, quantity: 3 });
  const add2Payload = add2.data?.data ?? add2.data;
  const merged = add2Payload?.items?.find((i) => i.variantId === variantId);
  assert(merged?.quantity === 5, 'POST cùng variant → merge thành 5', merged);

  // PUT update qty
  const itemId = merged.id;
  const upd = await http('PUT', `/cart/items/${itemId}`, { quantity: 7 });
  assert(upd.status === 200, 'PUT /cart/items/:id trả 200', upd.data);
  const updPayload = upd.data?.data ?? upd.data;
  const updItem = updPayload?.items?.find((i) => i.id === itemId);
  assert(updItem?.quantity === 7, 'PUT cập nhật quantity = 7');

  // Add variant thứ 2 (nếu có)
  if (variantId2) {
    const add3 = await http('POST', '/cart/items', {
      variantId: variantId2,
      quantity: 1,
    });
    const add3Payload = add3.data?.data ?? add3.data;
    assert(
      add3Payload?.items?.length === 2,
      'POST variant khác → cart có 2 items',
    );
  }

  // DELETE
  const del = await http('DELETE', `/cart/items/${itemId}`);
  assert(del.status === 200, 'DELETE /cart/items/:id trả 200');
  const delPayload = del.data?.data ?? del.data;
  const stillThere = delPayload?.items?.find((i) => i.id === itemId);
  assert(!stillThere, 'DELETE thực sự xoá item khỏi cart');

  // Negative: add variant không tồn tại
  const fakeVar = '00000000-0000-0000-0000-000000000001';
  const badVar = await http('POST', '/cart/items', {
    variantId: fakeVar,
    quantity: 1,
  });
  assert(
    badVar.status === 400 || badVar.status === 404,
    'POST cart variant không tồn tại → 400/404',
    badVar.status,
  );

  // Negative: qty vượt tồn kho
  const overQty = await http('POST', '/cart/items', {
    variantId,
    quantity: 999,
  });
  assert(
    overQty.status === 409 || overQty.status === 400,
    'POST cart qty vượt stock → 409/400',
    overQty.status,
  );

  // Negative: qty <= 0
  const zeroQty = await http('POST', '/cart/items', {
    variantId,
    quantity: 0,
  });
  assert(zeroQty.status === 400, 'POST cart qty=0 → 400', zeroQty.status);
}

async function testS4_02_Merge(variantId, variantId2) {
  section('S4-02 CART MERGE');

  await clearCart();

  // Add 1 item vào server cart
  await http('POST', '/cart/items', { variantId, quantity: 2 });

  // Merge guest cart: cùng variantId qty 3 (=> 5) + variant2 mới qty 1
  const guestItems = [{ variantId, quantity: 3 }];
  if (variantId2) guestItems.push({ variantId: variantId2, quantity: 1 });

  const merge = await http('POST', '/cart/merge', { items: guestItems });
  assert(merge.status === 201 || merge.status === 200, 'POST /cart/merge trả 2xx');
  const mergePayload = merge.data?.data ?? merge.data;
  const v1 = mergePayload?.items?.find((i) => i.variantId === variantId);
  assert(v1?.quantity === 5, 'Merge: variant trùng cộng dồn (2+3=5)', v1);

  if (variantId2) {
    const v2 = mergePayload?.items?.find((i) => i.variantId === variantId2);
    assert(v2?.quantity === 1, 'Merge: variant mới được thêm với qty=1', v2);
  }

  // Merge với qty vượt stock → bị cap về stock available.
  // DTO giới hạn quantity ≤ 999, nên không thể gửi 99_999. Thay vào đó:
  // set inventory available=5 rồi merge qty=10 → service phải cap còn 5.
  await clearCart();
  const setLow = await http('PUT', `/inventory/${variantId}`, { quantity: 5 });
  assert(setLow.status === 200, 'Setup: PUT inventory available=5 cho cap test');

  const cap = await http('POST', '/cart/merge', {
    items: [{ variantId, quantity: 10 }],
  });
  const capPayload = cap.data?.data ?? cap.data;
  const capped = capPayload?.items?.find((i) => i.variantId === variantId);
  assert(
    capped?.quantity === 5,
    'Merge qty=10 với stock=5 → cap về 5',
    capped,
  );

  // Khôi phục stock cao để các test sau (S5-01, S5-03) còn đủ stock.
  await http('PUT', `/inventory/${variantId}`, { quantity: 250 });
}

async function testS5_01_CreateOrder(variantId) {
  section('S5-01 CREATE ORDER');

  await clearCart();
  await http('POST', '/cart/items', { variantId, quantity: 2 });

  // Snapshot inventory trước
  const before = await http('GET', `/inventory/${variantId}`);
  const beforePayload = before.data?.data ?? before.data;
  const reservedBefore = beforePayload?.reserved ?? 0;

  // POST /orders — phone phải pass IsPhoneNumber('VN')
  const create = await http('POST', '/orders', {
    shippingAddress: '123 Đường Test, Quận 1, TP.HCM',
    phone: '+84901234567',
    note: 'Smoke test order',
  });
  assert(
    create.status === 201 || create.status === 200,
    'POST /orders trả 2xx',
    create.data,
  );
  const order = create.data?.data ?? create.data;
  assert(typeof order?.id === 'string', 'Order có id', order);
  assert(order?.status === 'PENDING', 'Order mới = PENDING', order?.status);
  assert(
    Number(order?.subtotal) > 0,
    'Order có subtotal > 0',
    order?.subtotal,
  );
  assert(
    Array.isArray(order?.items) && order.items.length === 1,
    'Order có 1 item',
  );

  // Inventory.reserved phải tăng đúng 2
  const after = await http('GET', `/inventory/${variantId}`);
  const afterPayload = after.data?.data ?? after.data;
  assert(
    afterPayload?.reserved === reservedBefore + 2,
    `Inventory.reserved tăng từ ${reservedBefore} → ${reservedBefore + 2}`,
    { before: reservedBefore, after: afterPayload?.reserved },
  );

  // Cart phải bị đánh dấu CHECKED_OUT → GET /cart sẽ tạo cart mới (empty)
  const cartAfter = await http('GET', '/cart');
  const cartAfterPayload = cartAfter.data?.data ?? cartAfter.data;
  assert(
    (cartAfterPayload?.items?.length ?? 0) === 0,
    'Cart sau checkout = active cart rỗng (cart cũ đã CHECKED_OUT)',
  );

  // Negative: tạo order khi cart rỗng
  const emptyOrder = await http('POST', '/orders', {
    shippingAddress: '123 Test',
    phone: '+84901234567',
  });
  assert(
    emptyOrder.status === 409,
    'POST /orders với cart rỗng → 409',
    emptyOrder.status,
  );

  // Negative: phone format sai
  await http('POST', '/cart/items', { variantId, quantity: 1 });
  const badPhone = await http('POST', '/orders', {
    shippingAddress: '123 Test',
    phone: 'not-a-phone',
  });
  assert(badPhone.status === 400, 'POST /orders phone sai → 400', badPhone.status);

  return order.id;
}

async function testS5_02_ListDetail(orderId) {
  section('S5-02 LIST + DETAIL ORDER');

  // GET list
  const list = await http('GET', '/orders?page=1&limit=10');
  assert(list.status === 200, 'GET /orders trả 200');
  const listPayload = list.data?.data ?? list.data;
  assert(Array.isArray(listPayload?.items), 'GET /orders có items array');
  assert(listPayload?.meta?.page === 1, 'GET /orders meta.page = 1');

  // GET filter status
  const filter = await http('GET', '/orders?status=PENDING');
  assert(filter.status === 200, 'GET /orders?status=PENDING trả 200');
  const filterPayload = filter.data?.data ?? filter.data;
  const allPending = (filterPayload?.items ?? []).every(
    (o) => o.status === 'PENDING',
  );
  assert(allPending, 'GET /orders filter chỉ trả PENDING');

  // GET detail
  const detail = await http('GET', `/orders/${orderId}`);
  assert(detail.status === 200, 'GET /orders/:id trả 200');
  const detailPayload = detail.data?.data ?? detail.data;
  assert(detailPayload?.id === orderId, 'Detail trả đúng order');
  assert(Array.isArray(detailPayload?.items), 'Detail có items array');
  assert(
    Array.isArray(detailPayload?.timeline) && detailPayload.timeline.length >= 1,
    'Detail có timeline (≥1 entry)',
    detailPayload?.timeline,
  );

  // GET detail không tồn tại
  const notFound = await http(
    'GET',
    '/orders/00000000-0000-0000-0000-0000000000aa',
  );
  assert(notFound.status === 404, 'GET /orders/:id không tồn tại → 404');
}

async function testS5_03_AdminAndCancel(variantId) {
  section('S5-03 ADMIN STATUS + CANCEL');

  // Tạo 2 đơn để test cancel + bulk
  await clearCart();
  await http('POST', '/cart/items', { variantId, quantity: 1 });
  const r1 = await http('POST', '/orders', {
    shippingAddress: '123 Test',
    phone: '+84901234567',
  });
  const order1 = (r1.data?.data ?? r1.data)?.id;

  await http('POST', '/cart/items', { variantId, quantity: 1 });
  const r2 = await http('POST', '/orders', {
    shippingAddress: '456 Test',
    phone: '+84901234567',
  });
  const order2 = (r2.data?.data ?? r2.data)?.id;

  await http('POST', '/cart/items', { variantId, quantity: 1 });
  const r3 = await http('POST', '/orders', {
    shippingAddress: '789 Test',
    phone: '+84901234567',
  });
  const order3 = (r3.data?.data ?? r3.data)?.id;

  // Negative: PUT status=CONFIRMED (chỉ SYSTEM mới được, ADMIN không được)
  const adminToConfirmed = await http('PUT', `/orders/${order1}/status`, {
    status: 'CONFIRMED',
  });
  assert(
    adminToConfirmed.status === 409,
    'PUT status=CONFIRMED bởi admin → 409 (chỉ SYSTEM)',
    adminToConfirmed.status,
  );

  // Negative: PUT status sai enum
  const badStatus = await http('PUT', `/orders/${order1}/status`, {
    status: 'WRONG_STATUS',
  });
  assert(
    badStatus.status === 400,
    'PUT status invalid enum → 400',
    badStatus.status,
  );

  // Snapshot inventory trước cancel
  const invBefore = await http('GET', `/inventory/${variantId}`);
  const reservedBefore = (invBefore.data?.data ?? invBefore.data)?.reserved;

  // PUT status=CANCELLED (admin) — hợp lệ từ PENDING
  const cancel = await http('PUT', `/orders/${order1}/status`, {
    status: 'CANCELLED',
    note: 'Admin cancel smoke',
  });
  assert(
    cancel.status === 200,
    'PUT status=CANCELLED bởi admin (từ PENDING) → 200',
    cancel.data,
  );
  const cancelPayload = cancel.data?.data ?? cancel.data;
  assert(
    cancelPayload?.status === 'CANCELLED',
    'Order chuyển sang CANCELLED',
  );

  // Inventory phải release
  const invAfter = await http('GET', `/inventory/${variantId}`);
  const reservedAfter = (invAfter.data?.data ?? invAfter.data)?.reserved;
  assert(
    reservedAfter === reservedBefore - 1,
    `Inventory.reserved giảm sau CANCELLED: ${reservedBefore} → ${reservedAfter}`,
  );

  // Bulk: order2 hợp lệ (CANCEL từ PENDING), order1 đã CANCELLED → fail
  const bulk = await http('POST', '/orders/bulk-status', {
    orderIds: [order2, order1],
    status: 'CANCELLED',
    note: 'Bulk smoke',
  });
  assert(bulk.status === 201 || bulk.status === 200, 'POST bulk-status trả 2xx');
  const bulkPayload = bulk.data?.data ?? bulk.data;
  assert(
    bulkPayload?.succeededCount === 1 && bulkPayload?.failedCount === 1,
    `Bulk: 1 succeeded (order2), 1 failed (order1 đã CANCELLED)`,
    bulkPayload,
  );
  assert(
    bulkPayload?.succeeded?.includes(order2),
    'Bulk: order2 nằm trong succeeded',
  );
  assert(
    bulkPayload?.failed?.[0]?.orderId === order1,
    'Bulk: order1 nằm trong failed',
    bulkPayload?.failed,
  );

  // Customer cancel (POST /orders/:id/cancel) — order3 còn PENDING
  const userCancel = await http('POST', `/orders/${order3}/cancel`, {
    note: 'Customer cancel smoke',
  });
  assert(
    userCancel.status === 201 || userCancel.status === 200,
    'POST /orders/:id/cancel (user) trả 2xx',
    userCancel.data,
  );
  const userCancelPayload = userCancel.data?.data ?? userCancel.data;
  assert(
    userCancelPayload?.status === 'CANCELLED',
    'Order3 chuyển sang CANCELLED qua user cancel',
  );

  // Cancel lần 2 → fail (terminal state)
  const cancelAgain = await http('POST', `/orders/${order3}/cancel`, {});
  assert(
    cancelAgain.status === 409,
    'POST cancel order đã CANCELLED → 409',
    cancelAgain.status,
  );
}

// ---------------------------------------------------------------------------

async function main() {
  log(`Smoke test target: ${API_URL}`);

  let variantId, variantId2;
  try {
    [variantId, variantId2] = await getTwoVariantIds();
    log(`Variant chính: ${variantId}`);
    if (variantId2) log(`Variant phụ:   ${variantId2}`);
    else log('(chỉ có 1 variant trong DB — sẽ skip các assert cần 2 variant)');
  } catch (e) {
    log(`FATAL: ${e.message}`);
    process.exit(2);
  }

  try {
    await testS3_01_Inventory(variantId);
    await testS3_02_Movements(variantId);
    await testS4_01_Cart(variantId, variantId2);
    await testS4_02_Merge(variantId, variantId2);
    const orderId = await testS5_01_CreateOrder(variantId);
    await testS5_02_ListDetail(orderId);
    await testS5_03_AdminAndCancel(variantId);
  } catch (e) {
    log(`\nUNEXPECTED ERROR: ${e.message}`);
    log(e.stack);
    failed++;
  }

  log(`\n========================`);
  log(`Total: ${passed + failed}   Pass: ${passed}   Fail: ${failed}`);
  if (failed > 0) {
    log(`\nFailed assertions:`);
    for (const f of failures) {
      log(`  - ${f.label}`);
      if (f.detail !== undefined) log(`    ${JSON.stringify(f.detail)}`);
    }
    process.exit(1);
  }
  log(`ALL PASS`);
}

main();
