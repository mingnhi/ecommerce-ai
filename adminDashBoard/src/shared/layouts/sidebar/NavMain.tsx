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
import { useUserPermissions } from "@/shared/hooks/use-can"
import { includesPermission } from "@/shared/lib/casl/permissions"
import { cn } from "@/shared/lib/utils"

export type NavMainItem = {
  title: string
  url: string
  icon?: ReactNode
  isActive?: boolean
  permission?: string
  items?: { title: string; url: string; permission?: string }[]
}

export type NavSection = {
  label: string
  items: NavMainItem[]
}

type NavMainProps = {
  sections: NavSection[]
}

function filterItems(items: NavMainItem[], isAllowed: (p?: string) => boolean) {
  return items
    .filter((item) => isAllowed(item.permission))
    .map((item) => {
      if (!item.items) return item
      return {
        ...item,
        items: item.items.filter((sub) => isAllowed(sub.permission)),
      }
    })
    .filter((item) => !(item.items && item.items.length === 0 && item.url === "#"))
}

function NavItems({ items }: { items: NavMainItem[] }) {
  const { pathname } = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarMenu className={isCollapsed ? "gap-1" : "px-1.5 gap-1"}>
      {items.map((item) => {
        const hasChildren = !!item.items?.length
        const isParentActive =
          pathname === item.url ||
          (item.items?.some((sub) => pathname === sub.url) ?? false)

        if (hasChildren) {
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isParentActive || item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem className="relative">
                {isParentActive && !isCollapsed && (
                  <div className="absolute -left-1.5 top-1.5 h-5 w-[3px] rounded-r-full bg-sky-500 transition-all duration-300" />
                )}
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={
                      isParentActive
                        ? "rounded-sm bg-sky-500/[0.04] font-medium text-sky-600 transition-all duration-200 hover:bg-sky-500/[0.08] hover:text-sky-500! hover:cursor-pointer dark:text-sky-400"
                        : "rounded-sm text-muted-foreground transition-all duration-200 hover:bg-sky-500/[0.04] hover:text-sky-500! hover:cursor-pointer"
                    }
                  >
                    {item.icon}
                    <span className="text-[13px]">{item.title}</span>
                    <ChevronRightIcon className="ml-auto size-3.5 text-muted-foreground/70 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="transition-all duration-300">
                  <SidebarMenuSub
                    className={
                      isParentActive
                        ? "mt-1 ml-4 flex flex-col gap-1 border-l border-sky-500/40 pl-3.5"
                        : "mt-1 ml-4 flex flex-col gap-1 border-l border-gray/40 pl-3.5"
                    }
                  >
                    {item.items!.map((sub) => {
                      const isChildActive = pathname === sub.url
                      return (
                        <SidebarMenuSubItem key={sub.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={
                              isChildActive
                                ? "rounded-sm border border-sky-500/10 bg-sky-500/[0.06] font-semibold text-sky-600 shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-all duration-200 hover:bg-sky-500/[0.08] hover:text-sky-500! dark:text-sky-400"
                                : "rounded-sm font-normal text-muted-foreground transition-all duration-200 hover:bg-sky-500/[0.04] hover:text-sky-500!"
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
          )
        }

        return (
          <SidebarMenuItem key={item.title} className="relative">
            {isParentActive && !isCollapsed && (
              <div className="absolute -left-1.5 top-1.5 h-5 w-[3px] rounded-r-full bg-sky-500 transition-all duration-300" />
            )}
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              className={
                isParentActive
                  ? "rounded-sm bg-sky-500/[0.04] font-medium text-sky-600 transition-all duration-200 hover:bg-sky-500/[0.08] hover:text-sky-500! hover:cursor-pointer dark:text-sky-400"
                  : "rounded-sm text-muted-foreground transition-all duration-200 hover:bg-sky-500/[0.04] hover:text-sky-500! hover:cursor-pointer"
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
  )
}

export function NavMain({ sections }: NavMainProps) {
  const permissions = useUserPermissions()
  const isAllowed = (permission?: string) =>
    !permission || includesPermission(permissions, permission)

  return (
    <>
      {sections.map((section, index) => {
        const visibleItems = filterItems(section.items, isAllowed)
        if (visibleItems.length === 0) return null

        return (
          <SidebarGroup
            key={section.label}
            className={cn(index > 0 && "mt-2 border-t border-sidebar-border/70 pt-3")}
          >
            <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              {section.label}
            </SidebarGroupLabel>
            <NavItems items={visibleItems} />
          </SidebarGroup>
        )
      })}
    </>
  )
}
