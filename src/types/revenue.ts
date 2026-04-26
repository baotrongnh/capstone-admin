import type { paths } from "@/types/api"

export type RevenueOverviewQuery = paths["/api/v1/invoices/overview"]["get"]["parameters"]["query"]

export type RevenueOverviewData = NonNullable<
     paths["/api/v1/invoices/overview"]["get"]["responses"]["200"]["content"]["application/json"]["data"]
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

export type RevenueDashboardQuery = paths["/api/v1/invoices/dashboard"]["get"]["parameters"]["query"]

export type RevenueDashboardResponse = paths["/api/v1/invoices/dashboard"]["get"]["responses"]["200"]["content"]["application/json"]

export type RevenueDashboardApiData = NonNullable<RevenueDashboardResponse["data"]>

export type RevenueDashboardRankingItem = RevenueDashboardApiData["apartmentRevenueStats"]["topApartments"][number]

export type StaffPartnerPayoutListQuery = paths["/api/v1/invoices/staff/partner-payouts"]["get"]["parameters"]["query"]

export type StaffPartnerPayoutListResponse = paths["/api/v1/invoices/staff/partner-payouts"]["get"]["responses"]["200"]["content"]["application/json"]

export type StaffPartnerPayoutListData = NonNullable<StaffPartnerPayoutListResponse["data"]>

export type StaffPartnerPayoutItem = StaffPartnerPayoutListData["items"][number]

export type StaffPartnerPayoutConfirmRequest = paths["/api/v1/invoices/staff/partner-payouts/confirm"]["post"]["requestBody"]["content"]["multipart/form-data"]

export type StaffPartnerPayoutConfirmResponse = paths["/api/v1/invoices/staff/partner-payouts/confirm"]["post"]["responses"]["200"]["content"]["application/json"]

export type StaffPartnerPayoutConfirmResult = NonNullable<StaffPartnerPayoutConfirmResponse["data"]>
