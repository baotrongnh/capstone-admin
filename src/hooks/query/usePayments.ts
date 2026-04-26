"use client"

import { paymentService } from "@/lib/services/payment.service"
import type {
     ContractDepositPayoutConfirmRequest,
     ContractDepositPayoutItem,
     ContractDepositPayoutQuery,
     PartnerMonthlyPayoutConfirmRequest,
     PartnerMonthlyPayoutItem,
     PartnerMonthlyPayoutQuery,
} from "@/types/payment"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"

type PartnerConfirmPayload = Omit<PartnerMonthlyPayoutConfirmRequest, "transferProof"> & {
     transferProof: File
}

type DepositConfirmPayload = Omit<ContractDepositPayoutConfirmRequest, "transferProof"> & {
     transferProof: File
}

const PARTNER_PAYOUTS_QUERY_KEY = ["payments", "partner-monthly-payouts", "due"] as const
const DEPOSIT_PAYOUTS_QUERY_KEY = ["payments", "contract-deposit-payouts", "due"] as const

const appendOptional = (formData: FormData, key: string, value?: string) => {
     const normalized = value?.trim()
     if (normalized) formData.append(key, normalized)
}

const toPartnerFormData = (payload: PartnerConfirmPayload) => {
     const formData = new FormData()
     formData.append("partnerId", payload.partnerId)
     formData.append("payoutMonth", payload.payoutMonth)
     appendOptional(formData, "transferReference", payload.transferReference)
     appendOptional(formData, "transferNote", payload.transferNote)
     formData.append("transferProof", payload.transferProof)
     return formData
}

const toDepositFormData = (payload: DepositConfirmPayload) => {
     const formData = new FormData()
     formData.append("contractId", payload.contractId)
     appendOptional(formData, "transferReference", payload.transferReference)
     appendOptional(formData, "transferNote", payload.transferNote)
     appendOptional(formData, "refundReason", payload.refundReason)
     formData.append("transferProof", payload.transferProof)
     return formData
}

export const useDuePartnerMonthlyPayouts = (params?: PartnerMonthlyPayoutQuery) => useQuery<PartnerMonthlyPayoutItem[]>({
     queryKey: [...PARTNER_PAYOUTS_QUERY_KEY, params?.month ?? null],
     queryFn: () => paymentService.getDuePartnerMonthlyPayouts(params),
})

export const useDueContractDepositPayouts = (params?: ContractDepositPayoutQuery) => useQuery<ContractDepositPayoutItem[]>({
     queryKey: [...DEPOSIT_PAYOUTS_QUERY_KEY, params?.month ?? null],
     queryFn: () => paymentService.getDueContractDepositPayouts(params),
})

export const useConfirmPartnerMonthlyPayout = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (payload: PartnerConfirmPayload) => paymentService.confirmPartnerMonthlyPayout(toPartnerFormData(payload)),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: PARTNER_PAYOUTS_QUERY_KEY })
               message.success("Đã xác nhận chi trả doanh thu.")
          },
          onError: (error) => {
               message.error(error?.message || "Không thể xác nhận chi trả doanh thu.")
          },
     })
}

export const useConfirmContractDepositPayout = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (payload: DepositConfirmPayload) => paymentService.confirmContractDepositPayout(toDepositFormData(payload)),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: DEPOSIT_PAYOUTS_QUERY_KEY })
               message.success("Đã xác nhận trả tiền cọc.")
          },
          onError: (error) => {
               message.error(error?.message || "Không thể xác nhận trả tiền cọc.")
          },
     })
}
