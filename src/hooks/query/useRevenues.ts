"use client"

import { revenueService } from "@/lib/services/revenue.service"
import type {
     RevenueDashboardApiData,
     RevenueDashboardData,
     RevenueDashboardQuery,
     RevenueDateFilter,
     RevenueDateRange,
     RevenueOverviewData,
     RevenueOverviewQuery,
     RevenuePeriod,
     StaffPartnerPayoutConfirmRequest,
     StaffPartnerPayoutListData,
     StaffPartnerPayoutListQuery,
} from "@/types/revenue"
import { endOfDay, endOfMonth, endOfQuarter, endOfYear, formatDayLabel, formatMonthLabel, formatQuarterLabel, formatYearLabel, maxDate, minDate, normalizeDateFilter, startOfDay, startOfMonth, startOfQuarter, startOfYear, toIso } from "@/utils/date-utils"
import { percentChange, REVENUE_PERIOD_META, roundPercent } from "@/utils/revenue-calc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"

type RevenueRangeQuery = {
     from: string
     to: string
}

type RevenueDashboardMode = RevenuePeriod | "custom"

type DateOffset = {
     days?: number
     months?: number
     years?: number
}

type PeriodTool = {
     buildRanges: (referenceDate: Date) => RevenueDateRange[]
     toQuery: (date: Date) => RevenueRangeQuery
     shift: (date: Date, offset: number) => Date
}

const toRange = (label: string, from: Date, to: Date): RevenueDateRange => ({
     label,
     from: toIso(from),
     to: toIso(to),
})

const toRangeQuery = (
     date: Date,
     start: (value: Date) => Date,
     end: (value: Date) => Date,
): RevenueRangeQuery => ({
     from: toIso(start(date)),
     to: toIso(end(date)),
})

const shiftDate = (date: Date, offset: DateOffset) => {
     const shifted = new Date(date)

     if (offset.days) {
          shifted.setDate(shifted.getDate() + offset.days)
     }

     if (offset.months) {
          shifted.setMonth(shifted.getMonth() + offset.months)
     }

     if (offset.years) {
          shifted.setFullYear(shifted.getFullYear() + offset.years)
     }

     return shifted
}

const getReferenceDate = (filter?: RevenueDateFilter) => normalizeDateFilter(filter)?.to ?? new Date()

const formatCustomRangeLabel = (from: Date, to: Date) => {
     const formatDate = (date: Date) => date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
     })

     return `${formatDate(from)} - ${formatDate(to)}`
}

const buildDayRanges = (referenceDate: Date): RevenueDateRange[] => {
     const year = referenceDate.getFullYear()
     const month = referenceDate.getMonth()
     const lastDay = new Date(year, month + 1, 0).getDate()

     return Array.from({ length: lastDay }, (_, index) => {
          const date = new Date(year, month, index + 1)
          return toRange(formatDayLabel(date), startOfDay(date), endOfDay(date))
     })
}

const buildMonthRanges = (referenceDate: Date): RevenueDateRange[] => {
     const year = referenceDate.getFullYear()

     return Array.from({ length: 12 }, (_, month) => {
          const date = new Date(year, month, 1)
          return toRange(formatMonthLabel(date), startOfMonth(date), endOfMonth(date))
     })
}

const buildQuarterRanges = (referenceDate: Date): RevenueDateRange[] => {
     const year = referenceDate.getFullYear()

     return [0, 3, 6, 9].map((month) => {
          const date = new Date(year, month, 1)
          return toRange(formatQuarterLabel(date), startOfQuarter(date), endOfQuarter(date))
     })
}

const buildYearRanges = (referenceDate: Date): RevenueDateRange[] => {
     const endYear = referenceDate.getFullYear()
     const count = REVENUE_PERIOD_META.year.count
     const startYear = endYear - (count - 1)

     return Array.from({ length: count }, (_, index) => {
          const date = new Date(startYear + index, 0, 1)
          return toRange(formatYearLabel(date), startOfYear(date), endOfYear(date))
     })
}

