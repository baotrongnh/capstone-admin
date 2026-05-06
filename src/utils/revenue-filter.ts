import type { RevenuePeriod } from "@/types/revenue"
import {
     endOfDay,
     endOfMonth,
     endOfQuarter,
     endOfYear,
     parseInputDate,
     startOfDay,
     startOfMonth,
     startOfQuarter,
     startOfYear,
     toDisplayDate,
     toInputDate,
} from "@/utils/date-utils"

export type RevenueFilterMode = RevenuePeriod | "custom"
export type RevenueInputRange = { from: string; to: string }

export const REVENUE_FILTER_MODE_ORDER: RevenueFilterMode[] = ["day", "month", "quarter", "year", "custom"]

export const REVENUE_FILTER_MODE_LABEL: Record<RevenueFilterMode, string> = {
     day: "Ngày",
     month: "Tháng",
     quarter: "Quý",
     year: "Năm",
     custom: "Tùy chọn",
}

const RANGE_BY_MODE: Record<RevenuePeriod, (date: Date) => { from: Date; to: Date }> = {
     day: (date) => ({ from: startOfDay(date), to: endOfDay(date) }),
     month: (date) => ({ from: startOfMonth(date), to: endOfMonth(date) }),
     quarter: (date) => ({ from: startOfQuarter(date), to: endOfQuarter(date) }),
     year: (date) => ({ from: startOfYear(date), to: endOfYear(date) }),
}

const sameDate = (left: Date, right: Date) => toInputDate(left) === toInputDate(right)

const monthYear = (date: Date) => `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`

const isFullRange = (
     from: Date,
     to: Date,
     start: (date: Date) => Date,
     end: (date: Date) => Date,
) => sameDate(from, start(from)) && sameDate(to, end(from))

export const getRevenueRangeByMode = (
     mode: RevenueFilterMode,
     customRange: RevenueInputRange,
     referenceDate = new Date(),
): RevenueInputRange => {
     if (mode === "custom") return customRange

     const range = RANGE_BY_MODE[mode](referenceDate)
     return { from: toInputDate(range.from), to: toInputDate(range.to) }
}

export const formatRevenueRangeLabel = ({ from, to }: RevenueInputRange) => {
     const fromDate = parseInputDate(from)
     const toDate = parseInputDate(to)

     if (sameDate(fromDate, toDate)) return `theo ngày ${toDisplayDate(from)}`
     if (isFullRange(fromDate, toDate, startOfMonth, endOfMonth)) return `theo tháng ${monthYear(fromDate)}`
     if (isFullRange(fromDate, toDate, startOfQuarter, endOfQuarter)) {
          return `theo quý ${Math.floor(fromDate.getMonth() / 3) + 1}/${fromDate.getFullYear()}`
     }
     if (isFullRange(fromDate, toDate, startOfYear, endOfYear)) return `theo năm ${fromDate.getFullYear()}`

     return `từ ${toDisplayDate(from)} đến ${toDisplayDate(to)}`
}
