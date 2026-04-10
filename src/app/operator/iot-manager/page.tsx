"use client"

import { IotActionConfirmDialog } from "@/components/iot/iot-action-confirm-dialog"
import { IotBoardDetailModal } from "@/components/iot/iot-board-detail-modal"
import { IotBoardModal } from "@/components/iot/iot-board-modal"
import { IotBoardTable } from "@/components/iot/iot-board-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { useIotManagerPage } from "@/hooks/iot/use-iot-manager-page"
import type { IotBoardListQuery } from "@/types/iot"
import { RefreshCcwIcon, SearchIcon } from "lucide-react"

export default function IotManagerPage() {
     const {
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
          isDeletingBoard,
          isDeleteBoardDialogOpen,
          deleteBoardTargetName,
          isBoardDialogOpen,
          editingBoardId,
          apartmentSelectDisabled,
          showUnlinkCurrentApartment,
          isUnlinkingCurrentApartment,
          boardForm,
          isBoardSaving,
          isBoardDetailDialogOpen,
          detailBoard,
          openCreateBoardDialog,
          openBoardDetailDialog,
          onBoardDetailDialogOpenChange,
          openEditBoardDialog,
          onBoardDialogOpenChange,
          resetBoardDialog,
          handleSaveBoard,
          onBoardFieldChange,
          handleUnlinkCurrentApartmentBeforeRelink,
          addCreateDeviceRow,
          removeCreateDeviceRow,
          setCreateDeviceField,
          handleDeleteBoard,
          closeDeleteBoardDialog,
          onDeleteBoardDialogOpenChange,
          confirmDeleteBoard,
          openEditBoardForAddDevice,
     } = useIotManagerPage()

     return (
          <div className="space-y-4">
               <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold text-foreground">Quản lý mạch và thiết bị IoT</h1>
                         <p className="text-sm text-muted-foreground">
                              Giao diện tối ưu cho thao tác nhanh: lọc, tìm kiếm, sửa mạch và quản lý thiết bị tại một nơi.
                         </p>
                    </div>

                    <Button onClick={openCreateBoardDialog}>+ Tạo mạch mới</Button>
               </div>

               <div className="rounded-xl border bg-card p-3 shadow-sm">
                    <div className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
                         <div className="relative">
                              <SearchIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                              <Input
                                   value={searchText}
                                   placeholder="Tìm theo mã mạch, tên mạch, căn hộ..."
                                   onChange={(event) => setSearchText(event.target.value)}
                                   className="pl-9"
                              />
                         </div>

                         <Select
                              value={statusFilter}
                              onValueChange={(value) =>
                                   setStatusFilter(value as "__all__" | NonNullable<IotBoardListQuery["status"]>)
                              }
                         >
                              <SelectTrigger className="w-full">
                                   <SelectValue placeholder="Lọc theo trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                   <SelectItem value="__all__">Tất cả trạng thái</SelectItem>
                                   <SelectItem value="active">Hoạt động</SelectItem>
                                   <SelectItem value="inactive">Không hoạt động</SelectItem>
                                   <SelectItem value="maintenance">Bảo trì</SelectItem>
                                   <SelectItem value="error">Lỗi</SelectItem>
                              </SelectContent>
                         </Select>

                         <Button variant="outline" onClick={() => refetchBoards()} disabled={isBoardListFetching}>
                              <RefreshCcwIcon className="mr-1 size-4" />
                              Làm mới
                         </Button>
                    </div>

                    <p className="mt-2 text-xs text-muted-foreground">
                         Hiển thị {filteredBoards.length}/{boards.length} mạch
                    </p>
               </div>

               <IotBoardTable
                    boards={filteredBoards}
                    isLoading={isBoardListLoading}
                    isDeletingBoard={isDeletingBoard}
                    onEditBoard={openEditBoardDialog}
                    onViewBoardDetails={openBoardDetailDialog}
                    onDeleteBoard={handleDeleteBoard}
               />

               <IotBoardDetailModal
                    open={isBoardDetailDialogOpen}
                    board={detailBoard}
                    onOpenChange={onBoardDetailDialogOpenChange}
                    onEditBoard={openEditBoardDialog}
                    onAddDevice={openEditBoardForAddDevice}
               />

               <IotBoardModal
                    open={isBoardDialogOpen}
                    isEdit={!!editingBoardId}
                    isSaving={isBoardSaving}
                    form={boardForm}
                    apartmentOptions={apartmentOptions}
                    apartmentSelectDisabled={apartmentSelectDisabled}
                    showUnlinkCurrentApartment={showUnlinkCurrentApartment}
                    isUnlinkingCurrentApartment={isUnlinkingCurrentApartment}
                    onOpenChange={onBoardDialogOpenChange}
                    onCancel={resetBoardDialog}
                    onSubmit={handleSaveBoard}
                    onFieldChange={onBoardFieldChange}
                    onUnlinkCurrentApartment={() => void handleUnlinkCurrentApartmentBeforeRelink()}
                    onAddDevice={addCreateDeviceRow}
                    onRemoveDevice={removeCreateDeviceRow}
                    onDeviceChange={setCreateDeviceField}
               />

               <IotActionConfirmDialog
                    open={isDeleteBoardDialogOpen}
                    isSubmitting={isDeletingBoard}
                    title="Khóa mạch IoT"
                    description={`Bạn có chắc chắn muốn khóa mạch ${deleteBoardTargetName}? Mạch và thiết bị con sẽ bị vô hiệu hóa.`}
                    confirmText="Khóa mạch"
                    submittingText="Đang khóa..."
                    confirmVariant="destructive"
                    onOpenChange={onDeleteBoardDialogOpenChange}
                    onCancel={closeDeleteBoardDialog}
                    onConfirm={() => void confirmDeleteBoard()}
               />
          </div>
     )
}
