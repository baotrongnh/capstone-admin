"use client"

import { createDefaultBoardForm, EMPTY_DEVICE_ROW, normalizeTopic, type BoardFormState, type CreateDeviceRow } from "@/components/iot/iot-shared"
import { useApartments } from "@/hooks/query/useApartments"
import { useCheckIotBoardHealth, useCreateIotBoard, useCreateIotBoardDevice, useDeleteIotBoard, useDeleteIotBoardDevice, useIotBoards, useUnlinkBoardApartment, useUpdateIotBoard, useUpdateIotBoardDevice } from "@/hooks/query/useIotDevices"
import type { IotBoardDeviceCreateRequest, IotBoardDeviceUpdateRequest, IotBoardItem, IotBoardListQuery } from "@/types/iot"
import { message } from "antd"
import { useCallback, useMemo, useState } from "react"

type NormalizedBoardDevice = {
     id?: string
     deviceId: number
     deviceName: string
     topic: IotBoardDeviceCreateRequest["topic"]
     state: "OFF"
}

type DeviceSyncSummary = {
     created: number
     updated: number
     deleted: number
}

const normalizeBoardDevices = (rows: BoardFormState["devices"]) => {
     const normalized: NormalizedBoardDevice[] = []
     const markedDeletedDeviceIds: string[] = []
     let hasInvalidRow = false

     rows.forEach((item) => {
          if (item.id && item.isMarkedDeleted) {
               markedDeletedDeviceIds.push(item.id)
               return
          }

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
          markedDeletedDeviceIds,
          hasInvalidRow,
     }
}

const mapBoardDevicesToRows = (board: IotBoardItem): CreateDeviceRow[] => {
     return board.devices.map((device) => {
          const rawTopic = normalizeTopic(device.topic)
          return {
               id: device.id,
               deviceId: String(device.deviceId) || "",
               deviceName: device.deviceName || "",
               topic: rawTopic || "light",
               status: device.status,
          }
     })
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
     const [reactivatingDeviceKey, setReactivatingDeviceKey] = useState<string | null>(null)
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
     const createBoardDevice = useCreateIotBoardDevice(true)
     const updateBoardDevice = useUpdateIotBoardDevice(true)
     const deleteBoardDevice = useDeleteIotBoardDevice(true)
     const deleteBoard = useDeleteIotBoard()
     const unlinkBoardApartment = useUnlinkBoardApartment()
     const checkBoardHealth = useCheckIotBoardHealth()

     const boards = useMemo(() => boardsResponse?.data ?? [], [boardsResponse?.data])
     const apartmentOptions = useMemo(() => apartmentResponse?.data ?? [], [apartmentResponse?.data])

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
          || deleteBoardDevice.isPending
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
          }
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
          setBoardForm((prev) => ({
               ...prev,
               devices: [...prev.devices, { ...EMPTY_DEVICE_ROW }],
          }))
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
               devices: [...prev.devices, { ...EMPTY_DEVICE_ROW }],
          }))
     }, [])

     const removeCreateDeviceRow = useCallback((index: number) => {
          setBoardForm((prev) => {
               const target = prev.devices[index]
               if (!target) {
                    return prev
               }

               const next = target.id
                    ? prev.devices.map((item, i) =>
                         i === index
                              ? {
                                   ...item,
                                   isMarkedDeleted: !item.isMarkedDeleted,
                              }
                              : item,
                    )
                    : prev.devices.filter((_, i) => i !== index)

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

     const persistDevicesToBoard = useCallback(async (
          boardId: string,
          normalizedDevices: NormalizedBoardDevice[],
          markedDeletedDeviceIds: string[],
     ): Promise<DeviceSyncSummary> => {
          const existingDevices = editingBoardId ? boardById.get(editingBoardId)?.devices || [] : []
          const existingById = new Map(existingDevices.map((device) => [device.id, device]))
          const summary: DeviceSyncSummary = {
               created: 0,
               updated: 0,
               deleted: 0,
          }

          const createDevice = async (device: NormalizedBoardDevice) => {
               await createBoardDevice.mutateAsync({
                    boardId,
                    payload: {
                         deviceId: device.deviceId,
                         deviceName: device.deviceName,
                         topic: device.topic,
                         state: device.state,
                    },
               })
               summary.created += 1
          }

          const normalizedDeviceIds = new Set(
               normalizedDevices
                    .map((device) => device.id)
                    .filter((value): value is string => Boolean(value)),
          )

          const deletedDeviceIds = new Set(markedDeletedDeviceIds)

          existingDevices.forEach((device) => {
               if (!normalizedDeviceIds.has(device.id)) {
                    deletedDeviceIds.add(device.id)
               }
          })

          for (const deviceId of deletedDeviceIds) {
               await deleteBoardDevice.mutateAsync({
                    boardId,
                    deviceId,
               })
               summary.deleted += 1
          }

          for (const device of normalizedDevices) {
               if (!device.id) {
                    await createDevice(device)
                    continue
               }

               const current = existingById.get(device.id)
               if (!current) {
                    await createDevice(device)
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
               summary.updated += 1
          }

          return summary
     }, [boardById, createBoardDevice, deleteBoardDevice, editingBoardId, updateBoardDevice])

     const showDeviceSyncToast = useCallback((summary: DeviceSyncSummary) => {
          const total = summary.created + summary.updated + summary.deleted
          if (total === 0) {
               return
          }

          const parts: string[] = []
          if (summary.created > 0) {
               parts.push(`đã thêm ${summary.created}`)
          }
          if (summary.updated > 0) {
               parts.push(`đã cập nhật ${summary.updated}`)
          }
          if (summary.deleted > 0) {
               parts.push(`đã xóa ${summary.deleted}`)
          }

          message.success(`Cập nhật thiết bị thành công: ${parts.join(", ")}.`)
     }, [])

     const handleSaveBoard = useCallback(async () => {
          const boardId = boardForm.id.trim()
          if (!boardId) {
               message.error("Vui lòng nhập mã mạch.")
               return
          }

          const {
               normalized: normalizedDevices,
               markedDeletedDeviceIds,
               hasInvalidRow,
          } = normalizeBoardDevices(boardForm.devices)

          if (hasInvalidRow) {
               message.error("Vui lòng nhập đầy đủ Device ID và tên thiết bị cho các dòng đã thêm.")
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
                              status: boardForm.status === "active" || boardForm.status === "inactive"
                                   ? boardForm.status
                                   : undefined,
                         },
                    })

                    const savedBoardId = updatedBoardResponse?.data?.id || boardId
                    const summary = await persistDevicesToBoard(savedBoardId, normalizedDevices, markedDeletedDeviceIds)
                    showDeviceSyncToast(summary)
               } else {
                    const createdBoardResponse = await createBoard.mutateAsync({
                         id: boardId,
                         apartmentId: boardForm.apartmentId || undefined,
                         devices: [],
                    })

                    const savedBoardId = createdBoardResponse?.data?.id || boardId
                    const summary = await persistDevicesToBoard(savedBoardId, normalizedDevices, [])
                    showDeviceSyncToast(summary)
               }

               resetBoardDialog()
          } catch {
               // Error toast handled in hooks.
          }
     }, [boardForm, createBoard, canSelectApartment, editingBoardId, persistDevicesToBoard, resetBoardDialog, showDeviceSyncToast, updateBoard])

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

     const handleActivateBoard = useCallback(async (board: IotBoardItem) => {
          if (board.status === "active") {
               return
          }

          try {
               await updateBoard.mutateAsync({
                    boardId: board.id,
                    payload: {
                         id: board.id,
                         apartmentId: board.apartment?.id || undefined,
                         status: "active",
                    },
               })
          } catch {
               // Error toast handled in hooks.
          }
     }, [updateBoard])

     const handleCheckBoardHealth = useCallback(async (board: IotBoardItem) => {
          try {
               const response = await checkBoardHealth.mutateAsync(board.id)
               const health = response?.data
               if (!health) {
                    message.info("Không nhận được dữ liệu trạng thái từ mạch.")
                    return
               }

               message.info(
                    health.online
                         ? `Mạch ${health.espId} đang online${health.lastSeenAt ? `, cập nhật lần cuối ${new Date(health.lastSeenAt).toLocaleString("vi-VN")}` : ""}.`
                         : `Mạch ${health.espId} đang offline${health.lastSeenAt ? `, lần cuối ghi nhận ${new Date(health.lastSeenAt).toLocaleString("vi-VN")}` : ""}.`,
               )
          } catch {
               // handled in mutation
          }
     }, [checkBoardHealth])

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

     const reactivateBoardDevice = useCallback(async (boardId: string, device: IotBoardItem["devices"][number]) => {
          if (device.status !== "inactive") {
               return
          }

          const normalizedTopic = normalizeTopic(device.topic)
          if (!normalizedTopic) {
               message.error("Không thể kích hoạt lại thiết bị do topic không hợp lệ.")
               return
          }

          const deviceKey = `${boardId}:${device.id}`
          setReactivatingDeviceKey(deviceKey)

          try {
               const payload: IotBoardDeviceUpdateRequest = {
                    status: "active",
                    deviceId: device.deviceId,
                    deviceName: device.deviceName || undefined,
                    topic: normalizedTopic,
                    state: device.state === "ON" ? "ON" : "OFF",
               }

               await updateBoardDevice.mutateAsync({
                    boardId,
                    deviceId: device.id,
                    payload,
               })

               message.success("Đã kích hoạt lại thiết bị.")
          } catch {
               // Error toast handled in mutation hook.
          } finally {
               setReactivatingDeviceKey(null)
          }
     }, [updateBoardDevice])

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
               isUpdatingBoard: updateBoard.isPending,
               onEditBoard: openEditBoardDialog,
               onViewBoardDetails: openBoardDetailDialog,
               onActivateBoard: handleActivateBoard,
               onCheckBoardHealth: handleCheckBoardHealth,
               onDeleteBoard: handleDeleteBoard,
          }),
          [
               filteredBoards,
               isBoardListLoading,
               deleteBoard.isPending,
               updateBoard.isPending,
               openEditBoardDialog,
               openBoardDetailDialog,
               handleActivateBoard,
               handleCheckBoardHealth,
               handleDeleteBoard,
          ],
     )

     const detailModal = useMemo(
          () => ({
               open: isBoardDetailDialogOpen,
               board: detailBoard,
               reactivatingDeviceKey,
               onOpenChange: onBoardDetailDialogOpenChange,
               onEditBoard: openEditBoardDialog,
               onAddDevice: openEditBoardForAddDevice,
               onReactivateDevice: reactivateBoardDevice,
          }),
          [
               isBoardDetailDialogOpen,
               detailBoard,
               reactivatingDeviceKey,
               onBoardDetailDialogOpenChange,
               openEditBoardDialog,
               openEditBoardForAddDevice,
               reactivateBoardDevice,
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
