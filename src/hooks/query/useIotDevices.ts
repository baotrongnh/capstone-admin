"use client"

import { iotService } from "@/lib/services/iot.service"
import {
     IotApartmentBoardsUnlinkResponse,
     IotBoardCreateLiteRequest,
     IotBoardDeleteResponse,
     IotBoardDeviceCreateLiteRequest,
     IotBoardDeviceDeleteResponse,
     IotBoardDeviceUpdateRequest,
     IotBoardDeviceUpdateResponse,
     IotDoorPinResetRequest,
     IotDoorPinResetResponse,
     IotHealthCheckResponse,
     IotBoardListQuery,
     IotBoardUnlinkApartmentResponse,
     IotBoardUpdateRequest,
     UpdateGlobalUtilityRatesRequest,
} from "@/types/iot"
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"

const IOT_BOARD_QUERY_KEY = "iot-boards"
const CURRENT_UTILITY_RATES_QUERY_KEY = "utility-rates-current"
const GLOBAL_UTILITY_RATES_QUERY_KEY = "utility-rates-global"

const getErrorMessage = (error: unknown, fallback = "Đã có lỗi xảy ra, vui lòng thử lại sau!") => {
     if (!error || typeof error !== "object") {
          return fallback
     }

     const maybeMessage = "message" in error ? (error as { message?: unknown }).message : undefined
     return typeof maybeMessage === "string" && maybeMessage.trim() ? maybeMessage : fallback
}

const invalidateBoardQueries = (queryClient: QueryClient) => {
     queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY] })
}

export const useIotBoards = (params?: IotBoardListQuery) =>
     useQuery({
          queryKey: [IOT_BOARD_QUERY_KEY, params],
          queryFn: () => iotService.getBoards(params),
     })

export const useIotBoard = (boardId?: string) =>
     useQuery({
          queryKey: [IOT_BOARD_QUERY_KEY, boardId],
          queryFn: () => iotService.getBoardById(boardId!),
          enabled: !!boardId,
     })

export const useCreateIotBoard = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (payload: IotBoardCreateLiteRequest) => iotService.createBoard(payload),
          onSuccess: () => {
               invalidateBoardQueries(queryClient)
               message.success("Tạo board IoT thành công!")
          },
          onError: (error) => {
               message.error(getErrorMessage(error))
          },
     })
}

export const useUpdateIotBoard = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({ boardId, payload }: { boardId: string; payload: IotBoardUpdateRequest }) =>
               iotService.updateBoard(boardId, payload),
          onSuccess: (_, variables) => {
               invalidateBoardQueries(queryClient)
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               message.success("Cập nhật board IoT thành công!")
          },
          onError: (error) => {
               message.error(getErrorMessage(error))
          },
     })
}

export const useDeleteIotBoard = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (boardId: string): Promise<IotBoardDeleteResponse> => iotService.deleteBoard(boardId),
          onSuccess: () => {
               invalidateBoardQueries(queryClient)
               message.success("Đã khóa mạch IoT và thiết bị con!")
          },
          onError: (error) => {
               message.error(getErrorMessage(error))
          },
     })
}

export const useUnlinkBoardApartment = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (boardId: string): Promise<IotBoardUnlinkApartmentResponse> =>
               iotService.unlinkBoardApartment(boardId),
          onSuccess: (_, boardId) => {
               invalidateBoardQueries(queryClient)
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, boardId] })
               message.success("Đã hủy liên kết căn hộ khỏi mạch IoT!")
          },
          onError: (error) => {
               message.error(getErrorMessage(error))
          },
     })
}

export const useUnlinkBoardsByApartment = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (apartmentId: string): Promise<IotApartmentBoardsUnlinkResponse> =>
               iotService.unlinkBoardsByApartment(apartmentId),
          onSuccess: (response) => {
               invalidateBoardQueries(queryClient)
               const affectedBoards = response?.data?.affectedBoards ?? 0
               const affectedDevices = response?.data?.affectedDevices ?? 0
               message.success(`Đã hủy liên kết ${affectedBoards} mạch (${affectedDevices} thiết bị).`)
          },
          onError: (error) => {
               message.error(getErrorMessage(error))
          },
     })
}

