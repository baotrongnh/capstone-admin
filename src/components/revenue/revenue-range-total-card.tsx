"use client"

import { useMemo } from "react"

import { useRevenueOverview } from "@/hooks/query/useRevenues"
import { toEndOfDayIso, toStartOfDayIso } from "@/utils/date-utils"
import { formatRevenueRangeLabel } from "@/utils/revenue-filter"
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

     return (
          <TotalRevenueCard
               amount={data?.totalSystemRevenue ?? 0}
               isLoading={isLoading}
               label={`Doanh thu tổng hệ thống (${formatRevenueRangeLabel({ from, to })})`}
          />
     )
}
