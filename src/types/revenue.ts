import type { paths } from "@/types/api"

export type RevenueOverviewQuery = paths["/api/v1/revenues/overview"]["get"]["parameters"]["query"]

export type RevenueOverviewData = NonNullable<
     paths["/api/v1/revenues/overview"]["get"]["responses"]["200"]["content"]["application/json"]["data"]
>

export type RevenuePeriod = "day" | "month" | "quarter" | "year"

export type RevenueDateFilter = {
     from?: string
     to?: string
}

export type RevenueDateRange = {
     label: string
     from: string
     to: string
}

export type RevenuePoint = RevenueOverviewData & RevenueDateRange

export type RevenueSummary = {
     period: RevenuePeriod
     title: string
     current: number
     previous: number
     changePercent: number
}

export type RevenueTrend = {
     period: RevenuePeriod
     title: string
     subtitle: string
     points: RevenuePoint[]
     current: number
     previous: number
     changePercent: number
}

export type RevenueDashboardData = {
     period: RevenuePeriod
     trend: RevenueTrend
     summary: RevenueSummary
     piePoint: RevenuePoint | null
}
