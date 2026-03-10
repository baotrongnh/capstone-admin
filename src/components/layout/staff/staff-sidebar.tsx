"use client"

import {
  IconBrandLine,
  IconCalendarStats,
  IconCamera,
  IconDatabase,
  IconFaceId,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconMessage2Question,
  IconReport,
  IconSearch,
  IconSettings
} from "@tabler/icons-react"
import * as React from "react"

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
import { StaffNavMain } from "./staff-nav-main"
import { StaffNavSecondary } from "./staff-nav-secondary"
import { StaffNavUser } from "./staff-nav-user"

const data = {
  user: {
    name: "Staff A",
    email: "staffa@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "#",
      icon: IconLayoutDashboard,
    },
    {
      title: "Yêu cầu",
      url: ROUTE_STAFF.INQUIRY,
      icon: IconMessage2Question,
    },
    {
      title: "Schedule",
      url: ROUTE_STAFF.SCHEDULE,
      icon: IconCalendarStats,
    },
    {
      title: "Verify",
      url: "#",
      icon: IconFaceId,
    },
    {
      title: "Chat",
      url: "#",
      icon: IconBrandLine,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    }
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function StaffSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <StaffNavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <StaffNavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <StaffNavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
