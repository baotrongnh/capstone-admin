"use client"

import { ApartmentDetailsSection, type ApartmentDetailsSectionActions, type ApartmentDetailsSectionModel } from "@/components/apartment/sections/apartment-details-section"
import { ApartmentIotSection } from "@/components/apartment/sections/apartment-iot-section"
import {
     ApartmentMediaSection,
     type ApartmentMediaSectionActions,
     type ApartmentMediaSectionModel,
} from "@/components/apartment/sections/apartment-media-section"
import {
     ApartmentRentalSummarySection,
     ApartmentRoomsSection,
     ApartmentTenantSection,
     type ApartmentRentalSummarySectionActions,
     type ApartmentRentalSummarySectionModel,
     type ApartmentRoomsSectionActions,
     type ApartmentRoomsSectionModel,
     type ApartmentTenantSectionModel,
} from "@/components/apartment/sections/apartment-occupancy-sections"
import {
     ApartmentAmenitySection,
     ApartmentOwnerSection,
     type ApartmentAmenitySectionActions,
     type ApartmentAmenitySectionModel,
     type ApartmentOwnerSectionActions,
     type ApartmentOwnerSectionModel,
} from "@/components/apartment/sections/apartment-profile-sections"
import {
     AVAILABLE_YEARS,
     buildApartmentDetailItems,
     DEFAULT_CREATE_FORM,
     DEFAULT_SECTION_VISIBILITY,
     hasApartmentFormChanged,
} from "@/components/apartment/apartment-detail-editor.helpers"
import { Button } from "@/components/ui/button"
import { useApartmentDetailEditorController } from "@/hooks/apartment/use-apartment-detail-editor-controller"
import { useApartmentEditorState } from "@/hooks/apartment/use-apartment-editor-state"
import { useApartmentFormValidation } from "@/hooks/apartment/use-apartment-form-validation"
import { useApartmentGeocoding } from "@/hooks/apartment/use-apartment-geocoding"
import { useApartmentIotAssignment } from "@/hooks/apartment/use-apartment-iot-assignment"
import { useApartmentMediaState } from "@/hooks/apartment/use-apartment-media-state"
import { useFullAddress } from "@/hooks/query/useAddress"
import { useAmenities } from "@/hooks/query/useAmenities"
import { useApartment, useCreateApartment, useUpdateApartment } from "@/hooks/query/useApartments"
import { useUser, useUsers } from "@/hooks/query/useUsers"
import { mapAmenitiesToOptions, mergeAmenityOptions, withFallbackAmenityOptions } from "@/lib/apartment/amenity-mapping"
import { buildApartmentForm } from "@/types/apartment-form"
import { Modal } from "antd"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

type ApartmentDetailEditorProps = {
     apartmentId: string | null
     mode: "create" | "view" | "edit"
     allowEdit?: boolean
     inDialog?: boolean
     onCreateSuccess?: () => void
     onCreateCancel?: () => void
     actionLabels?: ApartmentEditorActionLabels
     sectionVisibility?: {
          showDetailsSection?: boolean
          showOwnerSection?: boolean
          showAmenitySection?: boolean
          showMediaSection?: boolean
          showRentalSummarySection?: boolean
          showIotSection?: boolean
          showRoomsSection?: boolean
          showTenantSection?: boolean
     }
}

export type ApartmentEditorActionLabels = {
     createButton?: string
     createLoadingButton?: string
     updateButton?: string
     updateLoadingButton?: string
     editButton?: string
     cancelButton?: string
}

