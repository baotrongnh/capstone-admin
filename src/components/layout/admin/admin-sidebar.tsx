"use client"

import {
  IconBusinessplan,
  IconHelp,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconSettings,
  IconUser,
  IconUsersGroup
} from "@tabler/icons-react"
import * as React from "react"

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

const user = {
  name: "Admin",
  email: "admin@gmail.com",
  avatar: "/avatars/shadcn.jpg",
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('StaffSidebar')

  const navMain = [
    { title: t('dashboard'), url: ROUTE_ADMIN.DASHBOARD, icon: IconLayoutDashboard },
    { title: 'Doanh thu', url: ROUTE_ADMIN.DASHBOARD, icon: IconBusinessplan },
    { title: 'Quản lý người dùng', url: ROUTE_ADMIN.DASHBOARD, icon: IconUser },
    { title: 'Quản lý nhân viên', url: ROUTE_ADMIN.DASHBOARD, icon: IconUsersGroup },
    { title: 'Cài đặt hệ thống', url: ROUTE_ADMIN.DASHBOARD, icon: IconSettings },
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
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">INTELLISERVOPS (Admin)</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={navMain} quickContractLabel={t('quickContract')} />
        <AdminNavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
