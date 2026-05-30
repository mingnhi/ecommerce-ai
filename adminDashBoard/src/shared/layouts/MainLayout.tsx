import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { AppSidebar } from "@/shared/layouts/sidebar/AppSidebar";

type Crumb = { label: string; href?: string };

const LABELS: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/cart": "Giỏ hàng",
  "/orders": "Đơn hàng",
  "/inventory": "Tồn kho",
  "/inventory/history": "Lịch sử kho",
  "/categories": "Danh mục",
  "/products": "Sản phẩm",
  "/roles": "Vai trò",
  "/permissions": "Quyền hạn",
  "/users": "Người dùng",
  "/account/profile": "Thông tin tài khoản",
  "/account/password": "Đổi mật khẩu",
  "/403": "Không có quyền truy cập",
};

function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/products/create") {
    return [
      { label: "Sản phẩm", href: "/products" },
      { label: "Tạo sản phẩm" },
    ];
  }

  if (/^\/products\/[^/]+\/edit$/.test(pathname)) {
    return [
      { label: "Sản phẩm", href: "/products" },
      { label: "Chỉnh sửa sản phẩm" },
    ];
  }

  if (/^\/products\/[^/]+$/.test(pathname)) {
    return [
      { label: "Sản phẩm", href: "/products" },
      { label: "Chi tiết sản phẩm" },
    ];
  }

  const label = LABELS[pathname] ?? (pathname === "/" ? "Tổng quan" : "Không tìm thấy");
  return [{ label }];
}

const MainLayout = () => {
  const { pathname } = useLocation();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-sky-500/10 bg-card/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
          <SidebarTrigger className="-ml-0.5 hover:cursor-pointer" />

          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Quản trị</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {crumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="contents">
                  <BreadcrumbSeparator className="hidden sm:inline-flex" />
                  <BreadcrumbItem>
                    {crumb.href && index < crumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="font-medium text-foreground">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex min-h-[calc(100svh-3.5rem)] flex-1 flex-col overflow-y-auto bg-slate-50/80 p-4 md:min-h-[calc(100svh-4rem)] md:p-6 dark:bg-background">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
