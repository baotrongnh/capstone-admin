import type { paths } from "@/types/api"

export type CommissionPhaseInput =
     paths["/api/v1/contracts/cooperation/commission-phases"]["put"]["requestBody"]["content"]["application/json"]["phases"][number]

export type CommissionPhaseSaveResponse =
     paths["/api/v1/contracts/cooperation/commission-phases"]["put"]["responses"]["200"]["content"]["application/json"]

export type CommissionPhaseSaveResult = NonNullable<CommissionPhaseSaveResponse["data"]>

export type ApartmentPolicyListQuery =
     paths["/api/v1/apartment-policies"]["get"]["parameters"]["query"]

export type ApartmentPolicyListResponse =
     paths["/api/v1/apartment-policies"]["get"]["responses"]["200"]["content"]["application/json"]

export type ApartmentPolicyListItem = NonNullable<ApartmentPolicyListResponse["data"]>[number]

export type ApartmentPolicyCreateRequest =
     paths["/api/v1/apartment-policies"]["post"]["requestBody"]["content"]["application/json"]

export type ApartmentPolicyCreateResponse =
     paths["/api/v1/apartment-policies"]["post"]["responses"]["201"]["content"]["application/json"]

export type ApartmentPolicyCreateResult = NonNullable<ApartmentPolicyCreateResponse["data"]>

export type ApartmentPolicyDetailResponse =
     paths["/api/v1/apartment-policies/{id}"]["get"]["responses"]["200"]["content"]["application/json"]

export type ApartmentPolicyDetail = NonNullable<ApartmentPolicyDetailResponse["data"]>

export type ApartmentPolicyUpdateRequest =
     paths["/api/v1/apartment-policies/{id}"]["patch"]["requestBody"]["content"]["application/json"]

export type ApartmentPolicyUpdateResponse =
     paths["/api/v1/apartment-policies/{id}"]["patch"]["responses"]["200"]["content"]["application/json"]

export type ApartmentPolicyUpdateResult = NonNullable<ApartmentPolicyUpdateResponse["data"]>
