import {
     AmenityCreateRequestBody,
     AmenityCreateResponse,
     AmenityDeactivateResponse,
     AmenityDetailResponse,
     AmenityListResponse,
     AmenityUpdateRequestBody,
     AmenityUpdateResponse,
} from "@/types/amenity"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const amenityService = {
     getList: async (): Promise<AmenityListResponse> => {
          const { data } = await apiClient.get(endpoints.amenities)
          return data
     },

     getById: async (id: string): Promise<AmenityDetailResponse> => {
          const { data } = await apiClient.get(`${endpoints.amenities}/${id}`)
          return data
     },

     create: async (payload: AmenityCreateRequestBody): Promise<AmenityCreateResponse> => {
          const { data } = await apiClient.post(endpoints.amenities, payload)
          return data
     },

     update: async (
          id: string,
          payload: AmenityUpdateRequestBody,
     ): Promise<AmenityUpdateResponse> => {
          const { data } = await apiClient.patch(`${endpoints.amenities}/${id}`, payload)
          return data
     },

     deactivate: async (id: string): Promise<AmenityDeactivateResponse> => {
          const { data } = await apiClient.delete(`${endpoints.amenities}/${id}`)
          return data
     },
}
