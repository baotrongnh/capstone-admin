"use client"

import type { IotConnectedDevice } from "@/components/apartment/sections/apartment-iot-section"
import {
     useIotBoards,
     useUnlinkBoardApartment,
     useUnlinkBoardsByApartment,
     useUpdateIotBoard,
} from "@/hooks/query/useIotDevices"
import type { IotBoardItem } from "@/types/iot"
import { useCallback, useEffect, useMemo, useState } from "react"

type UseApartmentIotAssignmentParams = {
     apartmentId?: string | null
     isCreateMode: boolean
     editMode: boolean
}

type SyncIotBoardAssignmentParams = {
     apartmentTargetId: string
     previousBoardIds: string[]
     nextBoardIds: string[]
}

const getBoardApartmentId = (board: IotBoardItem) => board.apartment?.id

const isBoardLinkedToApartment = (board: IotBoardItem, apartmentId?: string | null) => {
     if (!apartmentId) {
          return false
     }

     return getBoardApartmentId(board) === apartmentId
}

const isBoardAvailableForApartmentSelection = (board: IotBoardItem, apartmentId?: string | null) => {
     const boardApartmentId = getBoardApartmentId(board)
     return !boardApartmentId || boardApartmentId === apartmentId
}

const findInitialIotBoardIds = (boards: IotBoardItem[], apartmentId?: string | null) => {
     if (!apartmentId) {
          return []
     }

     return boards.filter((board) => isBoardLinkedToApartment(board, apartmentId)).map((board) => board.id)
}

export function useApartmentIotAssignment(params: UseApartmentIotAssignmentParams) {
     const {
          apartmentId,
          isCreateMode,
          editMode,
     } = params

     const updateIotBoard = useUpdateIotBoard()
     const unlinkBoardApartment = useUnlinkBoardApartment()
     const unlinkBoardsByApartment = useUnlinkBoardsByApartment()

     const {
          data: iotBoardsResponse,
          isLoading: isIotBoardsLoading,
          isFetching: isIotBoardsFetching,
     } = useIotBoards()

     const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([])
     const [isSelectionTouched, setIsSelectionTouched] = useState(false)
     const [unlinkingBoardId, setUnlinkingBoardId] = useState<string | null>(null)

     const iotBoards = useMemo(() => iotBoardsResponse?.data ?? [], [iotBoardsResponse?.data])

     const initialBoardIds = useMemo(
          () => findInitialIotBoardIds(iotBoards, apartmentId),
          [apartmentId, iotBoards],
     )

     useEffect(() => {
          if (!editMode || isCreateMode || isSelectionTouched) return

          if (selectedBoardIds.length === 0 && initialBoardIds.length > 0) {
               setSelectedBoardIds(initialBoardIds)
          }
     }, [editMode, initialBoardIds, isCreateMode, isSelectionTouched, selectedBoardIds])

     const boardOptions = useMemo(
          () =>
               iotBoards
                    .filter((board) => isBoardAvailableForApartmentSelection(board, apartmentId))
                    .map((board) => ({
                         id: board.id,
                         label: `${board.id}`,
                         deviceCount: board.deviceCount,
                    })),
          [apartmentId, iotBoards],
     )

     const linkedBoards = useMemo(
          () => iotBoards.filter((board) => isBoardLinkedToApartment(board, apartmentId)),
          [apartmentId, iotBoards],
     )

     const boardDevices = useMemo<IotConnectedDevice[]>(() => {
          return linkedBoards.flatMap((board) =>
               board.devices.map((device) => ({
                    id: `${board.id}-${device.id}`,
                    deviceName: device.deviceName || `Thiết bị ${device.deviceId || "-"}`,
                    deviceType: device.topic || "unknown",
                    boardId: board.id,
                    boardName: board.name || board.id,
               })),
          )
     }, [linkedBoards])

     const totalLinkedDeviceCount = useMemo(
          () => linkedBoards.reduce((sum, board) => sum + (board.deviceCount || board.devices.length), 0),
          [linkedBoards],
     )

     const normalizedInitialBoardIds = useMemo(
          () => [...new Set(initialBoardIds)].sort(),
          [initialBoardIds],
     )

     const normalizedSelectedBoardIds = useMemo(
          () => [...new Set(selectedBoardIds)].sort(),
          [selectedBoardIds],
     )

     const hasSelectionChanges =
          JSON.stringify(normalizedInitialBoardIds) !== JSON.stringify(normalizedSelectedBoardIds)

     const syncIotBoardAssignment = useCallback(
          async ({ apartmentTargetId, previousBoardIds, nextBoardIds }: SyncIotBoardAssignmentParams) => {
               const previousSet = new Set(previousBoardIds)
               const nextSet = new Set(nextBoardIds)

               const boardsToUnlink = previousBoardIds.filter((boardId) => !nextSet.has(boardId))
               const boardsToLink = nextBoardIds.filter((boardId) => !previousSet.has(boardId))

               for (const boardId of boardsToUnlink) {
                    await unlinkBoardApartment.mutateAsync(boardId)
               }

               for (const boardId of boardsToLink) {
                    await updateIotBoard.mutateAsync({
                         boardId,
                         payload: {
                              apartmentId: apartmentTargetId,
                         },
                    })
               }
          },
          [unlinkBoardApartment, updateIotBoard],
     )

     const handleSelectedBoardsChange = useCallback((boardIds: string[]) => {
          setIsSelectionTouched(true)
          setSelectedBoardIds(boardIds)
     }, [])

     const resetSelectionToInitial = useCallback(() => {
          setSelectedBoardIds(initialBoardIds)
          setIsSelectionTouched(false)
     }, [initialBoardIds])

     const unlinkLinkedBoard = useCallback(
          async (boardId: string) => {
               if (!apartmentId || unlinkBoardApartment.isPending) {
                    return false
               }

               try {
                    setUnlinkingBoardId(boardId)
                    await unlinkBoardApartment.mutateAsync(boardId)
                    setIsSelectionTouched(true)
                    setSelectedBoardIds((prev) => prev.filter((id) => id !== boardId))
                    return true
               } finally {
                    setUnlinkingBoardId(null)
               }
          },
          [apartmentId, unlinkBoardApartment],
     )

     const unlinkAllLinkedBoards = useCallback(async () => {
          if (!apartmentId || unlinkBoardsByApartment.isPending) {
               return false
          }

          await unlinkBoardsByApartment.mutateAsync(apartmentId)
          setIsSelectionTouched(true)
          setSelectedBoardIds([])
          return true
     }, [apartmentId, unlinkBoardsByApartment])

     return {
          iotBoards,
          iotBoardsLoading: isIotBoardsLoading || isIotBoardsFetching,
          selectedBoardIds,
          linkedBoards,
          boardOptions,
          boardDevices,
          totalLinkedDeviceCount,
          hasLinkedBoardsForApartment: linkedBoards.length > 0,
          unlinkingBoardId,
          normalizedInitialBoardIds,
          normalizedSelectedBoardIds,
          hasSelectionChanges,
          isMutating:
               updateIotBoard.isPending ||
               unlinkBoardApartment.isPending ||
               unlinkBoardsByApartment.isPending,
          isBulkUnlinkingBoards: unlinkBoardsByApartment.isPending,
          syncIotBoardAssignment,
          handleSelectedBoardsChange,
          resetSelectionToInitial,
          unlinkLinkedBoard,
          unlinkAllLinkedBoards,
     }
}