const buildCustomDayRanges = (from: Date, to: Date): RevenueDateRange[] => {
     const ranges: RevenueDateRange[] = []
     const cursor = startOfDay(from)
     const end = endOfDay(to)

     while (cursor.getTime() <= end.getTime()) {
          ranges.push(toRange(formatDayLabel(cursor), startOfDay(cursor), endOfDay(cursor)))
          cursor.setDate(cursor.getDate() + 1)
     }

     return ranges
}

const buildCustomMonthRanges = (from: Date, to: Date): RevenueDateRange[] => {
     const ranges: RevenueDateRange[] = []
     const cursor = startOfMonth(from)
     const end = endOfDay(to)

     while (cursor.getTime() <= end.getTime()) {
          ranges.push(toRange(
               formatMonthLabel(cursor),
               maxDate(startOfMonth(cursor), from),
               minDate(endOfMonth(cursor), to),
          ))
          cursor.setMonth(cursor.getMonth() + 1)
     }

     return ranges
}

const buildCustomYearRanges = (from: Date, to: Date): RevenueDateRange[] => {
     const ranges: RevenueDateRange[] = []
     const cursor = startOfYear(from)
     const end = endOfDay(to)

     while (cursor.getTime() <= end.getTime()) {
          ranges.push(toRange(
               formatYearLabel(cursor),
               maxDate(startOfYear(cursor), from),
               minDate(endOfYear(cursor), to),
          ))
          cursor.setFullYear(cursor.getFullYear() + 1)
     }

     return ranges
}

