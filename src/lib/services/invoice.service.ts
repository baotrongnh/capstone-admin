import type { components, paths } from "@/types/api"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

type MonthlyUtilityInvoicesData = components["schemas"]["MonthlyUtilityInvoiceListDto"]
type MonthlyUtilityInvoicesQuery = paths["/api/v1/invoices/utility/monthly"]["get"]["parameters"]["query"]
type MonthlyUtilityInvoiceItem = components["schemas"]["MonthlyUtilityInvoiceDto"]

const EMPTY_MONTHLY_UTILITY_INVOICES: MonthlyUtilityInvoicesData = {
     items: [],
     total: 0,
     page: 1,
     limit: 12,
     totalPages: 0,
}

const normalizeMonthlyUtilityInvoices = (response: unknown, fallbackParams?: MonthlyUtilityInvoicesQuery): MonthlyUtilityInvoicesData => {
     const payload = response as {
          data?: MonthlyUtilityInvoicesData | MonthlyUtilityInvoiceItem[]
          meta?: { total?: number; page?: number; limit?: number; totalPages?: number }
     }

     const source = payload.data ?? response
     const meta = payload.meta

     if (Array.isArray(source)) {
          return {
               items: source,
               total: meta?.total ?? source.length,
               page: meta?.page ?? fallbackParams?.page ?? 1,
               limit: meta?.limit ?? fallbackParams?.limit ?? source.length,
               totalPages: meta?.totalPages ?? 1,
          }
     }

     if (source && typeof source === "object" && Array.isArray((source as MonthlyUtilityInvoicesData).items)) {
          return source as MonthlyUtilityInvoicesData
     }

     return EMPTY_MONTHLY_UTILITY_INVOICES
}

export const invoiceService = {
     getMonthlyUtilityInvoices: async (params?: MonthlyUtilityInvoicesQuery): Promise<MonthlyUtilityInvoicesData> => {
          const { data } = await apiClient.get(`${endpoints.invoices}/utility/monthly`, { params })
          return normalizeMonthlyUtilityInvoices(data, params)
     },
}
