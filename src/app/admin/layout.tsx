import { AdminSidebar } from "@/components/layout/admin/admin-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
     SidebarInset,
     SidebarProvider,
} from "@/components/ui/sidebar"
import React from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
     return (
          <SidebarProvider
               style={
                    {
                         "--sidebar-width": "calc(var(--spacing) * 72)",
                         "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
               }
          >
               <AdminSidebar variant="inset" />
               <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">{children}</div>
               </SidebarInset>
          </SidebarProvider>
     )
}
