import type { ComponentProps } from "react"
import { Link } from "react-router-dom"
import {
  BaggageClaim,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Warehouse,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/components/ui/sidebar"
import { NavMain } from "@/shared/layouts/sidebar/NavMain"
import { NavUser } from "@/shared/layouts/sidebar/NavUser"

const nav = {
  user: {
    name: "Nguyễn Minh Anh",
    email: "minhanh@ecommerce-ai.vn",
    avatar: "",
  },
  navMain: [
    {
      title: "Tổng quan",
      url: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
      isActive: true,
    },
    {
      title: "Sản phẩm",
      url: "/products/1",
      icon: <Package className="size-4" />,
      items: [{ title: "Danh mục", url: "/categories" }, { title: "Danh sách sản phẩm", url: "/products" }],
    },
    {
      title: "Đơn hàng",
      url: "/orders",
      icon: <BaggageClaim className="size-4" />,
      items: [{ title: "Danh sách đơn hàng", url: "/orders" }],
    },
    {
      title: "Tồn kho",
      url: "/inventory",
      icon: <Warehouse className="size-4" />,
      items: [
        { title: "Quản lý tồn kho", url: "/inventory" },
        { title: "Lịch sử kho", url: "/inventory/history" },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/60 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="gap-3 pr-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:pr-0"
            >
              <Link to="/dashboard" title="ecommerce ai">
                <ShoppingBag className="size-4 shrink-0" />
                <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 font-semibold tracking-tight text-sidebar-foreground">
                    <span className="truncate text-primary">Ecommerce-AI</span>
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    Bán hàng thông minh
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={nav.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
