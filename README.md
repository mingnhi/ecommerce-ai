# Ecommerce AI Ecosystem 🚀

Chào mừng bạn đến với **Ecommerce AI Ecosystem**, một nền tảng thương mại điện tử hiện đại, tích hợp trí tuệ nhân tạo, được thiết kế để xử lý quy mô lớn với hiệu năng cao. Hệ thống bao gồm 3 thành phần chính: **Customer Frontend**, **Admin Dashboard**, và **Core Backend API**.

---

## 🏛️ Kiến trúc Hệ thống (Architecture)

Hệ thống được xây dựng theo mô hình Monorepo (đơn giản hóa quản lý) với các công nghệ tiên tiến nhất:

- **Frontend (Khách hàng):** [Next.js 16 (React 19)](./frontend) - Tối ưu SEO, trải nghiệm mượt mà, hỗ trợ Chatbot AI.
- **Admin Dashboard (Quản trị):** [React 19 + Vite 8](./adminDashBoard) - Giao diện quản lý tồn kho, đơn hàng và khách hàng chuyên sâu.
- **Backend (API lõi):** [NestJS 10](./backend) - Xử lý logic nghiệp vụ, bảo mật, và tích hợp AI.
- **Database:** MySQL với [MikroORM 6](./backend/src/config/mikro-orm.config.ts).

---

## 🛠️ Công nghệ Sử dụng (Tech Stack)

### Core Stack
| Thành phần | Công nghệ chính |
| :--- | :--- |
| **Languages** | TypeScript (ES2022+) |
| **Frontend Frameworks** | Next.js 15+, React 19, Vite 8 |
| **Backend Framework** | NestJS 10 |
| **ORM / Database** | MikroORM 6, MySQL 8 |
| **Styling** | Tailwind CSS 4, Shadcn UI |
| **State Management** | Zustand, TanStack Query |

### AI Features
- Chatbot hỗ trợ khách hàng tích hợp sẵn.
- Gợi ý sản phẩm thông minh (Đang phát triển).

---

## 📂 Cấu trúc Thư mục (Project Structure)

```bash
.
├── adminDashBoard/     # Quản trị viên (Vite + React)
├── backend/            # API Server (NestJS)
├── frontend/           # Website bán hàng (Next.js)
├── docs/               # Tài liệu hệ thống chi tiết
└── plan.md             # Kế hoạch phát triển dự án
```

---

## 🚀 Bắt đầu (Getting Started)

Xem hướng dẫn chi tiết tại: [**Hướng dẫn cài đặt & Chạy dự án**](./docs/SETUP.md)

1. **Backend:** Cấu hình `.env`, cài đặt dependencies và chạy migration.
2. **Frontend:** Cài đặt dependencies và chạy môi trường dev.
3. **Admin:** Cài đặt dependencies và chạy môi trường dev.

---

## 📖 Tài liệu Chi tiết (Documentation)

- [**Cẩm nang phát triển (Development Guide)**](./docs/DEVELOPMENT_GUIDE.md) - **Lộ trình 6 Sprints & Quy chuẩn kỹ thuật.**
- [**Kiến trúc chi tiết (Architecture)**](./docs/ARCHITECTURE.md)
- [**Tham chiếu API (API Reference)**](./docs/API_REFERENCE.md)
- [**Sơ đồ Cơ sở Dữ liệu (Database Schema)**](./docs/DATABASE_SCHEMA.md)

---

## 🤝 Quy trình Phát triển (Workflow)

- **Git Flow:** Sử dụng các branch tính năng (`feature/`), fix lỗi (`fix/`).
- **Coding Standard:** Linting với ESLint và Format với Prettier.
- **Testing:** Unit test với Jest trong Backend.

---

*Dự án đang trong quá trình phát triển tích cực.*
