"use client"

import { useMemo } from "react"

import {
     isFullMonthRange,
     toDisplayDate,
     toEndOfDayIso,
     toStartOfDayIso,
} from "@/utils/date-utils"
import { useRevenueOverview } from "@/hooks/query/useRevenues"
import { TotalRevenueCard } from "./total-revenue-card"

type RevenueRangeTotalCardProps = {
     from: string
     to: string
}

export function RevenueRangeTotalCard({ from, to }: RevenueRangeTotalCardProps) {
     const params = useMemo(
          () => ({
               from: toStartOfDayIso(from),
               to: toEndOfDayIso(to),
          }),
          [from, to],
     )

     const { data, isLoading } = useRevenueOverview(params)

     const fullMonth = useMemo(() => isFullMonthRange(from, to), [from, to])

     const label = fullMonth
          ? "Doanh thu tổng hệ thống (tháng)"
          : `Doanh thu tổng hệ thống (${toDisplayDate(from)} - ${toDisplayDate(to)})`

     return (
          <TotalRevenueCard
               amount={data?.totalSystemRevenue ?? 0}
               isLoading={isLoading}
               label={label}
          />
     )
}
