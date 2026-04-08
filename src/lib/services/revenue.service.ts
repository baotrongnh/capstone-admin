import type {
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
}

const EMPTY_STAFF_PARTNER_PAYOUT_LIST: StaffPartnerPayoutListData = {
     items: [],
     total: 0,
     page: 1,
     limit: 20,
     totalPages: 0,
}

export const revenueService = {
     getOverview: async (params?: RevenueOverviewQuery): Promise<RevenueOverviewData> => {
          const { data } = await apiClient.get(`${endpoints.revenues}/overview`, { params })
          return data?.data ?? EMPTY_REVENUE_OVERVIEW
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
