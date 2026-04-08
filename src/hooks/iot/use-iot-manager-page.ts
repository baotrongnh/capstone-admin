"use client"

import {
     createDefaultBoardForm,
     createDefaultDeviceForm,
     TOPIC_OPTIONS,
     type BoardFormState,
     type DeviceFormState,
} from "@/components/iot/iot-shared"
import { useApartments } from "@/hooks/query/useApartments"
import {
     useCreateIotBoard,
     useCreateIotBoardDevice,
     useDeleteIotBoard,
     useDeleteIotBoardDevice,
     useIotBoards,
     useUpdateIotBoard,
     useUpdateIotBoardDevice,
} from "@/hooks/query/useIotDevices"
import type {
     IotBoardDeviceCreateRequest,
     IotBoardDeviceItem,
     IotBoardItem,
     IotBoardListQuery,
} from "@/types/iot"
import { message } from "antd"
import { useMemo, useState } from "react"

export function useIotManagerPage() {
     const [statusFilter, setStatusFilter] = useState<"__all__" | NonNullable<IotBoardListQuery["status"]>>("__all__")
     const [searchText, setSearchText] = useState("")

     const [isBoardDialogOpen, setIsBoardDialogOpen] = useState(false)
     const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
     const [boardForm, setBoardForm] = useState<BoardFormState>(createDefaultBoardForm)
     const [isBoardDetailDialogOpen, setIsBoardDetailDialogOpen] = useState(false)
     const [detailBoardId, setDetailBoardId] = useState<string | null>(null)

     const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false)
     const [activeBoardId, setActiveBoardId] = useState("")
     const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null)
     const [deviceForm, setDeviceForm] = useState<DeviceFormState>(createDefaultDeviceForm)

     const boardQuery = statusFilter === "__all__" ? undefined : { status: statusFilter }

     const {
          data: boardsResponse,
          isLoading: isBoardListLoading,
          isFetching: isBoardListFetching,
          refetch: refetchBoards,
     } = useIotBoards(boardQuery)

     const { data: apartmentResponse } = useApartments({ page: 1, limit: 200 })

     const createBoard = useCreateIotBoard()
     const updateBoard = useUpdateIotBoard()
     const deleteBoard = useDeleteIotBoard()
     const createBoardDevice = useCreateIotBoardDevice()
     const updateBoardDevice = useUpdateIotBoardDevice()
     const deleteBoardDevice = useDeleteIotBoardDevice()

     const boards = useMemo(() => boardsResponse?.data ?? [], [boardsResponse?.data])
     const apartmentOptions = apartmentResponse?.data || []

     const normalizedSearchText = searchText.trim().toLowerCase()

     const filteredBoards = useMemo(() => {
          if (!normalizedSearchText) {
               return boards
          }

          return boards.filter((board) => {
               const searchable = [
                    board.id,
                    board.name,
                    board.apartment?.apartmentNumber,
                    board.apartment?.address,
               ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()

               return searchable.includes(normalizedSearchText)
          })
     }, [boards, normalizedSearchText])

     const detailBoard = useMemo(
          () => boards.find((item) => item.id === detailBoardId) || null,
          [boards, detailBoardId],
     )

     const isBoardSaving = createBoard.isPending || updateBoard.isPending
     const isDeviceSaving = createBoardDevice.isPending || updateBoardDevice.isPending

     const resetBoardDialog = () => {
          setIsBoardDialogOpen(false)
          setEditingBoardId(null)
          setBoardForm(createDefaultBoardForm())
     }

     const openCreateBoardDialog = () => {
          setEditingBoardId(null)
          setBoardForm(createDefaultBoardForm())
          setIsBoardDialogOpen(true)
     }

     const openBoardDetailDialog = (board: IotBoardItem) => {
          setDetailBoardId(board.id)
          setIsBoardDetailDialogOpen(true)
     }

     const closeBoardDetailDialog = () => {
          setIsBoardDetailDialogOpen(false)
          setDetailBoardId(null)
     }

     const onBoardDetailDialogOpenChange = (open: boolean) => {
          if (!open) {
               closeBoardDetailDialog()
               return
          }
          setIsBoardDetailDialogOpen(true)
     }

     const openEditBoardDialog = (board: IotBoardItem) => {
          closeBoardDetailDialog()

          const devicesFromBoard = board.devices.map((device) => {
               const topic = TOPIC_OPTIONS.includes((device.mqttTopic || "") as IotBoardDeviceCreateRequest["topic"])
                    ? (device.mqttTopic as IotBoardDeviceCreateRequest["topic"])
                    : "light"

               return {
                    deviceId: device.mqttDeviceId ? String(device.mqttDeviceId) : "",
                    deviceName: device.deviceName || "",
                    topic,
               }
          })

          setEditingBoardId(board.id)
          setBoardForm({
               id: board.id,
               apartmentId: board.apartment?.id || "",
               devices: devicesFromBoard.length
                    ? devicesFromBoard
                    : [{ deviceId: "", deviceName: "", topic: "light" }],
          })
          setIsBoardDialogOpen(true)
     }

     const onBoardDialogOpenChange = (open: boolean) => {
          if (!open && isBoardSaving) return
          if (!open) {
               resetBoardDialog()
               return
          }
          setIsBoardDialogOpen(true)
     }

     const onBoardFieldChange = (field: "id" | "apartmentId", value: string) => {
          setBoardForm((prev) => ({
               ...prev,
               [field]: value,
          }))
     }

     const addCreateDeviceRow = () => {
          setBoardForm((prev) => ({
               ...prev,
               devices: [...prev.devices, { deviceId: "", deviceName: "", topic: "light" }],
          }))
     }

     const removeCreateDeviceRow = (index: number) => {
          setBoardForm((prev) => {
               const next = prev.devices.filter((_, i) => i !== index)
               return {
                    ...prev,
                    devices: next.length ? next : [{ deviceId: "", deviceName: "", topic: "light" }],
               }
          })
     }

     const setCreateDeviceField = (index: number, field: "deviceId" | "deviceName" | "topic", value: string) => {
          setBoardForm((prev) => ({
               ...prev,
               devices: prev.devices.map((item, i) =>
                    i === index
                         ? {
                              ...item,
                              [field]: value,
                         }
                         : item,
               ),
          }))
     }

     const normalizeBoardDevices = (rows: BoardFormState["devices"]) => {
          const normalized: Array<{
               deviceId: number
               deviceName: string
               topic: IotBoardDeviceCreateRequest["topic"]
               state: "OFF"
          }> = []
          let hasInvalidRow = false

          rows.forEach((item) => {
               const rawDeviceId = item.deviceId.trim()
               const normalizedDeviceName = item.deviceName.trim()
               const isBlankRow = !rawDeviceId && !normalizedDeviceName

               if (isBlankRow) {
                    return
               }

               const parsedDeviceId = Number(rawDeviceId)
               if (!Number.isFinite(parsedDeviceId) || parsedDeviceId <= 0 || !normalizedDeviceName) {
                    hasInvalidRow = true
                    return
               }

               normalized.push({
                    deviceId: parsedDeviceId,
                    deviceName: normalizedDeviceName,
                    topic: item.topic,
                    state: "OFF",
               })
          })

          return {
               normalized,
               hasInvalidRow,
          }
     }

     const handleSaveBoard = async () => {
          const boardId = boardForm.id.trim()
          if (!boardId) {
               message.error("Vui lòng nhập mã mạch.")
               return
          }

          try {
               if (editingBoardId) {
                    const { normalized, hasInvalidRow } = normalizeBoardDevices(boardForm.devices)

                    if (hasInvalidRow) {
                         message.error("Vui lòng nhập đầy đủ Device ID và tên thiết bị cho các dòng đã thêm.")
                         return
                    }

                    await updateBoard.mutateAsync({
                         boardId: editingBoardId,
                         payload: {
                              id: boardId,
                              apartmentId: boardForm.apartmentId || undefined,
                              devices: normalized,
                         },
                    })
               } else {
                    const { normalized: normalizedDevices, hasInvalidRow } = normalizeBoardDevices(boardForm.devices)

                    if (hasInvalidRow) {
                         message.error("Vui lòng nhập đầy đủ Device ID và tên thiết bị cho các dòng đã thêm.")
                         return
                    }

                    if (!normalizedDevices.length) {
                         message.error("Vui lòng nhập ít nhất 1 thiết bị hợp lệ (có Device ID và tên thiết bị) khi tạo mạch.")
                         return
                    }

                    await createBoard.mutateAsync({
                         id: boardId,
                         apartmentId: boardForm.apartmentId || undefined,
                         devices: normalizedDevices,
                    })
               }

               resetBoardDialog()
          } catch {
               // Error toast handled in hooks.
          }
     }

     const handleDeleteBoard = async (boardId: string, boardName: string) => {
          const accepted = window.confirm(`Bạn có chắc chắn muốn xóa mạch ${boardName}?`)
          if (!accepted) return

          try {
               await deleteBoard.mutateAsync(boardId)
          } catch {
               // Error toast handled in hooks.
          }
     }

     const openCreateDeviceDialog = (boardId: string) => {
          setIsBoardDetailDialogOpen(false)
          setActiveBoardId(boardId)
          setEditingDeviceId(null)
          setDeviceForm(createDefaultDeviceForm())
          setIsDeviceDialogOpen(true)
     }

     const startCreateDeviceFromEdit = () => {
          if (!activeBoardId) return
          setEditingDeviceId(null)
          setDeviceForm(createDefaultDeviceForm())
     }

     const openEditDeviceDialog = (boardId: string, device: IotBoardDeviceItem) => {
          setIsBoardDetailDialogOpen(false)

          const topic = TOPIC_OPTIONS.includes((device.mqttTopic || "") as IotBoardDeviceCreateRequest["topic"])
               ? (device.mqttTopic as IotBoardDeviceCreateRequest["topic"])
               : "light"

          setActiveBoardId(boardId)
          setEditingDeviceId(device.id)
          setDeviceForm({
               deviceId: device.mqttDeviceId ? String(device.mqttDeviceId) : "",
               deviceName: device.deviceName || "",
               topic,
               state: device.mqttState || "OFF",
          })
          setIsDeviceDialogOpen(true)
     }

     const closeDeviceDialog = () => {
          if (isDeviceSaving) return
          setIsDeviceDialogOpen(false)
          setActiveBoardId("")
          setEditingDeviceId(null)
          setDeviceForm(createDefaultDeviceForm())
     }

     const onDeviceDialogOpenChange = (open: boolean) => {
          if (!open) {
               closeDeviceDialog()
               return
          }
          setIsDeviceDialogOpen(true)
     }

     const onDeviceFieldChange = (field: keyof DeviceFormState, value: string) => {
          setDeviceForm((prev) => ({
               ...prev,
               [field]: value,
          }))
     }

     const handleSaveDevice = async () => {
          if (!activeBoardId) {
               message.error("Không xác định được mạch để thao tác thiết bị.")
               return
          }

          const parsedDeviceId = Number(deviceForm.deviceId)
          if (!Number.isFinite(parsedDeviceId) || parsedDeviceId <= 0) {
               message.error("Vui lòng nhập Device ID hợp lệ (lớn hơn 0).")
               return
          }

          const normalizedDeviceName = deviceForm.deviceName.trim()
          if (!normalizedDeviceName) {
               message.error("Vui lòng nhập tên thiết bị.")
               return
          }

          try {
               if (editingDeviceId) {
                    await updateBoardDevice.mutateAsync({
                         boardId: activeBoardId,
                         deviceId: editingDeviceId,
                         payload: {
                              deviceId: parsedDeviceId,
                              deviceName: normalizedDeviceName,
                              topic: deviceForm.topic,
                              state: deviceForm.state.trim() || undefined,
                         },
                    })
               } else {
                    await createBoardDevice.mutateAsync({
                         boardId: activeBoardId,
                         payload: {
                              deviceId: parsedDeviceId,
                              deviceName: normalizedDeviceName,
                              topic: deviceForm.topic,
                              state: "OFF",
                         },
                    })
               }

               closeDeviceDialog()
          } catch {
               // Error toast handled in hooks.
          }
     }

     const handleDeleteDevice = async (boardId: string, deviceId: string, deviceName?: string | null) => {
          const accepted = window.confirm(`Bạn có chắc chắn muốn xóa thiết bị ${deviceName || deviceId}?`)
          if (!accepted) return

          try {
               await deleteBoardDevice.mutateAsync({ boardId, deviceId })
          } catch {
               // Error toast handled in hooks.
          }
     }

     return {
          statusFilter,
          setStatusFilter,
          searchText,
          setSearchText,
          boards,
          filteredBoards,
          apartmentOptions,
          isBoardListLoading,
          isBoardListFetching,
          refetchBoards,
          isDeletingBoard: deleteBoard.isPending,
          isDeletingDevice: deleteBoardDevice.isPending,

          isBoardDialogOpen,
          editingBoardId,
          boardForm,
          isBoardSaving,
          isBoardDetailDialogOpen,
          detailBoard,
          openCreateBoardDialog,
          openBoardDetailDialog,
          onBoardDetailDialogOpenChange,
          closeBoardDetailDialog,
          openEditBoardDialog,
          onBoardDialogOpenChange,
          resetBoardDialog,
          handleSaveBoard,
          onBoardFieldChange,
          addCreateDeviceRow,
          removeCreateDeviceRow,
          setCreateDeviceField,
          handleDeleteBoard,

          isDeviceDialogOpen,
          editingDeviceId,
          activeBoardId,
          deviceForm,
          isDeviceSaving,
          openCreateDeviceDialog,
          startCreateDeviceFromEdit,
          openEditDeviceDialog,
          onDeviceDialogOpenChange,
          closeDeviceDialog,
          onDeviceFieldChange,
          handleSaveDevice,
          handleDeleteDevice,
     }
}
