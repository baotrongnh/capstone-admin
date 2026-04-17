"use client"

import {
  IconBusinessplan,
  IconHelp,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconUser,
} from "@tabler/icons-react"
import * as React from "react"
import Link from "next/link"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ROUTE_ADMIN } from "@/constant/routes"
import { useTranslations } from "next-intl"
import { AdminNavMain } from "./admin-nav-main"
import { AdminNavSecondary } from "./admin-nav-secondary"

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('StaffSidebar')

  const navMain = [
    { title: t('dashboard'), url: ROUTE_ADMIN.DASHBOARD, icon: IconLayoutDashboard },
    { title: 'Doanh thu', url: ROUTE_ADMIN.REVENUES, icon: IconBusinessplan },
    { title: 'Quản lý người dùng', url: ROUTE_ADMIN.USER, icon: IconUser },
  ]

  const navSecondary = [
    { title: t('help'), url: "#", icon: IconHelp },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={ROUTE_ADMIN.DASHBOARD}>
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">homeIQ (Admin)</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={navMain} />
        <AdminNavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
