"use client"

import { createDefaultBoardForm, type BoardFormState, type CreateDeviceRow } from "@/components/iot/iot-shared"
import { useApartments } from "@/hooks/query/useApartments"
import { useCreateIotBoard, useCreateIotBoardDevice, useDeleteIotBoard, useIotBoards, useUnlinkBoardApartment, useUpdateIotBoard, useUpdateIotBoardDevice } from "@/hooks/query/useIotDevices"
import type { IotBoardDeviceCreateRequest, IotBoardItem, IotBoardListQuery } from "@/types/iot"
import { message } from "antd"
import { useCallback, useMemo, useState } from "react"

type NormalizedBoardDevice = {
     id?: string
     deviceId: number
     deviceName: string
     topic: IotBoardDeviceCreateRequest["topic"]
     state: "OFF"
}

const mapBoardDevicesToRows = (board: IotBoardItem): CreateDeviceRow[] => {
     const rows = board.devices.map((device) => {
          const rawTopic = (device.topic || "") as IotBoardDeviceCreateRequest["topic"]

          return {
               id: device.id,
               deviceId: String(device.deviceId) || "",
               deviceName: device.deviceName || "",
               topic: rawTopic || 'light',
          }
     })

     return rows
}

type StatusFilterValue = "__all__" | NonNullable<IotBoardListQuery["status"]>

