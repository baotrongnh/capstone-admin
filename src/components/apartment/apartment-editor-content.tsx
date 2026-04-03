"use client"

import { ApartmentBasicSection } from "@/components/apartment/apartment-basic-section"
import {
     ApartmentAmenitySection,
     ApartmentOwnerSection,
} from "@/components/apartment/apartment-profile-sections"
import {
     ApartmentRentalSummarySection,
     ApartmentRoomsSection,
     ApartmentTenantSection,
} from "@/components/apartment/apartment-occupancy-sections"
import {
     ApartmentIotSection,
     MOCK_IOT_BOARDS,
} from "@/components/apartment/apartment-iot-section"
import { ApartmentMediaSection } from "@/components/apartment/apartment-media-section"
import { Button } from "@/components/ui/button"
import { buildApartmentFormData } from "@/lib/builders/apartment-form-data"
import {
     ApartmentFieldErrors,
     ApartmentValidationField,
     toApartmentFieldErrors,
     validateApartmentForm,
} from "@/lib/apartment/apartment-validation"
import { useApartment, useCreateApartment, useUpdateApartment } from "@/hooks/query/useApartments"
import { useFullAddress } from "@/hooks/query/useAddress"
import { useUser, useUsers } from "@/hooks/query/useUsers"
import { useApartmentEditorState } from "@/hooks/apartment/use-apartment-editor-state"
import { useApartmentGeocoding } from "@/hooks/apartment/use-apartment-geocoding"
import { useApartmentMediaState } from "@/hooks/apartment/use-apartment-media-state"
import {
     ApartmentForm,
     buildApartmentForm,
     formatDateTime,
     formatStatus,
} from "@/types/apartment-modal"
import type { ApartmentDetailData } from "@/types/apartment"
import { formatVND } from "@/utils/format"
import { message } from "antd"
import {
     Bath,
     BedDouble,
     Building2,
     CalendarDays,
     CircleDollarSign,
     Clock3,
     Hash,
     Home,
     Info,
     Landmark,
     MapPin,
     Ruler,
     Star,
     Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type ApartmentDetailContentProps = {
     apartmentId: string | null
     mode: "create" | "view" | "edit"
     allowEdit?: boolean
     inDialog?: boolean
     onCreateSuccess?: () => void
     onCreateCancel?: () => void
}

const DEFAULT_CREATE_FORM: ApartmentForm = {
     furnishingStatus: "unfurnished",
     status: "available",
     amenities: [],
     images: [],
}

const hasApartmentFormChanged = (
     initialForm: ApartmentForm | null,
     currentForm: ApartmentForm | null,
) => {
     if (!initialForm || !currentForm) return false

     const initialData = initialForm as Record<string, unknown>
     const currentData = currentForm as Record<string, unknown>
     const keys = Array.from(new Set([...Object.keys(initialData), ...Object.keys(currentData)]))

     return keys.some((key) => {
          const before = initialData[key] ?? null
          const after = currentData[key] ?? null
          return JSON.stringify(before) !== JSON.stringify(after)
     })
}

const buildAmenityOptions = (
     detailAmenities?: string[] | null,
     formAmenities?: string[] | null,
) => {
     return Array.from(new Set([...(detailAmenities || []), ...(formAmenities || [])]))
}

const AVAILABLE_YEARS = (() => {
     const currentYear = new Date().getFullYear()
     return Array.from({ length: currentYear - 1950 + 1 }, (_, idx) => currentYear - idx)
})()

const findInitialIotBoardId = (detailApartment?: ApartmentDetailData | null) => {
     if (!detailApartment?.iotDevices?.length) {
          return undefined
     }

     for (const item of detailApartment.iotDevices) {
          const id = String((item as { id?: string | null } | null | undefined)?.id || "")
          if (id && MOCK_IOT_BOARDS.some((board) => board.id === id)) {
               return id
          }
     }

     return undefined
}

const IOT_BOARD_OPTIONS = MOCK_IOT_BOARDS.map((board) => ({
     id: board.id,
     label: `${board.boardName} (${board.boardType}) - ${board.id}`,
}))

const buildApartmentDetailItems = (
     detailApartment: ApartmentDetailData,
     fullAddress: string,
) => {
     return [
          { label: "ID", value: detailApartment.id, icon: Hash },
          { label: "Mã căn hộ", value: detailApartment.apartmentNumber, icon: Home },
          { label: "Tên tòa nhà", value: detailApartment.buildingName, icon: Building2 },
          { label: "Tầng", value: detailApartment.floorNumber, icon: Building2 },
          { label: "Trạng thái", value: formatStatus(detailApartment.status), icon: Info },
          { label: "Đánh giá trung bình", value: detailApartment.rating, icon: Star },
          { label: "Nội thất", value: detailApartment.furnishingStatus, icon: Home },
          {
               label: "Giá thuê",
               value: formatVND(detailApartment.baseRentPrice, true),
               icon: CircleDollarSign,
          },
          {
               label: "Tiền cọc",
               value: detailApartment.depositAmount
                    ? formatVND(detailApartment.depositAmount, true)
                    : "-",
               icon: Landmark,
          },
          { label: "Diện tích tổng", value: `${detailApartment.totalArea} m²`, icon: Ruler },
          {
               label: "Diện tích sử dụng",
               value: detailApartment.usableArea ? `${detailApartment.usableArea} m²` : "-",
               icon: Ruler,
          },
          { label: "Số phòng ngủ", value: detailApartment.numberOfBedrooms, icon: BedDouble },
          { label: "Số phòng tắm", value: detailApartment.numberOfBathrooms, icon: Bath },
          { label: "Địa chỉ đầy đủ", value: fullAddress, icon: MapPin },
          { label: "Mã phường/xã", value: detailApartment.wardCode, icon: Hash },
          { label: "Mã tỉnh/thành", value: detailApartment.provinceCode, icon: Hash },
          { label: "Vĩ độ", value: detailApartment.latitude, icon: MapPin },
          { label: "Kinh độ", value: detailApartment.longitude, icon: MapPin },
          { label: "Năm xây dựng", value: detailApartment.yearBuilt, icon: CalendarDays },
          {
               label: "Số lượt xem đồng thời tối đa",
               value: detailApartment.maxConcurrentViewings,
               icon: Users,
          },
          {
               label: "Ngày duyệt",
               value: formatDateTime(detailApartment.approvedAt),
               icon: Clock3,
          },
          { label: "Ngày tạo", value: formatDateTime(detailApartment.createdAt), icon: Clock3 },
          {
               label: "Cập nhật lần cuối",
               value: formatDateTime(detailApartment.updatedAt),
               icon: Clock3,
          },
     ]
}

export function ApartmentDetailContent({
     apartmentId,
     mode,
     allowEdit = true,
     inDialog = false,
     onCreateSuccess,
     onCreateCancel,
}: ApartmentDetailContentProps) {
     const router = useRouter()
     const {
          data: apartmentDetailResponse,
          isLoading,
          isFetching,
          isError,
     } = useApartment(apartmentId || "")

     const updateApartment = useUpdateApartment()
     const createApartment = useCreateApartment()

     const detailApartment = apartmentDetailResponse?.data
     const detailLoading = isLoading || isFetching

     const isCreateMode = mode === "create"

     const initialForm = useMemo(() => {
          if (isCreateMode) return DEFAULT_CREATE_FORM
          if (!detailApartment) return null
          return buildApartmentForm(detailApartment)
     }, [detailApartment, isCreateMode])

     const initialIotBoardId = useMemo(
          () => findInitialIotBoardId(detailApartment),
          [detailApartment],
     )

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
          selectedIotBoardId,
          setSelectedIotBoardId,
          roomTags,
          setRoomTags,
          setField,
          setNumberField,
          setCurrencyField,
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
          initialIotBoardId,
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

     const [fieldErrors, setFieldErrors] = useState<ApartmentFieldErrors>({})

     const editMode = isCreateMode || mode === "edit" || manualEditMode

     const { data: usersResponse, isLoading: usersLoading } = useUsers({ page: 1, limit: 200 })

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
               setField("latitude", latitude)
               setField("longitude", longitude)
          },
     })

     const usableAreaInvalid =
          form?.usableArea !== undefined &&
          form?.totalArea !== undefined &&
          form.usableArea > form.totalArea

     const iotBoardOptions = IOT_BOARD_OPTIONS
     const selectedIotBoard = MOCK_IOT_BOARDS.find((board) => board.id === selectedIotBoardId)

     const selectedIotBoardDevices = selectedIotBoard?.devices || []

     const roomOptions = detailApartment?.rooms.map((room) => room.roomNumber).filter(Boolean) || []
     const amenityPresetOptions = buildAmenityOptions(detailApartment?.amenities, form?.amenities)
     const detailItems = detailApartment ? buildApartmentDetailItems(detailApartment, fullAddress) : []
     const availableYears = AVAILABLE_YEARS

     const isSaving = updateApartment.isPending || createApartment.isPending
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
               selectedIotBoardId !== initialIotBoardId)

     const canSaveChanges =
          !!form &&
          !usableAreaInvalid &&
          (isCreateMode || hasFormChanges || hasMediaChanges || hasClientChanges)

     const clearFieldError = (field: ApartmentValidationField) => {
          setFieldErrors((prev) => {
               if (!prev[field]) {
                    return prev
               }

               const next = { ...prev }
               delete next[field]
               return next
          })
     }

     const handleFieldChange = (field: string, value: unknown) => {
          setField(field, value)
          clearFieldError(field as ApartmentValidationField)
     }

     const handleNumberFieldChange = (key: string, raw: string) => {
          setNumberField(key, raw)
          clearFieldError(key as ApartmentValidationField)
     }

     const handleCurrencyFieldChange = (key: string, raw: string) => {
          setCurrencyField(key, raw)
          clearFieldError(key as ApartmentValidationField)
     }

     const validateBeforeSave = (targetForm: ApartmentForm) => {
          const validationErrors = validateApartmentForm(targetForm)
          if (validationErrors.length > 0) {
               setFieldErrors(toApartmentFieldErrors(validationErrors))
               message.error(validationErrors[0].message)
               return false
          }

          setFieldErrors({})

          if (usableAreaInvalid) {
               message.error("Diện tích sử dụng không được lớn hơn diện tích tổng")
               return false
          }

          return true
     }

     const handleCreateApartment = async (payloadData: FormData) => {
          try {
               await createApartment.mutateAsync(payloadData)
               resetMediaState()
               resetTransientState()
               resetCreateDraft()
               if (onCreateSuccess) {
                    onCreateSuccess()
               } else {
                    router.push("/operator/apartments")
               }
          } catch {
               // Error toast is already handled in useCreateApartment
          }
     }

     const handleUpdateApartment = async (payloadData: FormData) => {
          if (!apartmentId) return

          if (!canSaveChanges) {
               message.info("Chưa có thay đổi để lưu")
               return
          }

          try {
               await updateApartment.mutateAsync({ id: apartmentId, data: payloadData })
               if (hasClientChanges) {
                    message.info("Mạch IoT/phòng đã cập nhật trên UI và sẵn sàng nối BE.")
               }
               handleCancelEdit()
          } catch {
               // Error toast is already handled in useUpdateApartment
          }
     }

     const handlePickCoordinate = (value: { latitude: number; longitude: number }) => {
          handleFieldChange("latitude", value.latitude)
          handleFieldChange("longitude", value.longitude)
          markManualCoordinatePick()
     }

     const handleStartEdit = () => {
          if (isCreateMode) return
          if (!allowEdit) return

          if (!startEditDraft()) return

          setTenantCount(detailApartment?.userApartments.length ?? 0)
          setRoomTags(initialRoomTags)
          setSelectedIotBoardId(initialIotBoardId)
          setFieldErrors({})
          resetGeocodeTracking()
          setManualEditMode(true)
     }

     const handleCancelEdit = () => {
          resetMediaState()
          resetTransientState()
          setFieldErrors({})
          resetGeocodeTracking()

          if (isCreateMode) {
               resetCreateDraft()
               if (onCreateCancel) {
                    onCreateCancel()
               } else {
                    router.push("/operator/apartments")
               }
               return
          }

          setDraftForm(null)
          setManualEditMode(false)
     }

     const handleRemoveExistingImage = (index: number) => {
          if (!form) return

          setField(
               "images",
               (form.images || []).filter((_, currentIndex) => currentIndex !== index),
          )
     }

     const handleSave = async () => {
          if (!form) return

          if (!validateBeforeSave(form)) {
               return
          }

          const payloadData = buildApartmentFormData(form, {
               mode: isCreateMode ? "create" : "update",
               imageFiles: selectedImageFiles,
               videoFile: selectedVideoFile,
          })

          if (isCreateMode) {
               await handleCreateApartment(payloadData)
               return
          }

          await handleUpdateApartment(payloadData)
     }

     const handleSelectDepositPreset = (value: 1 | 2) => {
          const applied = applyDepositPreset(value)
          if (!applied) {
               message.info("Vui lòng nhập giá thuê trước khi chọn nhanh tiền cọc")
          }
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
                              <ApartmentBasicSection
                                   editMode={editMode}
                                   form={form}
                                   fieldErrors={fieldErrors}
                                   detailItems={detailItems}
                                   fullAddress={fullAddress}
                                   availableYears={availableYears}
                                   usableAreaInvalid={usableAreaInvalid}
                                   initialProvinceCode={detailApartment?.provinceCode || undefined}
                                   selectedDepositPreset={selectedDepositPreset}
                                   geocodeStatus={geocodeStatus}
                                   geocodeErrorMessage={geocodeErrorMessage}
                                   setField={handleFieldChange}
                                   setNumberField={handleNumberFieldChange}
                                   setCurrencyField={handleCurrencyFieldChange}
                                   onSelectDepositPreset={handleSelectDepositPreset}
                                   onPickCoordinate={handlePickCoordinate}
                              />

                              <ApartmentOwnerSection
                                   editMode={editMode}
                                   ownerSummary={ownerSummary}
                                   ownerId={form.ownerId || undefined}
                                   ownerOptions={ownerOptions}
                                   usersLoading={usersLoading}
                                   onOwnerChange={(value) => setField("ownerId", value)}
                              />

                              <ApartmentAmenitySection
                                   editMode={editMode}
                                   description={form.description}
                                   amenities={form.amenities || []}
                                   presetOptions={amenityPresetOptions}
                                   onDescriptionChange={(value) => setField("description", value)}
                                   onAmenitiesChange={(value) => setField("amenities", value)}
                              />

                              <ApartmentMediaSection
                                   editMode={editMode}
                                   existingImages={form.images || []}
                                   selectedImagePreviews={imagePreviews}
                                   selectedVideoFile={selectedVideoFile}
                                   selectedVideoPreviewUrl={selectedVideoPreviewUrl}
                                   videoTourUrl={form.videoTourUrl}
                                   onSelectImages={handleSelectImages}
                                   onSelectVideo={handleSelectVideo}
                                   onRemoveExistingImage={handleRemoveExistingImage}
                                   onRemoveSelectedImage={handleRemoveSelectedImage}
                                   onRemoveSelectedVideo={handleRemoveSelectedVideo}
                              />

                              <ApartmentRentalSummarySection
                                   editMode={editMode}
                                   tenantCount={tenantCount}
                                   utilityMeterCount={detailApartment?.utilityMeters.length ?? 0}
                                   onTenantCountChange={setTenantCount}
                              />

                              <ApartmentIotSection
                                   editMode={editMode}
                                   selectedBoardId={selectedIotBoardId}
                                   selectedBoardLabel={selectedIotBoard ? `${selectedIotBoard.boardName} (${selectedIotBoard.boardType})` : undefined}
                                   boardOptions={iotBoardOptions}
                                   boardDevices={selectedIotBoardDevices}
                                   iotDeviceCount={detailApartment?.iotDevices.length ?? 0}
                                   onBoardChange={setSelectedIotBoardId}
                              />

                              <ApartmentRoomsSection
                                   editMode={editMode}
                                   roomTags={roomTags}
                                   roomOptions={roomOptions}
                                   rooms={detailApartment?.rooms || []}
                                   onRoomTagsChange={setRoomTags}
                              />

                              <ApartmentTenantSection tenants={detailApartment?.userApartments || []} />

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
                                                  <Button variant="outline" onClick={handleCancelEdit}>
                                                       Hủy
                                                  </Button>
                                                  <Button onClick={handleSave} disabled={isSaving || (!isCreateMode && !canSaveChanges)}>
                                                       {isCreateMode ? (isSaving ? "Đang tạo..." : "Tạo căn hộ") : isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                                  </Button>
                                             </>
                                        ) : allowEdit && !isCreateMode ? (
                                             <Button onClick={handleStartEdit}>Chỉnh sửa</Button>
                                        ) : null}
                                   </div>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     )
}

export { ApartmentDetailContent as ApartmentEditorContent }
