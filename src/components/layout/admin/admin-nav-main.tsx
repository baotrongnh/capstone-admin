"use client"

import { type Icon } from "@tabler/icons-react"

import { isSidebarItemActive } from "@/components/layout/sidebar-active"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AdminNavMain({
  items,
}: {
  items: {
    title: string
    items: {
      title: string
      url: string
      icon?: Icon
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.title} className="py-1">
          <SidebarGroupLabel className="h-6 px-2 text-[11px] font-semibold uppercase tracking-wide">
            {group.title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isSidebarItemActive(pathname, item.url)}
                    asChild
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
