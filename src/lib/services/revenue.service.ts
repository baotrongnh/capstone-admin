import type {
     RevenueDashboardApiData,
     RevenueDashboardQuery,
     RevenueOverviewData,
     RevenueOverviewQuery,
     StaffPartnerPayoutConfirmResult,
     StaffPartnerPayoutListData,
     StaffPartnerPayoutListQuery,
} from "@/types/revenue"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

const EMPTY_REVENUE_OVERVIEW: RevenueOverviewData = {
     invoiceCount: 0,
     totalInvoiceAmount: 0,
     totalSystemRevenue: 0,
     totalPartnerGrossRevenue: 0,
     totalPartnerNetPayout: 0,
     invoices: [],
     page: 1,
     limit: 20,
     totalPages: 0,
}

const EMPTY_STAFF_PARTNER_PAYOUT_LIST: StaffPartnerPayoutListData = {
     items: [],
     total: 0,
     page: 1,
     limit: 20,
     totalPages: 0,
}

const EMPTY_REVENUE_DASHBOARD: RevenueDashboardApiData = {
     userStats: {
          totalActiveUsers: 0,
          totalActivePartners: 0,
          totalActiveNonPartnerUsers: 0,
          partnerRatio: 0,
          userRatio: 0,
     },
     occupancyStats: {
          occupiedApartmentCount: 0,
          vacantApartmentCount: 0,
     },
     apartmentRevenueStats: {
          topApartments: [],
          bottomApartments: [],
     },
     systemRevenueSummary: {
          totalPaidRevenue: 0,
          totalSystemRevenue: 0,
          totalPartnerGrossRevenue: 0,
          totalPartnerNetPayout: 0,
          invoiceCount: 0,
     },
}

export const revenueService = {
     getOverview: async (params?: RevenueOverviewQuery): Promise<RevenueOverviewData> => {
          const { data } = await apiClient.get(`${endpoints.invoices}/overview`, { params })
          return data?.data ?? EMPTY_REVENUE_OVERVIEW
     },

     getDashboard: async (params?: RevenueDashboardQuery): Promise<RevenueDashboardApiData> => {
          const { data } = await apiClient.get(`${endpoints.invoices}/dashboard`, { params })
          return data?.data ?? EMPTY_REVENUE_DASHBOARD
     },

     getStaffPartnerPayouts: async (params?: StaffPartnerPayoutListQuery): Promise<StaffPartnerPayoutListData> => {
          const { data } = await apiClient.get(`${endpoints.revenues}/staff/partner-payouts`, { params })
          return data?.data ?? EMPTY_STAFF_PARTNER_PAYOUT_LIST
     },

     confirmStaffPartnerPayout: async (payload: FormData): Promise<StaffPartnerPayoutConfirmResult> => {
          const { data } = await apiClient.post(`${endpoints.revenues}/staff/partner-payouts/confirm`, payload, {
               headers: {
                    "Content-Type": "multipart/form-data",
               },
          })

          return (data?.data ?? data) as StaffPartnerPayoutConfirmResult
     },
}
