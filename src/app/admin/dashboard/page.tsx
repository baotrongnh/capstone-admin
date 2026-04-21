"use client"

import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"

import { RevenueDashboardInsights } from "@/components/revenue/revenue-dashboard-insights"
import {
     RevenueDateRangePicker,
     type RevenueDateRangeValue,
} from "@/components/revenue/revenue-date-range-picker"
import { toEndOfDayIso, toInputDate, toStartOfDayIso } from "@/utils/date-utils"
import { useRevenueAdminDashboard } from "../../../hooks/query/useRevenues"
import { TotalRevenueCard } from "../../../components/revenue/total-revenue-card"

export default function Dashboard() {
     const now = new Date()
     const defaultFrom = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1))
     const defaultTo = toInputDate(now)

     const [appliedFrom, setAppliedFrom] = useState(defaultFrom)
     const [appliedTo, setAppliedTo] = useState(defaultTo)

     const dashboardFilter = useMemo(
          () => ({
               from: toStartOfDayIso(appliedFrom),
               to: toEndOfDayIso(appliedTo),
               topLimit: 5,
          }),
          [appliedFrom, appliedTo],
     )

     const { data, isLoading, isError } = useRevenueAdminDashboard(dashboardFilter)

     const applyRange = (next: RevenueDateRangeValue) => {
          setAppliedFrom(next.from)
          setAppliedTo(next.to)
     }

     const resetRange = () => {
          setAppliedFrom(defaultFrom)
          setAppliedTo(defaultTo)
     }

     const summary = data?.systemRevenueSummary

     return (
          <div className="@container/main flex flex-1 flex-col gap-2">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                         <div className="rounded-2xl border border-border/70 bg-linear-to-r from-cyan-500/10 via-background to-emerald-500/10 p-5">
                              <h1 className="text-xl font-semibold tracking-tight">Revenue Dashboard</h1>
                              <p className="mt-1 text-sm text-muted-foreground">
                                   Theo dõi tổng quan doanh thu, tỷ lệ người dùng và hiệu suất căn hộ theo khoảng ngày.
                              </p>
                         </div>
                    </div>

                    <div className="px-4 lg:px-6">
                         <RevenueDateRangePicker
                              key={`${appliedFrom}-${appliedTo}`}
                              value={{ from: appliedFrom, to: appliedTo }}
                              onApply={applyRange}
                              onReset={resetRange}
                         />
                    </div>

                    {isError && (
                         <div className="mx-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
                              <AlertCircle className="h-4 w-4" />
                              Không thể tải dữ liệu revenue dashboard. Vui lòng thử lại.
                         </div>
                    )}

                    <div className="px-4 lg:px-6">
                         <TotalRevenueCard
                              amount={summary?.totalSystemRevenue}
                              label="Doanh thu hệ thống (theo bộ lọc)"
                              isLoading={isLoading}
                              actionHref="/admin/revenues"
                              actionLabel="Quản lý doanh thu"
                         />
                    </div>

                    <RevenueDashboardInsights
                         data={data}
                         isLoading={isLoading}
                         className="px-4 lg:px-6"
                    />
               </div>
          </div>
     )
}
