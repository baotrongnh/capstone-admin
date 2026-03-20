"use client"

import {
  IconBrandLine,
  IconCalendarStats,
  IconFaceId,
  IconHelp,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconMessage2Question,
  IconSettings
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
import { ROUTE_STAFF } from "@/constant/routes"
import { useTranslations } from "next-intl"
import { StaffNavMain } from "./staff-nav-main"
import { StaffNavSecondary } from "./staff-nav-secondary"

const user = {
  name: "Staff A",
  email: "staffa@example.com",
  avatar: "/avatars/shadcn.jpg",
}

export function StaffSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations('StaffSidebar')

  const navMain = [
    { title: t('dashboard'), url: "#", icon: IconLayoutDashboard },
    { title: t('inquiries'), url: ROUTE_STAFF.INQUIRY, icon: IconMessage2Question },
    { title: t('schedule'), url: ROUTE_STAFF.SCHEDULE, icon: IconCalendarStats },
    { title: t('identityVerification'), url: "#", icon: IconFaceId },
    { title: t('messages'), url: ROUTE_STAFF.CHAT, icon: IconBrandLine },
  ]

  const navSecondary = [
    { title: t('settings'), url: "#", icon: IconSettings },
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
                <span className="text-base font-semibold">INTELL.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <StaffNavMain items={navMain} quickContractLabel={t('quickContract')} />
        <StaffNavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
