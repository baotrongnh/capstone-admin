"use client"

import { invoiceService } from "@/lib/services/invoice.service"
import { useQuery } from "@tanstack/react-query"

type MonthlyUtilityInvoicesQuery = Parameters<typeof invoiceService.getMonthlyUtilityInvoices>[0]

export const useMonthlyUtilityInvoices = (params?: MonthlyUtilityInvoicesQuery) =>
     useQuery({
          queryKey: ["monthly-utility-invoices", params],
          queryFn: () => invoiceService.getMonthlyUtilityInvoices(params),
     })