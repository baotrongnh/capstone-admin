"use client"

import {
  IconBuilding,
  IconDeviceAirtag,
  IconHeartHandshake,
  IconInnerShadowTop,
  IconListDetails,
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
import { ROUTE_OPERATOR } from "@/constant/routes"
import { OperatorNavMain } from "./operator-nav-main"

const data = {
  navMain: [
    {
      title: "Quản lý căn hộ",
      url: ROUTE_OPERATOR.APARTMENT,
      icon: IconBuilding,
    },
    {
      title: "Quản lý tiện ích",
      url: ROUTE_OPERATOR.AMENITY,
      icon: IconListDetails,
    },
    {
      title: "Duyệt hợp tác",
      url: ROUTE_OPERATOR.REQUEST_PARTNER,
      icon: IconHeartHandshake,
    },
    {
      title: "Thiết bị IoT",
      url: ROUTE_OPERATOR.IOT_MANAGER,
      icon: IconDeviceAirtag,
    }
  ]
}

export function OperatorSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <span className="text-base font-semibold">homeIQ (Operator)</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <OperatorNavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