export function ApartmentDetailEditor({
     apartmentId,
     mode,
     allowEdit = true,
     inDialog = false,
     onCreateSuccess,
     onCreateCancel,
     actionLabels,
     sectionVisibility,
}: ApartmentDetailEditorProps) {
     const router = useRouter()
     const {
          data: apartmentDetailResponse,
          isLoading,
          isFetching,
          isError,
          refetch: refetchApartmentDetail,
     } = useApartment(apartmentId || "")

     const updateApartment = useUpdateApartment()
     const createApartment = useCreateApartment()

     const detailApartment = apartmentDetailResponse?.data
     const detailLoading = isLoading || isFetching

     const isCreateMode = mode === "create"
     const isRouteEditMode = mode === "edit"

     const resolvedSectionVisibility = {
          ...DEFAULT_SECTION_VISIBILITY,
          ...sectionVisibility,
     }

     const createButtonLabel = actionLabels?.createButton || "Tạo căn hộ"
     const createLoadingButtonLabel = actionLabels?.createLoadingButton || "Đang tạo..."
     const updateButtonLabel = actionLabels?.updateButton || "Lưu thay đổi"
     const updateLoadingButtonLabel = actionLabels?.updateLoadingButton || "Đang lưu..."
     const editButtonLabel = actionLabels?.editButton || "Chỉnh sửa"
     const cancelButtonLabel = actionLabels?.cancelButton || "Hủy"

     const initialForm = useMemo(() => {
          if (isCreateMode) return DEFAULT_CREATE_FORM
          if (!detailApartment) return null
          return buildApartmentForm(detailApartment)
     }, [detailApartment, isCreateMode])

     const initialRoomTags = useMemo(
          () => detailApartment?.rooms.map((room) => room.roomNumber).filter(Boolean) || [],
          [detailApartment?.rooms],
     )

     const {
          manualEditMode,
          setManualEditMode,
          form,
          selectedDepositPreset,
          tenantCount,
          setTenantCount,
          roomTags,
          setRoomTags,
          updateField,
          applyDepositPreset,
          resetTransientState,
          startEditDraft,
          resetCreateDraft,
          setDraftForm,
     } = useApartmentEditorState({
          isCreateMode,
          initialForm,
          defaultCreateForm: DEFAULT_CREATE_FORM,
          initialRoomTags,
     })

     const editMode = isCreateMode || isRouteEditMode || manualEditMode

     const iotAssignment = useApartmentIotAssignment({
          apartmentId: detailApartment?.id,
          isCreateMode,
          editMode,
     })

     const {
          selectedImageFiles,
          selectedVideoFile,
          imagePreviews,
          selectedVideoPreviewUrl,
          handleSelectImages,
          handleSelectVideo,
          handleRemoveSelectedImage,
          handleRemoveSelectedVideo,
          resetMediaState,
     } = useApartmentMediaState()

     const formValidation = useApartmentFormValidation({ form })

     const {
          data: amenitiesResponse,
          isLoading: isAmenitiesLoading,
          isFetching: isAmenitiesFetching,
     } = useAmenities()

     const { data: usersResponse, isLoading: usersLoading } = useUsers({ page: 1, limit: 100 })

     const ownerOptions = usersResponse?.data || []
     const selectedOwnerId = form?.ownerId || detailApartment?.ownerId || undefined
     const { data: selectedOwnerResponse } = useUser(selectedOwnerId || undefined)

     const selectedOwnerFromList = ownerOptions.find((item) => item.id === selectedOwnerId)
     const selectedOwner = selectedOwnerResponse?.data

     const ownerSummary = {
          id: detailApartment?.ownerId || form?.ownerId || null,
          fullName:
               selectedOwner?.fullName ||
               selectedOwnerFromList?.fullName ||
               detailApartment?.owner?.fullName ||
               "-",
          companyName:
               selectedOwner?.companyName || detailApartment?.owner?.companyName || "-",
     }

     const fullAddress = useFullAddress(
          form?.streetAddress || detailApartment?.streetAddress || undefined,
          detailApartment?.provinceCode || undefined,
          form?.wardCode || detailApartment?.wardCode || undefined,
     )

     const {
          geocodeStatus,
          geocodeErrorMessage,
          markManualCoordinatePick,
          resetGeocodeTracking,
     } = useApartmentGeocoding({
          editMode,
          form,
          fullAddress,
          onAutoCoordinate: ({ latitude, longitude }) => {
               const latitudePatch = updateField("latitude", latitude)
               const longitudePatch = updateField("longitude", longitude)
               formValidation.syncValues({ ...latitudePatch, ...longitudePatch })
          },
     })

     const usableAreaInvalid =
          form?.usableArea !== undefined &&
          form?.totalArea !== undefined &&
          form.usableArea > form.totalArea

     const amenitiesLoading = isAmenitiesLoading || isAmenitiesFetching

     const roomOptions = detailApartment?.rooms.map((room) => room.roomNumber).filter(Boolean) || []
     const amenityPresetOptions = withFallbackAmenityOptions(
          form?.amenityIds,
          mergeAmenityOptions(
               mapAmenitiesToOptions(amenitiesResponse?.data),
               mapAmenitiesToOptions(detailApartment?.amenities),
          ),
     )
     const detailItems = detailApartment ? buildApartmentDetailItems(detailApartment, fullAddress) : []
     const availableYears = AVAILABLE_YEARS

     const isSaving =
          updateApartment.isPending ||
          createApartment.isPending ||
          iotAssignment.isMutating
     const uploadPercent = updateApartment.isPending
          ? updateApartment.uploadPercent
          : createApartment.isPending
               ? createApartment.uploadPercent
               : 0
     const displayUploadPercent = Math.min(100, Math.max(0, Math.round(uploadPercent)))

     const hasMediaChanges = selectedImageFiles.length > 0 || !!selectedVideoFile

     const hasFormChanges = hasApartmentFormChanged(initialForm, form)

     const hasClientChanges =
          !isCreateMode &&
          (JSON.stringify(roomTags) !== JSON.stringify(initialRoomTags) ||
               (resolvedSectionVisibility.showIotSection && iotAssignment.hasSelectionChanges))

     const canSaveChanges =
          !!form &&
          !usableAreaInvalid &&
          (isCreateMode || hasFormChanges || hasMediaChanges || hasClientChanges)

     const controller = useApartmentDetailEditorController({
          context: {
               isCreateMode,
               isRouteEditMode,
               allowEdit,
               apartmentId,
               detailApartment,
               roomTags,
               initialRoomTags,
               canSaveChanges,
               usableAreaInvalid,
               showIotSection: resolvedSectionVisibility.showIotSection,
          },
          editorState: {
               form,
               updateField,
               setTenantCount,
               setRoomTags,
               resetTransientState,
               startEditDraft,
               resetCreateDraft,
               setDraftForm,
               setManualEditMode,
               applyDepositPreset,
          },
          mediaState: {
               selectedImageFiles,
               selectedVideoFile,
               resetMediaState,
          },
          iotAssignment,
          formValidation,
          geocoding: {
               resetGeocodeTracking,
               markManualCoordinatePick,
          },
          actions: {
               onCreateSuccess,
               onCreateCancel,
               refetchApartmentDetail,
               createApartmentMutate: createApartment.mutateAsync,
               updateApartmentMutate: updateApartment.mutateAsync,
          },
          router,
     })

     const handleConfirmUnlinkLinkedBoard = (boardId: string) => {
          const board = iotAssignment.linkedBoards.find((item) => item.id === boardId)
          const boardLabel = board?.name || boardId

          Modal.confirm({
               title: "Hủy liên kết mạch",
               content: `Bạn có chắc chắn muốn hủy liên kết mạch ${boardLabel} khỏi căn hộ này không?`,
               okText: "Xác nhận",
               okType: "danger",
               cancelText: "Hủy",
               async onOk() {
                    const success = await iotAssignment.unlinkLinkedBoard(boardId)
                    if (success) {
                         await refetchApartmentDetail()
                    }
               },
          })
     }

     const handleConfirmUnlinkAllLinkedBoards = () => {
          Modal.confirm({
               title: "Hủy liên kết toàn bộ mạch",
               content: "Bạn có chắc chắn muốn gỡ liên kết apartment khỏi tất cả mạch đang gắn không?",
               okText: "Xác nhận",
               okType: "danger",
               cancelText: "Hủy",
               async onOk() {
                    const success = await iotAssignment.unlinkAllLinkedBoards()
                    if (success) {
                         await refetchApartmentDetail()
                    }
               },
          })
     }

     const detailsSectionModel: ApartmentDetailsSectionModel = {
          editMode,
          form: form || DEFAULT_CREATE_FORM,
          fieldErrors: formValidation.fieldErrors,
          detailItems,
          fullAddress,
          availableYears,
          usableAreaInvalid,
          initialProvinceCode: detailApartment?.provinceCode || undefined,
          selectedDepositPreset,
          geocodeStatus,
          geocodeErrorMessage,
     }

     const detailsSectionActions: ApartmentDetailsSectionActions = {
          setField: controller.handleFieldChange,
          setNumberField: controller.handleNumberFieldChange,
          setCurrencyField: controller.handleCurrencyFieldChange,
          onSelectDepositPreset: controller.handleSelectDepositPreset,
          onPickCoordinate: controller.handlePickCoordinate,
     }

     const ownerSectionModel: ApartmentOwnerSectionModel = {
          editMode,
          ownerSummary,
          ownerId: form?.ownerId || undefined,
          ownerOptions,
          usersLoading,
     }

     const ownerSectionActions: ApartmentOwnerSectionActions = {
          onOwnerChange: (value) => controller.handleFieldChange("ownerId", value),
     }

     const amenitySectionModel: ApartmentAmenitySectionModel = {
          editMode,
          description: form?.description,
          amenityIds: form?.amenityIds || [],
          options: amenityPresetOptions,
          amenitiesLoading,
     }

     const amenitySectionActions: ApartmentAmenitySectionActions = {
          onDescriptionChange: (value) => controller.handleFieldChange("description", value),
          onAmenitiesChange: (value) => controller.handleFieldChange("amenityIds", value),
     }

     const mediaSectionModel: ApartmentMediaSectionModel = {
          editMode,
          existingImages: form?.images || [],
          selectedImagePreviews: imagePreviews,
          selectedVideoFile,
          selectedVideoPreviewUrl,
          videoTourUrl: form?.videoTourUrl,
     }

     const mediaSectionActions: ApartmentMediaSectionActions = {
          onSelectImages: handleSelectImages,
          onSelectVideo: handleSelectVideo,
          onRemoveExistingImage: controller.handleRemoveExistingImage,
          onRemoveSelectedImage: handleRemoveSelectedImage,
          onRemoveSelectedVideo: handleRemoveSelectedVideo,
     }

     const rentalSummarySectionModel: ApartmentRentalSummarySectionModel = {
          editMode,
          tenantCount,
          utilityMeterCount: detailApartment?.utilityMeters.length ?? 0,
     }

     const rentalSummarySectionActions: ApartmentRentalSummarySectionActions = {
          onTenantCountChange: setTenantCount,
     }

     const roomsSectionModel: ApartmentRoomsSectionModel = {
          editMode,
          roomTags,
          roomOptions,
          rooms: detailApartment?.rooms || [],
     }

     const roomsSectionActions: ApartmentRoomsSectionActions = {
          onRoomTagsChange: setRoomTags,
     }

     const tenantSectionModel: ApartmentTenantSectionModel = {
          tenants: detailApartment?.userApartments || [],
     }

     const canRenderForm = isCreateMode ? !!form : !!detailApartment && !!form

     return (
          <div className="overflow-hidden rounded-xl border bg-background">
               <div className="border-b px-5 py-4 md:px-6">
                    <h2 className="text-lg font-semibold leading-none tracking-tight">
                         {isCreateMode ? "Tạo căn hộ" : editMode ? "Chỉnh sửa căn hộ" : "Chi tiết căn hộ"}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                         {isCreateMode
                              ? "Tạo mới theo đúng cấu trúc đầy đủ của màn hình chi tiết/chỉnh sửa để dễ kiểm soát dữ liệu."
                              : editMode
                                   ? "Cập nhật thông tin căn hộ theo từng nhóm trường để thao tác nhanh và chính xác."
                                   : "Thông tin chi tiết căn hộ được hiển thị theo cấu trúc rõ ràng và dễ tra cứu."}
                    </p>
               </div>

               <div className={inDialog ? "max-h-[82vh] overflow-y-auto px-4 py-4 md:px-6 md:py-5" : "px-4 py-4 md:px-6 md:py-5"}>
                    {!isCreateMode && !apartmentId && (
                         <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                              Vui lòng chọn căn hộ để xem chi tiết.
                         </p>
                    )}

                    {!isCreateMode && apartmentId && detailLoading && (
                         <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                              Đang tải chi tiết căn hộ...
                         </p>
                    )}

                    {!isCreateMode && apartmentId && isError && (
                         <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                              Không thể tải chi tiết căn hộ. Vui lòng thử lại.
                         </p>
                    )}

                    {canRenderForm && form && (
                         <div className="space-y-5">
                              {resolvedSectionVisibility.showDetailsSection ? (
                                   <ApartmentDetailsSection
                                        model={detailsSectionModel}
                                        actions={detailsSectionActions}
                                   />
                              ) : null}

                              {resolvedSectionVisibility.showOwnerSection ? (
                                   <ApartmentOwnerSection
                                        model={ownerSectionModel}
                                        actions={ownerSectionActions}
                                   />
                              ) : null}

                              {resolvedSectionVisibility.showAmenitySection ? (
                                   <ApartmentAmenitySection
                                        model={amenitySectionModel}
                                        actions={amenitySectionActions}
                                   />
                              ) : null}

                              {resolvedSectionVisibility.showMediaSection ? (
                                   <ApartmentMediaSection
                                        model={mediaSectionModel}
                                        actions={mediaSectionActions}
                                   />
                              ) : null}

                              {resolvedSectionVisibility.showRentalSummarySection ? (
                                   <ApartmentRentalSummarySection
                                        model={rentalSummarySectionModel}
                                        actions={rentalSummarySectionActions}
                                   />
                              ) : null}

                              {resolvedSectionVisibility.showIotSection ? (
                                   <ApartmentIotSection
                                        model={{
                                             editMode,
                                             selectedBoardIds: iotAssignment.selectedBoardIds,
                                             boardOptions: iotAssignment.boardOptions,
                                             linkedBoards: iotAssignment.linkedBoards.map((board) => ({
                                                  id: board.id,
                                                  label: `${board.id}`,
                                                  deviceCount: board.deviceCount,
                                             })),
                                             boardsLoading: iotAssignment.iotBoardsLoading,
                                             boardDevices: iotAssignment.boardDevices,
                                             totalDeviceCount: iotAssignment.totalLinkedDeviceCount,
                                             canBulkUnlinkBoards: iotAssignment.hasLinkedBoardsForApartment,
                                             isBulkUnlinkingBoards: iotAssignment.isBulkUnlinkingBoards,
                                             unlinkingBoardId: iotAssignment.unlinkingBoardId,
                                        }}
                                        actions={{
                                             onSelectedBoardsChange: iotAssignment.handleSelectedBoardsChange,
                                             onUnlinkLinkedBoard: handleConfirmUnlinkLinkedBoard,
                                             onBulkUnlinkBoards: handleConfirmUnlinkAllLinkedBoards,
                                        }}
                                   />
                              ) : null}

                              {resolvedSectionVisibility.showRoomsSection ? (
                                   <ApartmentRoomsSection
                                        model={roomsSectionModel}
                                        actions={roomsSectionActions}
                                   />
                              ) : null}

                              {resolvedSectionVisibility.showTenantSection ? (
                                   <ApartmentTenantSection model={tenantSectionModel} />
                              ) : null}

                              <div className="sticky bottom-0 space-y-2 rounded-xl border bg-background/95 p-3 backdrop-blur">
                                   {isSaving ? (
                                        <div className="space-y-1 rounded-md border bg-muted/20 p-2">
                                             <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                  <span>Đang tải media lên</span>
                                                  <span>{displayUploadPercent}%</span>
                                             </div>
                                             <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                  <div
                                                       className="h-full bg-primary transition-all"
                                                       style={{ width: `${displayUploadPercent}%` }}
                                                  />
                                             </div>
                                        </div>
                                   ) : null}

                                   <div className="flex justify-end gap-2">
                                        {editMode ? (
                                             <>
                                                  <Button variant="outline" onClick={controller.handleCancelEdit}>
                                                       {cancelButtonLabel}
                                                  </Button>
                                                  <Button onClick={controller.handleSave} disabled={isSaving || (!isCreateMode && !canSaveChanges)}>
                                                       {isCreateMode
                                                            ? isSaving
                                                                 ? createLoadingButtonLabel
                                                                 : createButtonLabel
                                                            : isSaving
                                                                 ? updateLoadingButtonLabel
                                                                 : updateButtonLabel}
                                                  </Button>
                                             </>
                                        ) : allowEdit && !isCreateMode ? (
                                             <Button onClick={controller.handleStartEdit}>{editButtonLabel}</Button>
                                        ) : null}
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     )
}

