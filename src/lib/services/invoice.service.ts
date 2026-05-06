import type { components, paths } from "@/types/api"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

type MonthlyUtilityInvoicesData = components["schemas"]["MonthlyUtilityInvoiceListDto"]
type MonthlyUtilityInvoicesQuery = paths["/api/v1/invoices/utility/monthly"]["get"]["parameters"]["query"]

const EMPTY_MONTHLY_UTILITY_INVOICES: MonthlyUtilityInvoicesData = {
     items: [],
     total: 0,
     page: 1,
     limit: 12,
     totalPages: 0,
}

export const invoiceService = {
     getMonthlyUtilityInvoices: async (params?: MonthlyUtilityInvoicesQuery): Promise<MonthlyUtilityInvoicesData> => {
          const { data } = await apiClient.get(`${endpoints.invoices}/utility/monthly`, { params })
          return data?.data ?? EMPTY_MONTHLY_UTILITY_INVOICES
     },
}