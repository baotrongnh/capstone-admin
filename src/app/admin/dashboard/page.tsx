"use client"

import { AlertCircle } from "lucide-react"

import { useRevenueDashboard } from "../../../hooks/query/useRevenues"
import { TotalRevenueCard } from "../../../components/revenue/total-revenue-card"

export default function Dashboard() {
     const { data, isLoading, isError } = useRevenueDashboard("month")
     const summary = data?.summary

     const monthTrend = summary
          ? {
               changePercent: summary.changePercent,
               previousAmount: summary.previous,
               comparisonLabel: "so với tháng trước",
          }
          : undefined

     return (
          <div className="@container/main flex flex-1 flex-col gap-2">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {isError && (
                         <div className="mx-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
                              <AlertCircle className="h-4 w-4" />
                              Không thể tải dữ liệu doanh thu. Vui lòng thử lại.
                         </div>
                    )}

                    <div className="px-4 lg:px-6">
                         <TotalRevenueCard
                              amount={summary?.current}
                              label="Doanh thu tổng hệ thống (tháng)"
                              trend={monthTrend}
                              isLoading={isLoading}
                              actionHref="/admin/revenues"
                              actionLabel="Quản lý doanh thu"
                         />
                    </div>
               </div>
          </div>
     )
}
