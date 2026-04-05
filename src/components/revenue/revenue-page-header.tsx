"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RevenuePageHeader() {
     return (
          <div className="flex flex-wrap items-center justify-between gap-3">
               <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý doanh thu</h1>
                    <p className="text-sm text-muted-foreground">
                         Theo dõi doanh thu theo ngày, tháng, quý, năm và so sánh tăng giảm.
                    </p>
               </div>

               <Button variant="outline" asChild>
                    <Link href="/admin/dashboard">
                         <ArrowLeft className="size-4" />
                         Về Dashboard
                    </Link>
               </Button>
          </div>
     )
}
