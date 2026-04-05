import type { RevenuePeriod } from "@/types/revenue"

export const REVENUE_PERIOD_ORDER: RevenuePeriod[] = ["day", "month", "quarter", "year"]

export const REVENUE_PERIOD_LABEL: Record<RevenuePeriod, string> = {
     day: "Ngày",
     month: "Tháng",
     quarter: "Quý",
     year: "Năm",
}

export const REVENUE_PREVIOUS_LABEL: Record<RevenuePeriod, string> = {
     day: "Ngày trước",
     month: "Tháng trước",
     quarter: "Quý trước",
     year: "Năm trước",
}

export const REVENUE_PERIOD_META: Record<RevenuePeriod, { title: string; subtitle: string; count: number }> = {
     day: { title: "Theo ngày", subtitle: "Toàn bộ ngày trong tháng", count: 31 },
     month: { title: "Theo tháng", subtitle: "12 tháng trong năm", count: 12 },
     quarter: { title: "Theo quý", subtitle: "4 quý trong năm", count: 4 },
     year: { title: "Theo năm", subtitle: "5 năm gần nhất", count: 5 },
}

export const REVENUE_MAX_POINTS: Record<RevenuePeriod, number> = {
     day: 31,
     month: 24,
     quarter: 16,
     year: 10,
}

export const percentChange = (current: number, previous: number) => {
     if (previous <= 0) {
          return current > 0 ? 100 : 0
     }

     return ((current - previous) / previous) * 100
}

export const roundPercent = (value: number) => Number(value.toFixed(1))

export const formatSignedPercent = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`

export const formatAbsolutePercent = (value: number) => `${Math.abs(value).toFixed(1)}%`
