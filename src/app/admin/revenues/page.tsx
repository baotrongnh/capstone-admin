"use client"

import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"

import { RevenueDashboardInsights } from "@/components/revenue/revenue-dashboard-insights"
import { toEndOfDayIso, toInputDate, toStartOfDayIso } from "@/utils/date-utils"
import { useRevenueAdminDashboard, useRevenueDashboard } from "../../../hooks/query/useRevenues"
import type { RevenueDateFilter, RevenuePeriod } from "@/types/revenue"
import {
     RevenueDateRangePicker,
     type RevenueDateRangeValue,
} from "../../../components/revenue/revenue-date-range-picker"
import { RevenuePageHeader } from "../../../components/revenue/revenue-page-header"
import { RevenueRangeTotalCard } from "../../../components/revenue/revenue-range-total-card"
import { RevenueSummaryCards } from "../../../components/revenue/revenue-summary-cards"
import { RevenueTrendCharts } from "../../../components/revenue/revenue-trend-charts"

export default function RevenueManagementPage() {
     const now = new Date()
     const defaultFrom = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1))
     const defaultTo = toInputDate(now)

     const [appliedFrom, setAppliedFrom] = useState(defaultFrom)
     const [appliedTo, setAppliedTo] = useState(defaultTo)
     const [selectedPeriod, setSelectedPeriod] = useState<RevenuePeriod>("month")

     const filter = useMemo<RevenueDateFilter>(() => ({ from: appliedFrom, to: appliedTo }), [appliedFrom, appliedTo])
     const dashboardFilter = useMemo(
          () => ({
               from: toStartOfDayIso(appliedFrom),
               to: toEndOfDayIso(appliedTo),
               topLimit: 5,
          }),
          [appliedFrom, appliedTo],
     )

     const { data, isLoading, isError } = useRevenueDashboard(selectedPeriod, filter)
     const { data: dashboardData, isLoading: isDashboardLoading } = useRevenueAdminDashboard(dashboardFilter)

     const applyRange = (next: RevenueDateRangeValue) => {
          setAppliedFrom(next.from)
          setAppliedTo(next.to)
     }

     const resetRange = () => {
          setAppliedFrom(defaultFrom)
          setAppliedTo(defaultTo)
     }

     return (
          <div className="@container/main flex flex-1 flex-col gap-2">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                         <RevenuePageHeader />
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
                              Không thể tải dữ liệu doanh thu. Vui lòng thử lại.
                         </div>
                    )}

                    <div className="px-4 lg:px-6">
                         <RevenueRangeTotalCard from={appliedFrom} to={appliedTo} />
                    </div>

                    <RevenueSummaryCards
                         summary={data?.summary}
                         period={selectedPeriod}
                         isLoading={isLoading}
                    />
                    <RevenueTrendCharts
                         trend={data?.trend}
                         piePoint={data?.piePoint ?? null}
                         period={selectedPeriod}
                         onPeriodChange={setSelectedPeriod}
                         isLoading={isLoading}
                    />

                    <RevenueDashboardInsights
                         data={dashboardData}
                         isLoading={isDashboardLoading}
                         className="px-4 lg:px-6"
                         title="Số liệu Dashboard API trong khoảng đã chọn"
                         description="Dữ liệu /api/v1/revenues/dashboard đồng bộ với bộ lọc ngày tháng phía trên."
                    />
               </div>
          </div>
     )
}
