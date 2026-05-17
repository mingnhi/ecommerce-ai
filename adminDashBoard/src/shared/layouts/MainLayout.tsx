import { Link, Outlet, useLocation } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar"
import { AppSidebar } from "@/shared/layouts/sidebar/AppSidebar"

const LABELS: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/cart": "Giỏ hàng",
  "/orders": "Đơn hàng",
}

function breadcrumbLabel(pathname: string) {
  if (LABELS[pathname]) return LABELS[pathname]
  if (pathname === "/") return "Tổng quan"
  if (pathname.startsWith("/products/")) return "Sản phẩm"
  return "Không tìm thấy"
}

const MainLayout = () => {
  const { pathname } = useLocation()
  const current = breadcrumbLabel(pathname)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-svh overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-card/30 px-4 backdrop-blur-sm md:h-16 md:px-6 sticky top-0 z-30">
          <SidebarTrigger className="-ml-0.5 hover:cursor-pointer" />
          
          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem className="hidden sm:inline-flex">
                <BreadcrumbLink asChild>
                  <Link to="/dashboard">Quản trị</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden sm:inline-flex" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-foreground">
                  {current}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex overflow-y-auto min-h-[calc(100svh-3.5rem)] flex-1 flex-col bg-[#F9FAFB] p-4 md:min-h-[calc(100svh-4rem)] md:p-6 dark:bg-background">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout
