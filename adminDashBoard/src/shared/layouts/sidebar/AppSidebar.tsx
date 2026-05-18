import type { ComponentProps } from "react"
import { Link } from "react-router-dom"
import {
  BaggageClaim,
  LayoutDashboard,
  Package,
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
import logo from "@/assets/logo.png"
import logoSmall from "@/assets/logo-small.png"

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
      <SidebarHeader className="flex h-14 shrink-0 items-center justify-center border-b border-sidebar-border/60 px-2 md:h-16">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-auto py-1 px-1 justify-center flex hover:bg-transparent"
            >
              <Link to="/dashboard" title="ecommerce ai" className="flex items-center justify-center w-full">
                {/* Full Logo when expanded */}
                <img
                  src={logo}
                  alt="Ecommerce AI Logo"
                  className="h-10 md:h-9 w-auto object-contain transition-all duration-300 group-data-[collapsible=icon]:hidden"
                />
                {/* Small Logo when collapsed */}
                <img
                  src={logoSmall}
                  alt="Ecommerce AI Small Logo"
                  className="hidden h-10 w-10 object-contain transition-all duration-300 group-data-[collapsible=icon]:block"
                />
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
