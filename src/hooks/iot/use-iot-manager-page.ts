"use client"

import {
     createDefaultBoardForm,
     TOPIC_OPTIONS,
     type BoardFormState,
     type CreateDeviceRow,
} from "@/components/iot/iot-shared"
import { useApartments } from "@/hooks/query/useApartments"
import {
     useCreateIotBoard,
     useDeleteIotBoard,
     useIotBoards,
     useUpdateIotBoard,
} from "@/hooks/query/useIotDevices"
import type {
     IotBoardDeviceCreateRequest,
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
     const [deleteBoardTarget, setDeleteBoardTarget] = useState<{ id: string; name: string } | null>(null)

     const boardQuery = statusFilter === "__all__" ? undefined : { status: statusFilter }

     const {
          data: boardsResponse,
          isLoading: isBoardListLoading,
          isFetching: isBoardListFetching,
          refetch: refetchBoards,
     } = useIotBoards(boardQuery)

     const { data: apartmentResponse } = useApartments({ page: 1, limit: 100 })

     const createBoard = useCreateIotBoard()
     const updateBoard = useUpdateIotBoard()
     const deleteBoard = useDeleteIotBoard()

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

     const mapBoardToForm = (board: IotBoardItem, appendBlankDevice = false): BoardFormState => {
          const devicesFromBoard: CreateDeviceRow[] = board.devices.map((device) => {
               const topic = TOPIC_OPTIONS.includes((device.mqttTopic || "") as IotBoardDeviceCreateRequest["topic"])
                    ? (device.mqttTopic as IotBoardDeviceCreateRequest["topic"])
                    : "light"

               return {
                    deviceId: device.mqttDeviceId ? String(device.mqttDeviceId) : "",
                    deviceName: device.deviceName || "",
                    topic,
               }
          })

          const devices: CreateDeviceRow[] = devicesFromBoard.length
               ? devicesFromBoard
               : [{ deviceId: "", deviceName: "", topic: "light" }]

          if (appendBlankDevice) {
               devices.push({ deviceId: "", deviceName: "", topic: "light" })
          }

          return {
               id: board.id,
               apartmentId: board.apartment?.id || "",
               status: board.status,
               devices,
          }
     }

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
          setEditingBoardId(board.id)
          setBoardForm(mapBoardToForm(board))
          setIsBoardDialogOpen(true)
     }

     const openEditBoardForAddDevice = (boardId: string) => {
          const board = boards.find((item) => item.id === boardId)
          if (!board) return

          closeBoardDetailDialog()
          setEditingBoardId(board.id)
          setBoardForm(mapBoardToForm(board, true))
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

     const onBoardFieldChange = (field: "id" | "apartmentId" | "status", value: string) => {
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
                              status: boardForm.status,
                              devices: normalized,
                         },
                    })
               } else {
                    const { normalized: normalizedDevices, hasInvalidRow } = normalizeBoardDevices(boardForm.devices)

                    if (hasInvalidRow) {
                         message.error("Vui lòng nhập đầy đủ Device ID và tên thiết bị cho các dòng đã thêm.")
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

     const handleDeleteBoard = (boardId: string, boardName: string) => {
          setDeleteBoardTarget({ id: boardId, name: boardName })
     }

     const closeDeleteBoardDialog = () => {
          if (deleteBoard.isPending) return
          setDeleteBoardTarget(null)
     }

     const onDeleteBoardDialogOpenChange = (open: boolean) => {
          if (!open) {
               closeDeleteBoardDialog()
               return
          }
     }

     const confirmDeleteBoard = async () => {
          if (!deleteBoardTarget) return

          try {
               await deleteBoard.mutateAsync(deleteBoardTarget.id)
               setDeleteBoardTarget(null)
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
          isDeleteBoardDialogOpen: !!deleteBoardTarget,
          deleteBoardTargetName: deleteBoardTarget?.name || "",

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
          closeDeleteBoardDialog,
          onDeleteBoardDialogOpenChange,
          confirmDeleteBoard,
          openEditBoardForAddDevice,
     }
}
