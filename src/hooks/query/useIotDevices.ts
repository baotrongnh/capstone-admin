"use client"

import { iotService } from "@/lib/services/iot.service"
import {
     IotBoardCreateLiteRequest,
     IotBoardDeleteResponse,
     IotBoardDeviceCreateLiteRequest,
     IotBoardDeviceDeleteResponse,
     IotBoardDeviceUpdateRequest,
     IotBoardDeviceUpdateResponse,
     IotBoardListQuery,
     IotBoardUpdateRequest,
} from "@/types/iot"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"

const IOT_BOARD_QUERY_KEY = "iot-boards"

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
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY] })
               message.success("Tạo board IoT thành công!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}

export const useUpdateIotBoard = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: ({ boardId, payload }: { boardId: string; payload: IotBoardUpdateRequest }) =>
               iotService.updateBoard(boardId, payload),
          onSuccess: (_, variables) => {
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY] })
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               message.success("Cập nhật board IoT thành công!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}

export const useDeleteIotBoard = () => {
     const queryClient = useQueryClient()

     return useMutation({
          mutationFn: (boardId: string): Promise<IotBoardDeleteResponse> => iotService.deleteBoard(boardId),
          onSuccess: () => {
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY] })
               message.success("Đã xóa board IoT!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}

export const useCreateIotBoardDevice = () => {
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
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY] })
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               message.success("Thêm thiết bị IoT thành công!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}

export const useUpdateIotBoardDevice = () => {
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
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY] })
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               message.success("Cập nhật thiết bị IoT thành công!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}

export const useDeleteIotBoardDevice = () => {
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
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY] })
               queryClient.invalidateQueries({ queryKey: [IOT_BOARD_QUERY_KEY, variables.boardId] })
               message.success("Đã xóa thiết bị IoT!")
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!")
          },
     })
}
