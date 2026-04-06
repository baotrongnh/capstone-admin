"use client"

import { amenityService } from "@/lib/services/amenity.service"
import { AmenityCreateRequestBody, AmenityUpdateRequestBody } from "@/types/amenity"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"

export const useAmenities = () =>
     useQuery({
          queryKey: ["amenities"],
          queryFn: () => amenityService.getList(),
     })

export const useAmenity = (id?: string) =>
     useQuery({
          queryKey: ["amenities", id],
          queryFn: () => amenityService.getById(id!),
          enabled: !!id,
     })

export const useCreateAmenity = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (payload: AmenityCreateRequestBody) => amenityService.create(payload),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["amenities"] })
               message.success("Tạo tiện ích thành công!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}

export const useUpdateAmenity = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({ id, payload }: { id: string; payload: AmenityUpdateRequestBody }) =>
               amenityService.update(id, payload),
          onSuccess: (_, variables) => {
               queryClient.invalidateQueries({ queryKey: ["amenities"] })
               queryClient.invalidateQueries({ queryKey: ["amenities", variables.id] })
               message.success("Cập nhật tiện ích thành công!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}

export const useDeactivateAmenity = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (id: string) => amenityService.deactivate(id),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: ["amenities"] })
               message.success("Đã vô hiệu hóa tiện ích!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}
