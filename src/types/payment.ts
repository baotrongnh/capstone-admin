import type { paths } from "@/types/api"

export type PartnerMonthlyPayoutQuery = paths["/api/v1/payments/partner-monthly-payouts/due"]["get"]["parameters"]["query"]

export type PartnerMonthlyPayoutResponse = paths["/api/v1/payments/partner-monthly-payouts/due"]["get"]["responses"]["200"]["content"]["application/json"]

export type PartnerMonthlyPayoutItem = NonNullable<PartnerMonthlyPayoutResponse["data"]>[number]

export type PartnerMonthlyPayoutConfirmRequest = paths["/api/v1/payments/partner-monthly-payouts/confirm"]["post"]["requestBody"]["content"]["multipart/form-data"]

export type PartnerMonthlyPayoutConfirmResponse = paths["/api/v1/payments/partner-monthly-payouts/confirm"]["post"]["responses"]["201"]["content"]["application/json"]

export type PartnerMonthlyPayoutConfirmResult = NonNullable<PartnerMonthlyPayoutConfirmResponse["data"]>

export type ContractDepositPayoutQuery = paths["/api/v1/payments/contract-deposit-payouts/due"]["get"]["parameters"]["query"]

export type ContractDepositPayoutResponse = paths["/api/v1/payments/contract-deposit-payouts/due"]["get"]["responses"]["200"]["content"]["application/json"]

export type ContractDepositPayoutItem = NonNullable<ContractDepositPayoutResponse["data"]>[number]

export type ContractDepositPayoutConfirmRequest = paths["/api/v1/payments/contract-deposit-payouts/confirm"]["post"]["requestBody"]["content"]["multipart/form-data"]

export type ContractDepositPayoutConfirmResponse = paths["/api/v1/payments/contract-deposit-payouts/confirm"]["post"]["responses"]["201"]["content"]["application/json"]

export type ContractDepositPayoutConfirmResult = NonNullable<ContractDepositPayoutConfirmResponse["data"]>