const buildCustomRanges = (from: Date, to: Date): { period: RevenuePeriod; ranges: RevenueDateRange[] } => {
     const dayCount = Math.ceil((endOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000)

     if (dayCount <= 45) {
          return { period: "day", ranges: buildCustomDayRanges(from, to) }
     }

     if (dayCount <= 730) {
          return { period: "month", ranges: buildCustomMonthRanges(from, to) }
     }

     return { period: "year", ranges: buildCustomYearRanges(from, to) }
}

const PERIOD_TOOLS: Record<RevenuePeriod, PeriodTool> = {
     day: {
          buildRanges: buildDayRanges,
          toQuery: (date) => toRangeQuery(date, startOfDay, endOfDay),
          shift: (date, offset) => shiftDate(date, { days: offset }),
     },
     month: {
          buildRanges: buildMonthRanges,
          toQuery: (date) => toRangeQuery(date, startOfMonth, endOfMonth),
          shift: (date, offset) => shiftDate(date, { months: offset }),
     },
     quarter: {
          buildRanges: buildQuarterRanges,
          toQuery: (date) => toRangeQuery(date, startOfQuarter, endOfQuarter),
          shift: (date, offset) => shiftDate(date, { months: offset * 3 }),
     },
     year: {
          buildRanges: buildYearRanges,
          toQuery: (date) => toRangeQuery(date, startOfYear, endOfYear),
          shift: (date, offset) => shiftDate(date, { years: offset }),
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

type StaffPartnerPayoutConfirmFormPayload = Omit<StaffPartnerPayoutConfirmRequest, "transferProof"> & {
     transferProof: File
}

const STAFF_PARTNER_PAYOUTS_QUERY_KEY = ["revenues", "staff", "partner-payouts"] as const

const toPartnerPayoutConfirmFormData = (payload: StaffPartnerPayoutConfirmFormPayload) => {
     const formData = new FormData()
     formData.append("partnerId", payload.partnerId)
     formData.append("month", payload.month)
     if (payload.note?.trim()) {
          formData.append("note", payload.note.trim())
     }
     formData.append("transferProof", payload.transferProof)
     return formData
}

const buildRevenueDashboardData = async (
     mode: RevenueDashboardMode,
     filter?: RevenueDateFilter,
): Promise<RevenueDashboardData> => {
     if (mode === "custom") {
          const normalizedFilter = normalizeDateFilter(filter)
          const from = normalizedFilter?.from ?? startOfMonth(new Date())
          const to = normalizedFilter?.to ?? endOfDay(new Date())
          const { period, ranges } = buildCustomRanges(from, to)
          const currentQuery = { from: toIso(from), to: toIso(to) }
          const previousTo = new Date(from.getTime() - 1)
          const previousFrom = new Date(previousTo.getTime() - (to.getTime() - from.getTime()))

          const [points, currentOverview, previousOverview] = await Promise.all([
               Promise.all(ranges.map(toRevenuePoint)),
               revenueService.getOverview(currentQuery),
               revenueService.getOverview({ from: toIso(previousFrom), to: toIso(previousTo) }),
          ])

          const current = currentOverview.totalSystemRevenue
          const previous = previousOverview.totalSystemRevenue
          const changePercent = roundPercent(percentChange(current, previous))
          const title = "Tùy chọn"
          const subtitle = formatCustomRangeLabel(from, to)

          return {
               period,
               trend: {
                    period,
                    title,
                    subtitle,
                    points,
                    current,
                    previous,
                    changePercent,
               },
               summary: {
                    period,
                    title,
                    current,
                    previous,
                    changePercent,
               },
               piePoint: {
                    ...currentOverview,
                    label: subtitle,
                    from: currentQuery.from,
                    to: currentQuery.to,
               },
          }
     }

     const period = mode
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
     const changePercent = roundPercent(percentChange(current, previous))
     const title = REVENUE_PERIOD_META[period].title
     const subtitle = ranges.length > 0
          ? `${ranges[0].label} - ${ranges[ranges.length - 1].label}`
          : REVENUE_PERIOD_META[period].subtitle

     return {
          period,
          trend: {
               period,
               title,
               subtitle,
               points,
               current,
               previous,
               changePercent,
          },
          summary: {
               period,
               title,
               current,
               previous,
               changePercent,
          },
          piePoint: {
               ...pieOverview,
               label: formatMonthLabel(referenceDate),
               from: monthQuery.from,
               to: monthQuery.to,
          },
     }
}

export const useRevenueOverview = (params?: RevenueOverviewQuery) => useQuery<RevenueOverviewData>({
     queryKey: ["revenues", "overview", params?.from ?? null, params?.to ?? null],
     queryFn: () => revenueService.getOverview(params),
})

export const useRevenueAdminDashboard = (params?: RevenueDashboardQuery) => useQuery<RevenueDashboardApiData>({
     queryKey: [
          "revenues",
          "dashboard-api",
          params?.from ?? null,
          params?.to ?? null,
          params?.topLimit ?? null,
     ],
     queryFn: () => revenueService.getDashboard(params),
})

export const useRevenueDashboard = (mode: RevenueDashboardMode = "month", filter?: RevenueDateFilter) => useQuery<RevenueDashboardData>({
     queryKey: ["revenues", "dashboard", mode, filter?.from ?? null, filter?.to ?? null],
     queryFn: () => buildRevenueDashboardData(mode, filter),
})

export const useStaffPartnerPayouts = (params?: StaffPartnerPayoutListQuery) => useQuery<StaffPartnerPayoutListData>({
     queryKey: [
          ...STAFF_PARTNER_PAYOUTS_QUERY_KEY,
          params?.month ?? null,
          params?.partnerId ?? null,
          params?.page ?? null,
          params?.limit ?? null,
     ],
     queryFn: () => revenueService.getStaffPartnerPayouts(params),
})

export const useConfirmStaffPartnerPayout = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (payload: StaffPartnerPayoutConfirmFormPayload) =>
               revenueService.confirmStaffPartnerPayout(toPartnerPayoutConfirmFormData(payload)),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: STAFF_PARTNER_PAYOUTS_QUERY_KEY })
               message.success("Đã xác nhận chuyển khoản cho partner.")
          },
          onError: (error) => {
               message.error(error?.message || "Không thể xác nhận chuyển khoản.")
          },
     })
}
