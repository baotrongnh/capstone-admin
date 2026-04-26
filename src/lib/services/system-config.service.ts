import { apiClient } from "@/lib/apis/client"
import { endpoints } from "@/lib/apis/endpoints"
import type {
     ApartmentPolicyCreateRequest,
     ApartmentPolicyCreateResponse,
     ApartmentPolicyDetailResponse,
     ApartmentPolicyListQuery,
     ApartmentPolicyListResponse,
     ApartmentPolicyUpdateRequest,
     ApartmentPolicyUpdateResponse,
     CommissionPhaseInput,
     CommissionPhaseSaveResponse,
} from "@/types/system-config"

export const systemConfigService = {
     saveCommissionPhases: async (phases: CommissionPhaseInput[]): Promise<CommissionPhaseSaveResponse> => {
          const { data } = await apiClient.put(`${endpoints.contracts}/cooperation/commission-phases`, { phases })
          return data
     },

     getApartmentPolicies: async (params?: ApartmentPolicyListQuery): Promise<ApartmentPolicyListResponse> => {
          const { data } = await apiClient.get(endpoints.apartmentPolicies, { params })
          return data
     },

     getApartmentPolicyById: async (id: string): Promise<ApartmentPolicyDetailResponse> => {
          const { data } = await apiClient.get(`${endpoints.apartmentPolicies}/${id}`)
          return data
     },

     createApartmentPolicy: async (payload: ApartmentPolicyCreateRequest): Promise<ApartmentPolicyCreateResponse> => {
          const { data } = await apiClient.post(endpoints.apartmentPolicies, payload)
          return data
     },

     updateApartmentPolicy: async (id: string, payload: ApartmentPolicyUpdateRequest): Promise<ApartmentPolicyUpdateResponse> => {
          const { data } = await apiClient.patch(`${endpoints.apartmentPolicies}/${id}`, payload)
          return data
     },

     deleteApartmentPolicy: async (id: string) => {
          const { data } = await apiClient.delete(`${endpoints.apartmentPolicies}/${id}`)
          return data
     },
}