export const useCreateIotBoardDevice = (silentSuccess = false) => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({
               boardId,
               payload,
          }: {
               boardId: string
               payload: IotBoardDeviceCreateLiteRequest
          }) => iotService.createBoardDevice(boardId, payload),
          onSuccess: (_, variables) => {
               invalidateBoardQueries(queryClient)
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               if (!silentSuccess) {
                    message.success("Thêm thiết bị IoT thành công!")
               }
          },
          onError: (error) => {
               message.error(getErrorMessage(error))
          },
     })
}

export const useUpdateIotBoardDevice = (silentSuccess = false) => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({
               boardId,
               deviceId,
               payload,
          }: {
               boardId: string
               deviceId: string
               payload: IotBoardDeviceUpdateRequest
          }): Promise<IotBoardDeviceUpdateResponse> =>
               iotService.updateBoardDevice(boardId, deviceId, payload),
          onSuccess: (_, variables) => {
               invalidateBoardQueries(queryClient)
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               if (!silentSuccess) {
                    message.success("Cập nhật thiết bị IoT thành công!")
               }
          },
          onError: (error) => {
               const errorMessage = getErrorMessage(error)
               if (errorMessage.includes("status code 409")) {
                    message.error("Bị trùng ID của thiết bị trong cùng 1 topic!")
                    return
               }
               message.error(errorMessage)
          },
     })
}

export const useDeleteIotBoardDevice = (silentSuccess = false) => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({
               boardId,
               deviceId,
          }: {
               boardId: string
               deviceId: string
          }): Promise<IotBoardDeviceDeleteResponse> =>
               iotService.deleteBoardDevice(boardId, deviceId),
          onSuccess: (_, variables) => {
               invalidateBoardQueries(queryClient)
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               if (!silentSuccess) {
                    message.success("Đã xóa thiết bị IoT!")
               }
          },
          onError: (error) => {
               message.error(getErrorMessage(error))
          },
     })
}

export const useResetIotDoorPin = () => {
     return useMutation({
          mutationFn: ({
               boardId,
               deviceId,
               payload,
          }: {
               boardId: string
               deviceId: number
               payload: IotDoorPinResetRequest
          }): Promise<IotDoorPinResetResponse> =>
               iotService.resetDoorPin(boardId, deviceId, payload),
          onSuccess: (response) => {
               message.success(response?.data?.message || "Đã đặt lại mật khẩu cửa thành công.")
          },
          onError: (error) => {
               message.error(getErrorMessage(error, "Không thể đặt lại mật khẩu cửa."))
          },
     })
}

export const useCheckIotBoardHealth = () => {
     return useMutation({
          mutationFn: (espId: string): Promise<IotHealthCheckResponse> => iotService.checkBoardHealth(espId),
          onError: (error) => {
               message.error(getErrorMessage(error, "Không thể kiểm tra trạng thái online của mạch."))
          },
     })
}

export const useCurrentUtilityRatesByApartments = (apartmentIds: string[]) =>
     useQuery({
          queryKey: [CURRENT_UTILITY_RATES_QUERY_KEY, apartmentIds],
          queryFn: async () => {
               const results = await Promise.allSettled(
                    apartmentIds.map((apartmentId) => iotService.getCurrentUtilityRates({ apartmentId })),
               )

               return apartmentIds.map((apartmentId, index) => {
                    const result = results[index]
                    return {
                         apartmentId,
                         rates: result.status === "fulfilled" ? result.value.data ?? null : null,
                         isError: result.status === "rejected",
                    }
               })
          },
          enabled: apartmentIds.length > 0,
     })

export const useGlobalUtilityRates = () =>
     useQuery({
          queryKey: [GLOBAL_UTILITY_RATES_QUERY_KEY],
          queryFn: () => iotService.getGlobalUtilityRates(),
     })

export const useUpdateGlobalUtilityRates = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (payload: UpdateGlobalUtilityRatesRequest) => iotService.updateGlobalUtilityRates(payload),
          onSuccess: (response) => {
               queryClient.setQueryData([GLOBAL_UTILITY_RATES_QUERY_KEY], response)
               message.success("Cập nhật giá mặc định toàn hệ thống thành công!")
          },
          onError: (error) => {
               message.error(getErrorMessage(error, "Không thể cập nhật giá mặc định toàn hệ thống."))
          },
     })
}
