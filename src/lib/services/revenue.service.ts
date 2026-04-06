import type { RevenueOverviewData, RevenueOverviewQuery } from "@/types/revenue"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

const EMPTY_REVENUE_OVERVIEW: RevenueOverviewData = {
     invoiceCount: 0,
     totalInvoiceAmount: 0,
     totalSystemRevenue: 0,
     totalPartnerGrossRevenue: 0,
     totalPartnerNetPayout: 0,
}

export const revenueService = {
     getOverview: async (params?: RevenueOverviewQuery): Promise<RevenueOverviewData> => {
          const { data } = await apiClient.get(`${endpoints.revenues}/overview`, { params })
          return data?.data ?? EMPTY_REVENUE_OVERVIEW
     },
}
