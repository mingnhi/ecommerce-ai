import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import type { ReactNode } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export type NavMainItem = {
  title: string
  url: string
  icon?: ReactNode
  isActive?: boolean
  items?: { title: string; url: string }[]
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const { pathname } = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
        Điều hướng
      </SidebarGroupLabel>
      <SidebarMenu className={isCollapsed ? "gap-1" : "px-1.5 gap-1"}>
        {items.map((item) => {
          const hasChildren = !!item.items?.length
          const isParentActive =
            pathname === item.url ||
            (item.items?.some((sub) => pathname === sub.url) ?? false)

          return hasChildren ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem className="relative">
                {/* European/Stripe-style vertical active bar - hidden in collapsed state */}
                {isParentActive && !isCollapsed && (
                  <div className="absolute -left-1.5 top-1.5 w-[3px] h-5 bg-sky-500 rounded-r-full transition-all duration-300" />
                )}

                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={
                      isParentActive
                        ? "text-sky-600 dark:text-sky-400 font-medium bg-sky-500/[0.04] rounded-sm transition-all duration-200 hover:text-sky-500! hover:bg-sky-500/[0.08] hover:cursor-pointer"
                        : "text-muted-foreground hover:bg-sky-500/[0.04] hover:text-sky-500! rounded-sm transition-all duration-200 hover:cursor-pointer"
                    }
                  >
                    {item.icon}
                    <span className="text-[13px]">{item.title}</span>
                    <ChevronRightIcon className="ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-muted-foreground/70" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300">
                  <SidebarMenuSub className={isParentActive ? "border-l border-sky-500/40 mt-1 ml-4 pl-3.5 flex flex-col gap-1" : "border-l border-gray/40 mt-1 ml-4 pl-3.5 flex flex-col gap-1"}>
                    {item.items!.map((sub) => {
                      const isChildActive = pathname === sub.url
                      return (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={
                              isChildActive
                                ? "bg-sky-500/[0.06] text-sky-600 dark:text-sky-400 font-semibold rounded-sm border border-sky-500/10 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:bg-sky-500/[0.08] hover:text-sky-500! transition-all duration-200"
                                : "text-muted-foreground hover:bg-sky-500/[0.04] hover:text-sky-500! font-normal rounded-sm transition-all duration-200"
                            }
                          >
                            <Link to={sub.url}>
                              <span className="text-[13px]">{sub.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title} className="relative">
              {/* European/Stripe-style vertical active bar - hidden in collapsed state */}
              {isParentActive && !isCollapsed && (
                <div className="absolute -left-1.5 top-1.5 w-[3px] h-5 bg-sky-500 rounded-r-full transition-all duration-300" />
              )}

              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={
                  isParentActive
                    ? "text-sky-600 dark:text-sky-400 font-medium bg-sky-500/[0.04] rounded-sm transition-all duration-200 hover:text-sky-500! hover:bg-sky-500/[0.08] hover:cursor-pointer"
                    : "text-muted-foreground hover:bg-sky-500/[0.04] hover:text-sky-500! rounded-sm transition-all duration-200 hover:cursor-pointer"
                }
              >
                <Link to={item.url}>
                  {item.icon}
                  <span className="text-[13px]">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
