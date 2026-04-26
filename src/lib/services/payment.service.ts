import type {
     ContractDepositPayoutConfirmResult,
     ContractDepositPayoutItem,
     ContractDepositPayoutQuery,
     PartnerMonthlyPayoutConfirmResult,
     PartnerMonthlyPayoutItem,
     PartnerMonthlyPayoutQuery,
} from "@/types/payment"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const paymentService = {
     getDuePartnerMonthlyPayouts: async (params?: PartnerMonthlyPayoutQuery): Promise<PartnerMonthlyPayoutItem[]> => {
          const { data } = await apiClient.get(`${endpoints.payments}/partner-monthly-payouts/due`, { params })
          return data?.data ?? []
     },

     confirmPartnerMonthlyPayout: async (payload: FormData): Promise<PartnerMonthlyPayoutConfirmResult> => {
          const { data } = await apiClient.post(`${endpoints.payments}/partner-monthly-payouts/confirm`, payload, {
               headers: { "Content-Type": "multipart/form-data" },
          })
          return data?.data
     },

     getDueContractDepositPayouts: async (params?: ContractDepositPayoutQuery): Promise<ContractDepositPayoutItem[]> => {
          const { data } = await apiClient.get(`${endpoints.payments}/contract-deposit-payouts/due`, { params })
          return data?.data ?? []
     },

     confirmContractDepositPayout: async (payload: FormData): Promise<ContractDepositPayoutConfirmResult> => {
          const { data } = await apiClient.post(`${endpoints.payments}/contract-deposit-payouts/confirm`, payload, {
               headers: { "Content-Type": "multipart/form-data" },
          })
          return data?.data
     },
}
