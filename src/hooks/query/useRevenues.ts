"use client"

import { revenueService } from "@/lib/services/revenue.service"
import type { RevenueDashboardData, RevenueDateFilter, RevenueDateRange, RevenueOverviewData, RevenueOverviewQuery, RevenuePeriod } from "@/types/revenue"
import { endOfDay, endOfMonth, endOfQuarter, endOfYear, formatDayLabel, formatMonthLabel, formatQuarterLabel, formatYearLabel, normalizeDateFilter, startOfDay, startOfMonth, startOfQuarter, startOfYear, toIso } from "@/utils/date-utils"
import { percentChange, REVENUE_PERIOD_META, roundPercent } from "@/utils/revenue-calc"
import { useQuery } from "@tanstack/react-query"

type PeriodQuery = {
     from: string
     to: string
}

type PeriodTool = {
     buildRanges: (referenceDate: Date) => RevenueDateRange[]
     toQuery: (date: Date) => PeriodQuery
     shift: (date: Date, offset: number) => Date
}

const toRange = (label: string, from: Date, to: Date): RevenueDateRange => ({
     label,
     from: toIso(from),
     to: toIso(to),
})

const getReferenceDate = (filter?: RevenueDateFilter) => normalizeDateFilter(filter)?.to ?? new Date()

const PERIOD_TOOLS: Record<RevenuePeriod, PeriodTool> = {
     day: {
          buildRanges: (referenceDate) => {
               const year = referenceDate.getFullYear()
               const month = referenceDate.getMonth()
               const lastDay = new Date(year, month + 1, 0).getDate()

               return Array.from({ length: lastDay }, (_, index) => {
                    const date = new Date(year, month, index + 1)
                    return toRange(formatDayLabel(date), startOfDay(date), endOfDay(date))
               })
          },
          toQuery: (date) => ({
               from: toIso(startOfDay(date)),
               to: toIso(endOfDay(date)),
          }),
          shift: (date, offset) => {
               const shifted = new Date(date)
               shifted.setDate(shifted.getDate() + offset)
               return shifted
          },
     },
     month: {
          buildRanges: (referenceDate) => {
               const year = referenceDate.getFullYear()

               return Array.from({ length: 12 }, (_, month) => {
                    const date = new Date(year, month, 1)
                    return toRange(formatMonthLabel(date), startOfMonth(date), endOfMonth(date))
               })
          },
          toQuery: (date) => ({
               from: toIso(startOfMonth(date)),
               to: toIso(endOfMonth(date)),
          }),
          shift: (date, offset) => {
               const shifted = new Date(date)
               shifted.setMonth(shifted.getMonth() + offset)
               return shifted
          },
     },
     quarter: {
          buildRanges: (referenceDate) => {
               const year = referenceDate.getFullYear()

               return [0, 3, 6, 9].map((month) => {
                    const date = new Date(year, month, 1)
                    return toRange(formatQuarterLabel(date), startOfQuarter(date), endOfQuarter(date))
               })
          },
          toQuery: (date) => ({
               from: toIso(startOfQuarter(date)),
               to: toIso(endOfQuarter(date)),
          }),
          shift: (date, offset) => {
               const shifted = new Date(date)
               shifted.setMonth(shifted.getMonth() + offset * 3)
               return shifted
          },
     },
     year: {
          buildRanges: (referenceDate) => {
               const endYear = referenceDate.getFullYear()
               const count = REVENUE_PERIOD_META.year.count
               const startYear = endYear - (count - 1)

               return Array.from({ length: count }, (_, index) => {
                    const date = new Date(startYear + index, 0, 1)
                    return toRange(formatYearLabel(date), startOfYear(date), endOfYear(date))
               })
          },
          toQuery: (date) => ({
               from: toIso(startOfYear(date)),
               to: toIso(endOfYear(date)),
          }),
          shift: (date, offset) => {
               const shifted = new Date(date)
               shifted.setFullYear(shifted.getFullYear() + offset)
               return shifted
          },
     },
}

const toRevenuePoint = async (range: RevenueDateRange) => {
     const overview = await revenueService.getOverview({
          from: range.from,
          to: range.to,
     })

     return {
          ...overview,
          label: range.label,
          from: range.from,
          to: range.to,
     }
}

export const useRevenueOverview = (params?: RevenueOverviewQuery) => useQuery<RevenueOverviewData>({
     queryKey: ["revenues", "overview", params?.from ?? null, params?.to ?? null],
     queryFn: () => revenueService.getOverview(params),
})

export const useRevenueDashboard = (period: RevenuePeriod = "month", filter?: RevenueDateFilter) => useQuery<RevenueDashboardData>({
     queryKey: ["revenues", "dashboard", period, filter?.from ?? null, filter?.to ?? null],
     queryFn: async () => {
          const tool = PERIOD_TOOLS[period]
          const referenceDate = getReferenceDate(filter)
          const monthQuery = PERIOD_TOOLS.month.toQuery(referenceDate)
          const ranges = tool.buildRanges(referenceDate)
          const [points, currentOverview, previousOverview, pieOverview] = await Promise.all([
               Promise.all(ranges.map(toRevenuePoint)),
               revenueService.getOverview(tool.toQuery(referenceDate)),
               revenueService.getOverview(tool.toQuery(tool.shift(referenceDate, -1))),
               revenueService.getOverview(monthQuery),
          ])
          const current = currentOverview.totalSystemRevenue
          const previous = previousOverview.totalSystemRevenue

          const trend = {
               period,
               title: REVENUE_PERIOD_META[period].title,
               subtitle:
                    ranges.length > 0
                         ? `${ranges[0].label} - ${ranges[ranges.length - 1].label}`
                         : REVENUE_PERIOD_META[period].subtitle,
               points,
               current,
               previous,
               changePercent: roundPercent(percentChange(current, previous)),
          }

          return {
               period,
               trend,
               summary: {
                    period: trend.period,
                    title: trend.title,
                    current: trend.current,
                    previous: trend.previous,
                    changePercent: trend.changePercent,
               },
               piePoint: {
                    ...pieOverview,
                    label: formatMonthLabel(referenceDate),
                    from: monthQuery.from,
                    to: monthQuery.to,
               },
          }
     },
})
