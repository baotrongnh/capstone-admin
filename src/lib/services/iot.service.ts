import {
     IotBoardCreateLiteRequest,
     IotBoardCreateResponse,
     IotBoardDeleteResponse,
     IotBoardDetailResponse,
     IotBoardDeviceCreateLiteRequest,
     IotBoardDeviceCreateResponse,
     IotBoardDeviceDeleteResponse,
     IotBoardDeviceUpdateRequest,
     IotBoardDeviceUpdateResponse,
     IotDoorPinResetRequest,
     IotDoorPinResetResponse,
     IotHealthCheckResponse,
     IotBoardListQuery,
     IotBoardListResponse,
     IotApartmentBoardsUnlinkResponse,
     IotBoardUnlinkApartmentResponse,
     IotBoardUpdateRequest,
     IotBoardUpdateResponse,
} from "@/types/iot"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const iotService = {
     getBoards: async (params?: IotBoardListQuery): Promise<IotBoardListResponse> => {
          const { data } = await apiClient.get(`${endpoints.iot}/boards`, { params })
          return data
     },

     getBoardById: async (boardId: string): Promise<IotBoardDetailResponse> => {
          const { data } = await apiClient.get(`${endpoints.iot}/boards/${boardId}`)
          return data
     },

     createBoard: async (payload: IotBoardCreateLiteRequest): Promise<IotBoardCreateResponse> => {
          const { data } = await apiClient.post(`${endpoints.iot}/boards`, payload)
          return data
     },

     updateBoard: async (
          boardId: string,
          payload: IotBoardUpdateRequest,
     ): Promise<IotBoardUpdateResponse> => {
          const { data } = await apiClient.patch(`${endpoints.iot}/boards/${boardId}`, payload)
          return data
     },

     deleteBoard: async (boardId: string): Promise<IotBoardDeleteResponse> => {
          const { data } = await apiClient.delete(`${endpoints.iot}/boards/${boardId}`)
          return data
     },

     unlinkBoardApartment: async (boardId: string): Promise<IotBoardUnlinkApartmentResponse> => {
          const { data } = await apiClient.patch(`${endpoints.iot}/boards/${boardId}/unlink-apartment`)
          return data
     },

     unlinkBoardsByApartment: async (apartmentId: string): Promise<IotApartmentBoardsUnlinkResponse> => {
          const { data } = await apiClient.patch(
               `${endpoints.iot}/boards/unlink-apartment-by-apartment/${apartmentId}`,
          )
          return data
     },

     createBoardDevice: async (
          boardId: string,
          payload: IotBoardDeviceCreateLiteRequest,
     ): Promise<IotBoardDeviceCreateResponse> => {
          const { data } = await apiClient.post(`${endpoints.iot}/boards/${boardId}/devices`, payload)
          return data
     },

     updateBoardDevice: async (
          boardId: string,
          deviceId: string,
          payload: IotBoardDeviceUpdateRequest,
     ): Promise<IotBoardDeviceUpdateResponse> => {
          const { data } = await apiClient.patch(
               `${endpoints.iot}/boards/${boardId}/devices/${deviceId}`,
               payload,
          )
          return data
     },

     deleteBoardDevice: async (
          boardId: string,
          deviceId: string,
     ): Promise<IotBoardDeviceDeleteResponse> => {
          const { data } = await apiClient.delete(`${endpoints.iot}/boards/${boardId}/devices/${deviceId}`)
          return data
     },

     resetDoorPin: async (
          boardId: string,
          deviceId: number,
          payload: IotDoorPinResetRequest,
     ): Promise<IotDoorPinResetResponse> => {
          const { data } = await apiClient.patch(`${endpoints.iot}/doors/${boardId}/${deviceId}/pin/reset`, payload)
          return data
     },

     checkBoardHealth: async (espId: string): Promise<IotHealthCheckResponse> => {
          const { data } = await apiClient.get(`${endpoints.iot}/devices/${espId}/check-health`)
          return data
     },
}