export function useIotManagerPage() {
     const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("__all__")
     const [searchText, setSearchText] = useState("")

     const [isBoardDialogOpen, setIsBoardDialogOpen] = useState(false)
     const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
     const [initialEditApartmentId, setInitialEditApartmentId] = useState<string | null>(null)
     const [canSelectApartment, setCanSelectApartment] = useState(true)
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
     const createBoardDevice = useCreateIotBoardDevice()
     const updateBoardDevice = useUpdateIotBoardDevice()
     const deleteBoard = useDeleteIotBoard()
     const unlinkBoardApartment = useUnlinkBoardApartment()

     const boards = useMemo(() => boardsResponse?.data ?? [], [boardsResponse?.data])
     const apartmentOptions = useMemo(() => {
          return apartmentResponse?.data || []
     }, [apartmentResponse])

     const createEmptyDeviceRow = (): CreateDeviceRow => ({
          deviceId: "",
          deviceName: "",
          topic: "light",
     })

     const filteredBoards = useMemo(() => {
          if (!searchText) {
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

               return searchable.includes(searchText.trim().toLowerCase())
          })
     }, [boards, searchText])

     const detailBoard = useMemo(
          () => boards.find((item) => item.id === detailBoardId) || null,
          [boards, detailBoardId],
     )

     const boardById = useMemo(
          () => new Map(boards.map((board) => [board.id, board])),
          [boards],
     )

     const isBoardSaving = createBoard.isPending
          || updateBoard.isPending
          || createBoardDevice.isPending
          || updateBoardDevice.isPending
          || unlinkBoardApartment.isPending

     const resetBoardDialog = useCallback(() => {
          setIsBoardDialogOpen(false)
          setEditingBoardId(null)
          setInitialEditApartmentId(null)
          setCanSelectApartment(true)
          setBoardForm(createDefaultBoardForm())
     }, [])

     const openCreateBoardDialog = useCallback(() => {
          setEditingBoardId(null)
          setInitialEditApartmentId(null)
          setCanSelectApartment(true)
          setBoardForm(createDefaultBoardForm())
          setIsBoardDialogOpen(true)
     }, [])

     const openBoardDetailDialog = useCallback((board: IotBoardItem) => {
          setDetailBoardId(board.id)
          setIsBoardDetailDialogOpen(true)
     }, [])

     const closeBoardDetailDialog = useCallback(() => {
          setIsBoardDetailDialogOpen(false)
          setDetailBoardId(null)
     }, [])

     const onBoardDetailDialogOpenChange = useCallback((open: boolean) => {
          if (!open) {
               closeBoardDetailDialog()
               return
          }
          setIsBoardDetailDialogOpen(true)
     }, [closeBoardDetailDialog])

     const openEditBoardDialog = useCallback((board: IotBoardItem) => {
          closeBoardDetailDialog()
          setEditingBoardId(board.id)
          setInitialEditApartmentId(board.apartment?.id || null)
          setCanSelectApartment(!board.apartment?.id)
          setBoardForm({
               id: board.id,
               apartmentId: board.apartment?.id || "",
               status: board.status,
               devices: mapBoardDevicesToRows(board),
          })
          setIsBoardDialogOpen(true)
     }, [closeBoardDetailDialog])

     const openEditBoardForAddDevice = useCallback((boardId: string) => {
          const board = boardById.get(boardId)
          if (!board) return

          openEditBoardDialog(board)
     }, [boardById, openEditBoardDialog])

     const onBoardDialogOpenChange = useCallback((open: boolean) => {
          if (!open && isBoardSaving) return
          if (!open) {
               resetBoardDialog()
               return
          }
          setIsBoardDialogOpen(true)
     }, [isBoardSaving, resetBoardDialog])

     const onBoardFieldChange = useCallback((field: "id" | "apartmentId" | "status", value: string) => {
          setBoardForm((prev) => ({
               ...prev,
               [field]: value,
          }))
     }, [])

     const addCreateDeviceRow = useCallback(() => {
          setBoardForm((prev) => ({
               ...prev,
               devices: [...prev.devices],
          }))
     }, [])

     const removeCreateDeviceRow = useCallback((index: number) => {
          setBoardForm((prev) => {
               const next = prev.devices.filter((_, i) => i !== index)
               return {
                    ...prev,
                    devices: next
               }
          })
     }, [])

     const setCreateDeviceField = useCallback((index: number, field: "deviceId" | "deviceName" | "topic", value: string) => {
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
     }, [])

     const normalizeBoardDevices = (rows: BoardFormState["devices"]) => {
          const normalized: NormalizedBoardDevice[] = []
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
                    id: item.id,
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

     const getValidNormalizedDevices = useCallback((rows: BoardFormState["devices"]) => {
          const { normalized, hasInvalidRow } = normalizeBoardDevices(rows)

          if (hasInvalidRow) {
               message.error("Vui lòng nhập đầy đủ Device ID và tên thiết bị cho các dòng đã thêm.")
               return null
          }

          return normalized
     }, [])

     const persistDevicesToBoard = useCallback(async (boardId: string, normalizedDevices: NormalizedBoardDevice[]) => {
          const existingDevices = editingBoardId ? boardById.get(editingBoardId)?.devices || [] : []
          const existingById = new Map(existingDevices.map((device) => [device.id, device]))

          for (const device of normalizedDevices) {
               if (!device.id) {
                    await createBoardDevice.mutateAsync({
                         boardId,
                         payload: {
                              deviceId: device.deviceId,
                              deviceName: device.deviceName,
                              topic: device.topic,
                              state: device.state,
                         },
                    })
                    continue
               }

               const current = existingById.get(device.id)
               if (!current) {
                    continue
               }

               const hasChanged =
                    current.deviceId !== device.deviceId ||
                    (current.deviceName || "") !== device.deviceName ||
                    (current.topic || undefined) !== device.topic

               if (!hasChanged) {
                    continue
               }

               await updateBoardDevice.mutateAsync({
                    boardId,
                    deviceId: device.id,
                    payload: {
                         deviceId: device.deviceId,
                         deviceName: device.deviceName,
                         topic: device.topic,
                    },
               })
          }
     }, [boardById, createBoardDevice, editingBoardId, updateBoardDevice])

     const handleSaveBoard = useCallback(async () => {
          const boardId = boardForm.id.trim()
          if (!boardId) {
               message.error("Vui lòng nhập mã mạch.")
               return
          }

          const normalizedDevices = getValidNormalizedDevices(boardForm.devices)
          if (!normalizedDevices) {
               return
          }

          try {
               if (editingBoardId) {
                    const apartmentId = canSelectApartment
                         ? boardForm.apartmentId || undefined
                         : undefined

                    const updatedBoardResponse = await updateBoard.mutateAsync({
                         boardId: editingBoardId,
                         payload: {
                              id: boardId,
                              apartmentId,
                              status: boardForm.status,
                         },
                    })

                    const savedBoardId = updatedBoardResponse?.data?.id || boardId
                    await persistDevicesToBoard(savedBoardId, normalizedDevices)
               } else {
                    await createBoard.mutateAsync({
                         id: boardId,
                         apartmentId: boardForm.apartmentId || undefined,
                         devices: normalizedDevices.map((device) => ({
                              deviceId: device.deviceId,
                              deviceName: device.deviceName,
                              topic: device.topic,
                              state: device.state,
                         })),
                    })
               }

               resetBoardDialog()
          } catch {
               // Error toast handled in hooks.
          }
     }, [boardForm, createBoard, canSelectApartment, editingBoardId, getValidNormalizedDevices, persistDevicesToBoard, resetBoardDialog, updateBoard])

     const handleUnlinkCurrentApartmentBeforeRelink = useCallback(async () => {
          if (!editingBoardId || !initialEditApartmentId) {
               return
          }

          try {
               await unlinkBoardApartment.mutateAsync(editingBoardId)
               setInitialEditApartmentId(null)
               setCanSelectApartment(true)
               setBoardForm((prev) => ({
                    ...prev,
                    apartmentId: "",
               }))
               message.info("Đã hủy liên kết hiện tại. Bạn có thể chọn căn hộ mới.")
          } catch {
               // Error toast handled in hooks.
          }
     }, [unlinkBoardApartment, editingBoardId, initialEditApartmentId])

     const handleDeleteBoard = useCallback((boardId: string, boardName: string) => {
          setDeleteBoardTarget({ id: boardId, name: boardName })
     }, [])

     const closeDeleteBoardDialog = useCallback(() => {
          if (deleteBoard.isPending) return
          setDeleteBoardTarget(null)
     }, [deleteBoard.isPending])

     const onDeleteBoardDialogOpenChange = useCallback((open: boolean) => {
          if (!open) {
               closeDeleteBoardDialog()
               return
          }
     }, [closeDeleteBoardDialog])

     const confirmDeleteBoard = useCallback(async () => {
          if (!deleteBoardTarget) return

          try {
               await deleteBoard.mutateAsync(deleteBoardTarget.id)
               setDeleteBoardTarget(null)
          } catch {
               // Error toast handled in hooks.
          }
     }, [deleteBoardTarget, deleteBoard])

     const onStatusFilterChange = useCallback((value: string) => {
          setStatusFilter(value as StatusFilterValue)
     }, [])

     const onSearchTextChange = useCallback((value: string) => {
          setSearchText(value)
     }, [])

     const onRefresh = useCallback(() => {
          void refetchBoards()
     }, [refetchBoards])

     const header = useMemo(
          () => ({
               onCreateBoard: openCreateBoardDialog,
          }),
          [openCreateBoardDialog],
     )

     const filters = useMemo(
          () => ({
               statusFilter,
               onStatusFilterChange,
               searchText,
               onSearchTextChange,
               totalBoards: boards.length,
               filteredBoards: filteredBoards.length,
               isRefreshing: isBoardListFetching,
               onRefresh,
          }),
          [
               statusFilter,
               onStatusFilterChange,
               searchText,
               onSearchTextChange,
               boards.length,
               filteredBoards.length,
               isBoardListFetching,
               onRefresh,
          ],
     )

     const table = useMemo(
          () => ({
               boards: filteredBoards,
               isLoading: isBoardListLoading,
               isDeletingBoard: deleteBoard.isPending,
               onEditBoard: openEditBoardDialog,
               onViewBoardDetails: openBoardDetailDialog,
               onDeleteBoard: handleDeleteBoard,
          }),
          [
               filteredBoards,
               isBoardListLoading,
               deleteBoard.isPending,
               openEditBoardDialog,
               openBoardDetailDialog,
               handleDeleteBoard,
          ],
     )

     const detailModal = useMemo(
          () => ({
               open: isBoardDetailDialogOpen,
               board: detailBoard,
               onOpenChange: onBoardDetailDialogOpenChange,
               onEditBoard: openEditBoardDialog,
               onAddDevice: openEditBoardForAddDevice,
          }),
          [
               isBoardDetailDialogOpen,
               detailBoard,
               onBoardDetailDialogOpenChange,
               openEditBoardDialog,
               openEditBoardForAddDevice,
          ],
     )

     const boardModal = useMemo(
          () => ({
               open: isBoardDialogOpen,
               isEdit: !!editingBoardId,
               isSaving: isBoardSaving,
               form: boardForm,
               apartmentOptions,
               apartmentSelectDisabled: !!editingBoardId && !canSelectApartment,
               showUnlinkCurrentApartment: !!editingBoardId && !!initialEditApartmentId && !canSelectApartment,
               isUnlinkingCurrentApartment: unlinkBoardApartment.isPending,
               onOpenChange: onBoardDialogOpenChange,
               onCancel: resetBoardDialog,
               onSubmit: handleSaveBoard,
               onFieldChange: onBoardFieldChange,
               onUnlinkCurrentApartment: () => void handleUnlinkCurrentApartmentBeforeRelink(),
               onAddDevice: addCreateDeviceRow,
               onRemoveDevice: removeCreateDeviceRow,
               onDeviceChange: setCreateDeviceField,
          }),
          [
               isBoardDialogOpen,
               editingBoardId,
               isBoardSaving,
               boardForm,
               apartmentOptions,
               canSelectApartment,
               initialEditApartmentId,
               unlinkBoardApartment.isPending,
               onBoardDialogOpenChange,
               resetBoardDialog,
               handleSaveBoard,
               onBoardFieldChange,
               handleUnlinkCurrentApartmentBeforeRelink,
               addCreateDeviceRow,
               removeCreateDeviceRow,
               setCreateDeviceField,
          ],
     )

     const deleteDialog = useMemo(
          () => ({
               open: !!deleteBoardTarget,
               isSubmitting: deleteBoard.isPending,
               title: "Khóa mạch IoT",
               description: `Bạn có chắc chắn muốn khóa mạch ${deleteBoardTarget?.name || ""}? Mạch và thiết bị con sẽ bị vô hiệu hóa.`,
               confirmText: "Khóa mạch",
               submittingText: "Đang khóa...",
               confirmVariant: "destructive" as const,
               onOpenChange: onDeleteBoardDialogOpenChange,
               onCancel: closeDeleteBoardDialog,
               onConfirm: () => void confirmDeleteBoard(),
          }),
          [
               deleteBoardTarget,
               deleteBoard.isPending,
               onDeleteBoardDialogOpenChange,
               closeDeleteBoardDialog,
               confirmDeleteBoard,
          ],
     )

     return {
          header,
          filters,
          table,
          detailModal,
          boardModal,
          deleteDialog,
     }
}
