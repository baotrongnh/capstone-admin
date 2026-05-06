"use client"

import {
  IconActivityHeartbeat,
  IconAdjustmentsCog,
  IconBusinessplan,
  IconFileInvoice,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconReceipt2,
  IconTopologyStar3,
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

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("StaffSidebar")

  const navMain = [
    {
      title: "Tổng quan",
      items: [{ title: t("dashboard"), url: ROUTE_ADMIN.DASHBOARD, icon: IconLayoutDashboard }],
    },
    {
      title: "Tài chính",
      items: [
        { title: "Doanh thu", url: ROUTE_ADMIN.REVENUES, icon: IconBusinessplan },
        { title: "Hóa đơn", url: ROUTE_ADMIN.INVOICES, icon: IconFileInvoice },
      ],
    },
    {
      title: "Vận hành",
      items: [
        { title: "Quản lý IoT", url: ROUTE_ADMIN.IOT_MANAGER, icon: IconTopologyStar3 },
        { title: "Giá điện/nước", url: ROUTE_ADMIN.UTILITY_RATES, icon: IconReceipt2 },
        { title: "Quản lý người dùng", url: ROUTE_ADMIN.USER, icon: IconUser },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        { title: "Nhật ký hoạt động", url: ROUTE_ADMIN.ACTIVITY_LOGS, icon: IconActivityHeartbeat },
        { title: "Cấu hình hệ thống", url: ROUTE_ADMIN.CONFIG, icon: IconAdjustmentsCog },
      ],
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
