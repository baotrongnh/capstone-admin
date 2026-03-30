"use client"

import { type Icon } from "@tabler/icons-react"

import { isSidebarItemActive } from "@/components/layout/sidebar-active"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function StaffNavMain({
  items,
  groupLable = "groupLable",
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  groupLable?: string
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <span className="text-muted-foreground text-[12px]">{groupLable}</span>
        <SidebarMenu>
          {items.map((item) => (
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
  )
}
