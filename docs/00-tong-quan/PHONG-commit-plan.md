# Phong — Kế hoạch 1 commit gộp Sprint 3-5

> Nguồn task: [`docs/_reference/_E-COMMERCE — KẾ HOẠCH PHÁT TRIỂN SONG SONG BACKEND & FRONTEND.xlsx`](../_reference/_E-COMMERCE%20%20%E2%80%94%20%20K%E1%BA%BE%20HO%E1%BA%A0CH%20PH%C3%81T%20TRI%E1%BB%82N%20SONG%20SONG%20BACKEND%20%26%20FRONTEND.xlsx)
> Quy ước: **1 commit duy nhất** gói toàn bộ phần Phong (BE Sprint 3-5 + FE/Admin tích hợp). Không tách feat.

---

## 1. Phạm vi (chỉ task có tên Phong trong Excel)

| Module | Task ID | Tên | Nội dung |
|---|---|---|---|
| INVENTORY | S3-01 | Tồn kho | `GET/PUT /inventory/:variant_id`, `GET /inventory?low_stock=true` |
| INVENTORY | S3-02 | Movements | `POST /inventory/movements` (IMPORT/EXPORT/ADJUST), `GET /inventory/movements` |
| CART | S4-01 | Giỏ hàng | `GET /cart`, `POST/PUT/DELETE /cart/items` |
| CART | S4-02 | Cart Sync | Validate tồn kho khi add, clear cart sau checkout |
| ORDER | S5-01 | Tạo đơn | `POST /orders` (transaction: tạo order + trừ kho + xoá cart) |
| ORDER | S5-02 | Lịch sử đơn (user) | `GET /orders`, `GET /orders/:id` |
| ORDER | S5-03 | Quản lý đơn (admin) | `GET /orders?admin=1`, `PUT /orders/:id/status` |

**Extras đi kèm** (cần thiết để E2E task Phong, không tách commit riêng):
Voucher (apply trong order tx), Wishlist, Audit log, FE customer cart/order/voucher/wishlist, Admin inventory/order/voucher.

---

## 2. Commit duy nhất

### Message

```
feat(phong): Sprint 3-5 Inventory + Cart + Order với FE/Admin integration

Backend (NestJS + MikroORM):
- Inventory module [S3-01, S3-02]: CRUD tồn kho + movement log immutable
- Cart module [S4-01, S4-02]: CRUD + merge guest cart + validate tồn kho
- Order module [S5-01, S5-02, S5-03]: atomic checkout (order + trừ kho + xoá cart),
  state machine PENDING→CONFIRMED→SHIPPED→DELIVERED, admin scope
- Voucher: apply trong order tx với pessimistic_write lock chống oversell
- Wishlist: unique (user_id, product_id), endpoint /ids cho FE selector
- Audit log: best-effort em.fork() cho ORDER_STATUS_CHANGE
- Migrations: 20260510080727 (inventory+cart), 20260510081912 (order),
  20260512170000 (FK manual), 20260514120000 (voucher),
  20260514130000 (wishlist), 20260514160000 (audit)

Frontend (Next.js):
- apis/{cart,orders,vouchers,wishlist}.ts gọi BE Phong
- Redux slice cart + wishlist (localStorage persist)
- hooks/use-wishlist.ts bootstrap on login
- Trang /thanh-toan/ket-qua/[orderId]

Admin Dashboard (Vite + React):
- features/inventory: dashboard tồn kho + adjust form
- features/order: bảng quản lý + filter + cập nhật trạng thái
- features/voucher: CRUD + badge status

Verified:
- Backend typecheck pass, migration fresh OK
- E2E flow: register → login → add cart → create order → trừ kho đúng
- Domain unit tests pass (apply-movement, merge-carts, order-status-transition)

Refs: docs/_reference/_E-COMMERCE — KẾ HOẠCH PHÁT TRIỂN... xlsx (S3-01..S5-03)
```

### Files (đã filter chỉ phần Phong làm)

Lệnh add gọn — dùng pathspec theo module:

