"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"

import { systemConfigService } from "@/lib/services/system-config.service"
import type {
     ApartmentPolicyCreateRequest,
     ApartmentPolicyDetail,
     ApartmentPolicyListQuery,
     ApartmentPolicyListResponse,
     ApartmentPolicyUpdateRequest,
     CommissionPhaseInput,
     CommissionPhaseSaveResponse,
} from "@/types/system-config"

export const useApartmentPolicies = (params?: ApartmentPolicyListQuery) =>
     useQuery<ApartmentPolicyListResponse>({
          queryKey: ["apartment-policies", params],
          queryFn: () => systemConfigService.getApartmentPolicies(params),
     })

export const useApartmentPolicy = (id?: string | null) =>
     useQuery<ApartmentPolicyDetail>({
          queryKey: ["apartment-policy", id],
          queryFn: async () => (await systemConfigService.getApartmentPolicyById(id!)).data!,
          enabled: !!id,
     })

export const useSaveCommissionPhases = () => {
     return useMutation<CommissionPhaseSaveResponse, Error, CommissionPhaseInput[]>({
          mutationFn: (phases) => systemConfigService.saveCommissionPhases(phases),
          onSuccess: () => {
               message.success("Đã cập nhật cấu hình tỷ lệ hoa hồng hệ thống.")
          },
          onError: (error) => {
               message.error(error?.message || "Không thể cập nhật cấu hình hoa hồng.")
          },
     })
}

export const useCreateApartmentPolicy = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (payload: ApartmentPolicyCreateRequest) => systemConfigService.createApartmentPolicy(payload),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["apartment-policies"] })
               message.success("Đã tạo gán policy cho căn hộ.")
          },
          onError: (error: Error) => {
               message.error(error?.message || "Không thể tạo gán policy.")
          },
     })
}

export const useUpdateApartmentPolicy = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({ id, payload }: { id: string; payload: ApartmentPolicyUpdateRequest }) =>
               systemConfigService.updateApartmentPolicy(id, payload),
          onSuccess: (_, variables) => {
               queryClient.invalidateQueries({ queryKey: ["apartment-policies"] })
               queryClient.invalidateQueries({ queryKey: ["apartment-policy", variables.id] })
               message.success("Đã cập nhật policy của căn hộ.")
          },
          onError: (error: Error) => {
               message.error(error?.message || "Không thể cập nhật policy.")
          },
     })
}

export const useDeleteApartmentPolicy = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (id: string) => systemConfigService.deleteApartmentPolicy(id),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["apartment-policies"] })
               message.success("Đã xóa gán policy khỏi căn hộ.")
          },
          onError: (error: Error) => {
               message.error(error?.message || "Không thể xóa policy khỏi căn hộ.")
          },
     })
}
