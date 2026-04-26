"use client";

import {
  IconBrandLine,
  IconCalendarStats,
  IconContract,
  IconHelp,
  IconHomeQuestion,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconMessage2Question,
} from "@tabler/icons-react";
import * as React from "react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTE_STAFF } from "@/constant/routes";
import { useTranslations } from "next-intl";
import { StaffNavMain } from "./staff-nav-main";
import { StaffNavSecondary } from "./staff-nav-secondary";

export function StaffSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("StaffSidebar");

  const navMain = [
    // { title: t("dashboard"), url: "#", icon: IconLayoutDashboard },
    {
      title: 'Lịch hẹn xem căn hộ',
      url: ROUTE_STAFF.SCHEDULE,
      icon: IconCalendarStats,
    },
    { title: "Chi trả", url: ROUTE_STAFF.PAYOUTS, icon: IconContract },
  ];

  const navMain2 = [
    { title: t("messages"), url: ROUTE_STAFF.CHAT, icon: IconBrandLine },
    { title: "Yêu cầu bảo trì", url: ROUTE_STAFF.MAINTENANCE, icon: IconHelp },
    // {
    //   title: t("inquiries"),
    //   url: ROUTE_STAFF.INQUIRY,
    //   icon: IconMessage2Question,
    // },
  ];

  const navMain3 = [
    {
      title: "Xác thực căn hộ hợp tác",
      url: ROUTE_STAFF.REQUEST,
      icon: IconHomeQuestion,
    },
    
    { title: "Hợp đồng thuê", url: ROUTE_STAFF.CONTRACT, icon: IconContract },
  ];

  const navSecondary = [{ title: t("help"), url: "#", icon: IconHelp }];

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
                <span className="text-base font-semibold">
                  homeIQ (STAFF)
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <StaffNavMain items={navMain} groupLable="Vận hành" />
        <StaffNavMain items={navMain2} groupLable="Giao tiếp" />
        <StaffNavMain items={navMain3} groupLable="Cư trú" />
        <StaffNavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