```bash
git checkout -b feat/phong/sprint-3-5-order-cart-inventory

# Backend — module + entity + migration của Phong
git add \
  backend/src/modules/inventory \
  backend/src/modules/cart \
  backend/src/modules/order \
  backend/src/modules/voucher \
  backend/src/modules/wishlist \
  backend/src/modules/audit \
  backend/src/entities/inventory.entity.ts \
  backend/src/entities/inventory-movement.entity.ts \
  backend/src/entities/cart.entity.ts \
  backend/src/entities/cart-item.entity.ts \
  backend/src/entities/order.entity.ts \
  backend/src/entities/order-item.entity.ts \
  backend/src/entities/order-status-history.entity.ts \
  backend/src/entities/voucher.entity.ts \
  backend/src/entities/wishlist.entity.ts \
  backend/src/entities/audit-log.entity.ts \
  backend/src/databases/migrations/Migration20260510080727.ts \
  backend/src/databases/migrations/Migration20260510081912.ts \
  backend/src/databases/migrations/Migration20260512170000.ts \
  backend/src/databases/migrations/Migration20260514120000.ts \
  backend/src/databases/migrations/Migration20260514130000.ts \
  backend/src/databases/migrations/Migration20260514160000.ts

# Frontend customer — cart/order/voucher/wishlist
git add \
  frontend/src/apis/cart.ts \
  frontend/src/apis/orders.ts \
  frontend/src/apis/vouchers.ts \
  frontend/src/apis/wishlist.ts \
  frontend/src/stores/cart \
  frontend/src/stores/wishlist \
  frontend/src/hooks/use-wishlist.ts \
  frontend/src/lib/order-status-vn.ts \
  "frontend/src/app/(public)/thanh-toan/ket-qua"

# Admin dashboard — inventory/order/voucher
git add \
  adminDashBoard/src/features/inventory \
  adminDashBoard/src/features/order \
  adminDashBoard/src/features/voucher

# Plan này
git add docs/00-tong-quan/PHONG-commit-plan.md
```

> **Lưu ý**: file người khác (auth của Nhi, product của Tiến, category của Tâm, post/banner/rbac/settings, các file CI/Docker/README chung) **không add** trong commit này — để các bạn khác tự commit phần của họ.

---

## 3. Verify trước khi commit

```bash
# 1. Backend typecheck
cd backend && yarn tsc --noEmit

# 2. Migration dry-run
yarn mikro-orm migration:up --dry-run

# 3. Unit test domain logic (3 file spec)
yarn test inventory/domain cart/domain order/domain

# 4. Smoke E2E (BE đang chạy port 3003)
curl -X POST localhost:3003/auth/register -d '{"email":"phong@test.io","password":"Test1234","displayName":"Phong"}'
TOKEN=$(curl -s -X POST localhost:3003/auth/login -d '{"email":"phong@test.io","password":"Test1234"}' | jq -r .data.accessToken)
curl -H "Authorization: Bearer $TOKEN" localhost:3003/cart                                    # cart trống
curl -X POST -H "Authorization: Bearer $TOKEN" localhost:3003/cart/items -d '{"variantId":"<id>","quantity":2}'
curl -X POST -H "Authorization: Bearer $TOKEN" localhost:3003/orders -d '{"addressId":"<id>","paymentType":"COD"}'
```

Pass 4 bước trên → tự tin commit.

---

## 4. Commit + push

```bash
git commit -m "$(cat <<'EOF'
feat(phong): Sprint 3-5 Inventory + Cart + Order với FE/Admin integration

[... full message như mục 2 ...]
EOF
)"

git push -u origin feat/phong/sprint-3-5-order-cart-inventory

gh pr create \
  --title "feat(phong): Sprint 3-5 Inventory/Cart/Order + Growth modules" \
  --body "Implements S3-01, S3-02, S4-01, S4-02, S5-01, S5-02, S5-03 + Voucher/Wishlist/Audit"
```

---

## 5. Risk

| Risk | Giảm thiểu |
|---|---|
| `git add` lỡ kéo file người khác | Add theo path từng module, **KHÔNG dùng `git add .`** |
| Migration order sai khi rebuild DB | Verify `migration:fresh` ở sandbox trước khi push |
| Voucher race condition khi nhiều user apply | `pessimistic_write` lock trong `applyAndConsumeWithinTx()` ✓ |
| Audit log block parent tx nếu DB down | `em.fork()` + try/catch best-effort ✓ |

---

_Author: Phong · Cập nhật: 2026-05-13 · 1 commit, không tách feat_
