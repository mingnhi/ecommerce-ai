import type { ComponentProps } from "react"
import { Link } from "react-router-dom"
import {
  BaggageClaim,
  LayoutDashboard,
  Package,
  Warehouse,
  Shield,
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
import { NavMain, type NavMainItem } from "@/shared/layouts/sidebar/NavMain"
import { NavUser } from "@/shared/layouts/sidebar/NavUser"
import { useMe } from "@/features/auth/hooks"
import { PERMISSIONS } from "@/shared/lib/casl/permissions"
import logo from "@/assets/logo.png"
import logoSmall from "@/assets/logo-small.png"

const navMain: NavMainItem[] = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
    isActive: true,
    permission: PERMISSIONS.DASHBOARD.READ,
  },
  {
    title: "Sản phẩm",
    url: "/products/1",
    icon: <Package className="size-4" />,
    permission: PERMISSIONS.PRODUCT.READ,
    items: [
      { title: "Danh mục", url: "/categories", permission: PERMISSIONS.PRODUCT.READ },
      { title: "Danh sách sản phẩm", url: "/products", permission: PERMISSIONS.PRODUCT.READ },
    ],
  },
  {
    title: "Đơn hàng",
    url: "/orders",
    icon: <BaggageClaim className="size-4" />,
    permission: PERMISSIONS.ORDER.READ,
    items: [
      { title: "Danh sách đơn hàng", url: "/orders", permission: PERMISSIONS.ORDER.READ },
    ],
  },
  {
    title: "Tồn kho",
    url: "/inventory",
    icon: <Warehouse className="size-4" />,
    permission: PERMISSIONS.INVENTORY.READ,
    items: [
      { title: "Quản lý tồn kho", url: "/inventory", permission: PERMISSIONS.INVENTORY.READ },
      { title: "Lịch sử kho", url: "/inventory/history", permission: PERMISSIONS.INVENTORY.READ },
    ],
  },
  {
    title: "Phân quyền",
    url: "/roles",
    icon: <Shield className="size-4" />,
    permission: PERMISSIONS.ROLE.READ,
    items: [
      { title: "Quản lý vai trò", url: "/roles", permission: PERMISSIONS.ROLE.READ },
      { title: "Quản lý quyền hạn", url: "/permissions", permission: PERMISSIONS.PERMISSION.READ },
    ],
  },
]

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { data: user } = useMe()

  const activeUser = {
    name: user?.fullName || "Quản trị viên",
    email: user?.email || "",
    avatar: "",
  }

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
                <img
                  src={logo}
                  alt="Ecommerce AI Logo"
                  className="h-10 md:h-9 w-auto object-contain transition-all duration-300 group-data-[collapsible=icon]:hidden"
                />
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
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={activeUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
