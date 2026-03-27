"use client"

import { Button } from "@/components/ui/button"
import { useFullAddress } from "@/hooks/query/useAddress"
import { useApartment, useUpdateApartment } from "@/hooks/query/useApartments"
import { useUser, useUsers } from "@/hooks/query/useUsers"
import {
     ApartmentForm,
     buildApartmentForm,
     formatDateTime,
     formatStatus,
     parseNumber,
} from "@/types/apartment-modal"
import { formatVND, parseVNDInput } from "@/utils/format"
import { uploadFile } from "@/utils/uploadFile"
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
import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { ApartmentBasicInfoSection } from "./apartment-basic-info-section"
import {
     ApartmentAmenitySection,
     ApartmentOwnerSection,
     ApartmentRentalSummarySection,
     ApartmentRoomsSection,
     ApartmentTenantSection,
} from "./apartment-detail-sections"
import { ApartmentIotBoardSection } from "./apartment-iot-board-section"
import { MOCK_IOT_BOARDS } from "./apartment-iot-mock"
import { ApartmentMediaSection } from "./apartment-media-section"

type ApartmentDetailContentProps = {
     apartmentId: string | null
     mode: "view" | "edit"
     allowEdit?: boolean
     inDialog?: boolean
}

export function ApartmentDetailContent({
     apartmentId,
     mode,
     allowEdit = true,
     inDialog = false,
}: ApartmentDetailContentProps) {
     const {
          data: apartmentDetailResponse,
          isLoading,
          isFetching,
          isError,
     } = useApartment(apartmentId || "")

     const updateApartment = useUpdateApartment()

     const detailApartment = apartmentDetailResponse?.data
     const detailLoading = isLoading || isFetching

     const initialForm = useMemo(() => {
          if (!detailApartment) return null
          return buildApartmentForm(detailApartment)
     }, [detailApartment])

     const [manualEditMode, setManualEditMode] = useState(false)
     const [draftForm, setDraftForm] = useState<ApartmentForm | null>(null)

     const [tenantCount, setTenantCount] = useState(0)
     const [selectedIotBoardId, setSelectedIotBoardId] = useState<string | undefined>()
     const [roomTags, setRoomTags] = useState<string[]>([])

     const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([])
     const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
     const [isUploadingMedia, setIsUploadingMedia] = useState(false)

     const editMode = mode === "edit" || manualEditMode
     const form = draftForm || initialForm

     const initialIotBoardId = useMemo(
          () =>
               detailApartment?.iotDevices
                    .map((item) =>
                         typeof item === "object" && item && "id" in item
                              ? String((item as { id?: string }).id || "")
                              : "",
                    )
                    .find((id) => MOCK_IOT_BOARDS.some((board) => board.id === id)) || undefined,
          [detailApartment?.iotDevices],
     )

     const initialRoomTags = useMemo(
          () => detailApartment?.rooms.map((room) => room.roomNumber).filter(Boolean) || [],
          [detailApartment?.rooms],
     )

     const { data: usersResponse, isLoading: usersLoading } = useUsers({ page: 1, limit: 200 })

     // TODO: Replace mock boards with API query when backend board endpoint is available.
     // Suggested integration point: const { data: iotBoardsResponse } = useIotBoards(...)
     const iotBoards = MOCK_IOT_BOARDS

     const ownerOptions = usersResponse?.data || []
     const selectedOwnerId = form?.ownerId || detailApartment?.ownerId || undefined
     const { data: selectedOwnerResponse } = useUser(selectedOwnerId || undefined)

     const selectedOwnerFromList = ownerOptions.find((item) => item.id === selectedOwnerId)
     const selectedOwner = selectedOwnerResponse?.data

     const ownerName =
          selectedOwner?.fullName ||
          selectedOwnerFromList?.fullName ||
          detailApartment?.owner?.fullName ||
          "-"

     const ownerCompany = selectedOwner?.companyName || detailApartment?.owner?.companyName || "-"

     const fullAddress = useFullAddress(
          form?.streetAddress || detailApartment?.streetAddress || undefined,
          detailApartment?.provinceCode || undefined,
          form?.wardCode || detailApartment?.wardCode || undefined,
     )

     const usableAreaInvalid =
          form?.usableArea !== undefined &&
          form?.totalArea !== undefined &&
          form.usableArea > form.totalArea

     const imagePreviews = useMemo(
          () =>
               selectedImageFiles.map((file) => ({
                    file,
                    url: URL.createObjectURL(file),
               })),
          [selectedImageFiles],
     )

     const selectedVideoPreviewUrl = useMemo(
          () => (selectedVideoFile ? URL.createObjectURL(selectedVideoFile) : ""),
          [selectedVideoFile],
     )

     useEffect(() => {
          return () => {
               imagePreviews.forEach((item) => URL.revokeObjectURL(item.url))
          }
     }, [imagePreviews])

     useEffect(() => {
          return () => {
               if (selectedVideoPreviewUrl) {
                    URL.revokeObjectURL(selectedVideoPreviewUrl)
               }
          }
     }, [selectedVideoPreviewUrl])

     useEffect(() => {
          if (!detailApartment) return
          setTenantCount(detailApartment.userApartments.length)
          setRoomTags(initialRoomTags)
          setSelectedIotBoardId(initialIotBoardId)
     }, [detailApartment, initialIotBoardId, initialRoomTags])

     const iotBoardOptions = useMemo(
          () =>
               iotBoards.map((board) => ({
                    id: board.id,
                    label: `${board.boardName} (${board.boardType}) - ${board.id}`,
               })),
          [iotBoards],
     )

     const selectedIotBoard = useMemo(
          () => iotBoards.find((board) => board.id === selectedIotBoardId),
          [iotBoards, selectedIotBoardId],
     )

     const selectedIotBoardDevices = selectedIotBoard?.devices || []

     const roomOptions = useMemo(
          () => detailApartment?.rooms.map((room) => room.roomNumber).filter(Boolean) || [],
          [detailApartment?.rooms],
     )

     const amenityPresetOptions = useMemo(
          () =>
               Array.from(
                    new Set([...(detailApartment?.amenities || []), ...(form?.amenities || [])]),
               ),
          [detailApartment?.amenities, form?.amenities],
     )

     const detailItems = useMemo(() => {
          if (!detailApartment) return []

          return [
               { label: "ID", value: detailApartment.id, icon: Hash },
               { label: "Mã căn hộ", value: detailApartment.apartmentNumber, icon: Home },
               { label: "Tên tòa nhà", value: detailApartment.buildingName, icon: Building2 },
               { label: "Tầng", value: detailApartment.floorNumber, icon: Building2 },
               { label: "Trạng thái", value: formatStatus(detailApartment.status), icon: Info },
               { label: "Đánh giá trung bình", value: detailApartment.rating, icon: Star },
               { label: "Nội thất", value: detailApartment.furnishingStatus, icon: Home },
               { label: "Giá thuê", value: formatVND(detailApartment.baseRentPrice, true), icon: CircleDollarSign },
               {
                    label: "Tiền cọc",
                    value: detailApartment.depositAmount ? formatVND(detailApartment.depositAmount, true) : "-",
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
               { label: "Số lượt xem đồng thời tối đa", value: detailApartment.maxConcurrentViewings, icon: Users },
               { label: "Ngày duyệt", value: formatDateTime(detailApartment.approvedAt), icon: Clock3 },
               { label: "Ngày tạo", value: formatDateTime(detailApartment.createdAt), icon: Clock3 },
               { label: "Cập nhật lần cuối", value: formatDateTime(detailApartment.updatedAt), icon: Clock3 },
          ]
     }, [detailApartment, fullAddress])

     const availableYears = useMemo(() => {
          const currentYear = new Date().getFullYear()
          return Array.from({ length: currentYear - 1950 + 1 }, (_, idx) => currentYear - idx)
     }, [])

     const isSaving = updateApartment.isPending || isUploadingMedia

     const hasMediaChanges = selectedImageFiles.length > 0 || !!selectedVideoFile

     const hasFormChanges = useMemo(() => {
          if (!initialForm || !form) return false

          const keys = Array.from(
               new Set([...Object.keys(initialForm), ...Object.keys(form)]),
          ) as Array<keyof ApartmentForm>

          return keys.some((key) => {
               const before = initialForm[key] ?? null
               const after = form[key] ?? null
               return JSON.stringify(before) !== JSON.stringify(after)
          })
     }, [form, initialForm])

     const hasClientChanges = useMemo(() => {
          const roomChanged = JSON.stringify(roomTags) !== JSON.stringify(initialRoomTags)
          const iotChanged = selectedIotBoardId !== initialIotBoardId

          return roomChanged || iotChanged
     }, [initialIotBoardId, initialRoomTags, roomTags, selectedIotBoardId])

     const canSaveChanges = !usableAreaInvalid && (hasFormChanges || hasMediaChanges || hasClientChanges)

     const setField = <K extends keyof ApartmentForm>(key: K, value: ApartmentForm[K]) => {
          if (!form) return
          setDraftForm({ ...form, [key]: value })
     }

     const setNumberField = <K extends keyof ApartmentForm>(key: K, raw: string) => {
          setField(key, parseNumber(raw) as ApartmentForm[K])
     }

     const setCurrencyField = <K extends keyof ApartmentForm>(key: K, raw: string) => {
          setField(key, parseVNDInput(raw) as ApartmentForm[K])
     }

     const handleStartEdit = () => {
          if (!initialForm || !allowEdit) return
          setDraftForm(initialForm)
          setManualEditMode(true)
     }

     const resetEditTransientState = () => {
          setSelectedImageFiles([])
          setSelectedVideoFile(null)
          setRoomTags(initialRoomTags)
          setSelectedIotBoardId(initialIotBoardId)
     }

     const handleCancelEdit = () => {
          setDraftForm(null)
          setManualEditMode(false)
          resetEditTransientState()
     }

     const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"))
          if (files.length === 0) return

          setSelectedImageFiles((prev) => {
               const merged = [...prev, ...files]
               if (merged.length > 10) {
                    message.warning("Tối đa 10 ảnh mỗi lần cập nhật")
               }
               return merged.slice(0, 10)
          })

          event.target.value = ""
     }

     const handleSelectVideo = (event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0]
          if (!file) return

          if (!file.type.startsWith("video/")) {
               message.error("Vui lòng chọn file video hợp lệ")
               event.target.value = ""
               return
          }

          setSelectedVideoFile(file)
          event.target.value = ""
     }

     const handleRemoveExistingImage = (index: number) => {
          if (!form) return

          setField(
               "images",
               (form.images || []).filter((_, currentIndex) => currentIndex !== index),
          )
     }

     const handleRemoveSelectedImage = (index: number) => {
          setSelectedImageFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
     }

     const handleSave = async () => {
          if (!apartmentId || !form) return

          if (!canSaveChanges) {
               message.info("Chưa có thay đổi để lưu")
               return
          }

          if (usableAreaInvalid) {
               message.error("Diện tích sử dụng không được lớn hơn diện tích tổng")
               return
          }

          setIsUploadingMedia(true)

          let uploadedImageUrls: string[] = []
          let uploadedVideoUrl: string | undefined

          if (selectedImageFiles.length > 0 || selectedVideoFile) {
               try {
                    if (selectedImageFiles.length > 0) {
                         const uploadedImages = await Promise.all(selectedImageFiles.map(uploadFile))
                         uploadedImageUrls = uploadedImages.map((item) => item.url)
                    }

                    if (selectedVideoFile) {
                         const uploadedVideo = await uploadFile(selectedVideoFile)
                         uploadedVideoUrl = uploadedVideo.url
                    }
               } catch {
                    setIsUploadingMedia(false)
                    message.error("Không thể tải media lên, vui lòng thử lại")
                    return
               }
          }

          const payload: ApartmentForm = {
               ...form,
               images: [...(form.images || []), ...uploadedImageUrls],
               videoTourUrl: uploadedVideoUrl || form.videoTourUrl,
          }

          try {
               await updateApartment.mutateAsync({ id: apartmentId, data: payload })
               message.success("Đã cập nhật căn hộ")
               if (hasClientChanges) {
                    message.info("Mạch IoT/phòng đã cập nhật trên UI và sẵn sàng nối BE.")
               }
               handleCancelEdit()
          } catch {
               // Error toast is already handled in useUpdateApartment
          } finally {
               setIsUploadingMedia(false)
          }
     }

     return (
          <div className="overflow-hidden rounded-xl border bg-background">
               <div className="border-b px-5 py-4 md:px-6">
                    <h2 className="text-lg font-semibold leading-none tracking-tight">
                         {editMode ? "Chỉnh sửa căn hộ" : "Chi tiết căn hộ"}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                         {editMode
                              ? "Cập nhật thông tin căn hộ theo từng nhóm trường để thao tác nhanh và chính xác."
                              : "Thông tin chi tiết căn hộ được hiển thị theo cấu trúc rõ ràng và dễ tra cứu."}
                    </p>
               </div>

               <div className={inDialog ? "max-h-[82vh] overflow-y-auto px-4 py-4 md:px-6 md:py-5" : "px-4 py-4 md:px-6 md:py-5"}>
                    {!apartmentId && (
                         <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                              Vui lòng chọn căn hộ để xem chi tiết.
                         </p>
                    )}

                    {apartmentId && detailLoading && (
                         <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                              Đang tải chi tiết căn hộ...
                         </p>
                    )}

                    {apartmentId && isError && (
                         <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                              Không thể tải chi tiết căn hộ. Vui lòng thử lại.
                         </p>
                    )}

                    {detailApartment && form && (
                         <div className="space-y-5">
                              <ApartmentBasicInfoSection
                                   editMode={editMode}
                                   form={form}
                                   detailItems={detailItems}
                                   fullAddress={fullAddress}
                                   availableYears={availableYears}
                                   usableAreaInvalid={usableAreaInvalid}
                                   initialProvinceCode={detailApartment.provinceCode || undefined}
                                   onSetField={setField}
                                   onSetNumberField={setNumberField}
                                   onSetCurrencyField={setCurrencyField}
                              />

                              <ApartmentOwnerSection
                                   editMode={editMode}
                                   ownerOptions={ownerOptions}
                                   ownerId={form.ownerId || undefined}
                                   ownerName={ownerName}
                                   ownerCompany={ownerCompany}
                                   usersLoading={usersLoading}
                                   detailOwnerId={detailApartment.ownerId}
                                   detailOwnerName={detailApartment.owner?.fullName}
                                   detailOwnerCompany={detailApartment.owner?.companyName}
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
                                   onRemoveSelectedVideo={() => setSelectedVideoFile(null)}
                              />

                              <ApartmentRentalSummarySection
                                   editMode={editMode}
                                   tenantCount={tenantCount}
                                   utilityMeterCount={detailApartment.utilityMeters.length}
                                   onTenantCountChange={setTenantCount}
                              />

                              <ApartmentIotBoardSection
                                   editMode={editMode}
                                   selectedBoardId={selectedIotBoardId}
                                   selectedBoardLabel={selectedIotBoard ? `${selectedIotBoard.boardName} (${selectedIotBoard.boardType})` : undefined}
                                   boardOptions={iotBoardOptions}
                                   boardDevices={selectedIotBoardDevices}
                                   iotDeviceCount={detailApartment.iotDevices.length}
                                   onBoardChange={setSelectedIotBoardId}
                              />

                              <ApartmentRoomsSection
                                   editMode={editMode}
                                   roomTags={roomTags}
                                   roomOptions={roomOptions}
                                   rooms={detailApartment.rooms}
                                   onRoomTagsChange={setRoomTags}
                              />

                              <ApartmentTenantSection tenants={detailApartment.userApartments} />

                              <div className="sticky bottom-0 flex justify-end gap-2 rounded-xl border bg-background/95 p-3 backdrop-blur">
                                   {editMode ? (
                                        <>
                                             <Button variant="outline" onClick={handleCancelEdit}>
                                                  Hủy
                                             </Button>
                                             <Button onClick={handleSave} disabled={isSaving || !canSaveChanges}>
                                                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                             </Button>
                                        </>
                                   ) : allowEdit ? (
                                        <Button onClick={handleStartEdit}>Chỉnh sửa</Button>
                                   ) : null}
                              </div>
                         </div>
                    )}
               </div>
          </div>
     )
}
