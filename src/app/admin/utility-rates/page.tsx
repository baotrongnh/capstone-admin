"use client"

import Link from "next/link"

import { UtilityRateManagerCard } from "@/components/iot/utility-rate-manager-card"
import { Button } from "@/components/ui/button"
import { ROUTE_ADMIN } from "@/constant/routes"

export default function AdminUtilityRatesPage() {
     return (
          <div className="space-y-4 p-4">
               <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold text-foreground">Quản lý giá điện/nước</h1>
                         <p className="mt-1 text-sm text-muted-foreground">Cấu hình giá mặc định toàn hệ thống.</p>
                    </div>
                    <Button variant="outline" asChild>
                         <Link href={ROUTE_ADMIN.UTILITY_RATES_APARTMENTS}>Xem giá từng căn hộ</Link>
                    </Button>
               </div>

               <UtilityRateManagerCard />
          </div>
     )
}