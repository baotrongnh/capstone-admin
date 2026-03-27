"use client"

import { Button } from "@/components/ui/button"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useApartment, useUpdateApartment } from "@/hooks/query/useApartments"
import { formatVND } from "@/utils/format"
import { message } from "antd"
import Image from "next/image"
import { ChangeEvent, useMemo, useState } from "react"
import { UploadIcon, XIcon } from "lucide-react"
import { ApartmentAddressFields } from "./apartment-address-fields"
import {
     ApartmentForm,
     ApartmentStatus,
     FurnishingStatus,
     buildApartmentForm,
     formatDateTime,
     formatStatus,
     getDisplayAddress,
     parseNumber,
     readFileAsDataUrl,
     toInputValue,
} from "./apartment-modal"

type ApartmentDetailModalProps = {
     open: boolean
     apartmentId: string | null
     mode: "view" | "edit"
     onOpenChange: (open: boolean) => void
     allowEdit?: boolean
}

type DetailItemProps = {
     label: string
     value?: string | number | null
}

function DetailItem({ label, value }: DetailItemProps) {
     return (
          <div className="space-y-1 rounded-md border p-3">
               <p className="text-xs text-muted-foreground">{label}</p>
               <p className="text-sm font-medium wrap-break-word">{value || "-"}</p>
          </div>
     )
}

export function ApartmentDetailModal({
     open,
     apartmentId,
     mode,
     onOpenChange,
     allowEdit = true,
}: ApartmentDetailModalProps) {
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

     const editMode = mode === "edit" || manualEditMode
     const form = draftForm || initialForm

     const displayImages = editMode ? form?.images || [] : detailApartment?.images || []

     const setField = <K extends keyof ApartmentForm>(key: K, value: ApartmentForm[K]) => {
          if (!form) return
          setDraftForm({ ...form, [key]: value })
     }

     const setNumberField = <K extends keyof ApartmentForm>(key: K, raw: string) => {
          setField(key, parseNumber(raw) as ApartmentForm[K])
     }

     const handleStartEdit = () => {
          if (!initialForm || !allowEdit) return
          setDraftForm(initialForm)
          setManualEditMode(true)
     }

     const handleCancelEdit = () => {
          setDraftForm(null)
          setManualEditMode(false)
     }

     const handleSave = () => {
          if (!apartmentId || !form) return

          updateApartment.mutate(
               { id: apartmentId, data: form },
               {
                    onSuccess: () => {
                         message.success("Đã cập nhật căn hộ")
                         handleCancelEdit()
                    },
               },
          )
     }

     const handleUploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
          if (!form) return

          const files = event.target.files
          if (!files || files.length === 0) return

          try {
               const uploadedImages = await Promise.all(Array.from(files).map(readFileAsDataUrl))
               setField("images", [...(form.images || []), ...uploadedImages])
               message.success(`Đã thêm ${uploadedImages.length} ảnh`)
          } catch {
               message.error("Không thể tải ảnh lên")
          } finally {
               event.target.value = ""
          }
     }

     const handleRemoveImage = (index: number) => {
          if (!form) return

          setField(
               "images",
               (form.images || []).filter((_, imageIndex) => imageIndex !== index),
          )
     }

     const handleOpenChange = (nextOpen: boolean) => {
          if (!nextOpen) {
               handleCancelEdit()
          }
          onOpenChange(nextOpen)
     }

     return (
          <Dialog open={open} onOpenChange={handleOpenChange}>
               <DialogContent className="sm:max-w-5xl max-h-[88vh] overflow-y-auto">
                    <DialogHeader>
                         <DialogTitle>{editMode ? "Chỉnh sửa căn hộ" : "Chi tiết căn hộ"}</DialogTitle>
                         <DialogDescription>
                              {editMode
                                   ? "Bạn có thể chỉnh sửa trực tiếp các trường bên dưới."
                                   : "Thông tin chi tiết đầy đủ được lấy từ API theo mã căn hộ."}
                         </DialogDescription>
                    </DialogHeader>

                    {!apartmentId && (
                         <p className="text-sm text-muted-foreground">Vui lòng chọn căn hộ để xem chi tiết.</p>
                    )}

                    {apartmentId && detailLoading && (
                         <p className="text-sm text-muted-foreground">Đang tải chi tiết căn hộ...</p>
                    )}

                    {apartmentId && isError && (
                         <p className="text-sm text-destructive">Không thể tải chi tiết căn hộ. Vui lòng thử lại.</p>
                    )}

                    {detailApartment && form && (
                         <div className="space-y-6">
                              <section className="rounded-lg border p-4 space-y-3 bg-muted/20">
                                   <h3 className="text-sm font-semibold">Thông tin cơ bản</h3>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {editMode ? (
                                             <>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Tên tòa nhà</p>
                                                       <Input
                                                            value={form.buildingName || ""}
                                                            onChange={(e) => setField("buildingName", e.target.value || undefined)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Mã căn hộ</p>
                                                       <Input
                                                            value={form.apartmentNumber || ""}
                                                            onChange={(e) =>
                                                                 setField("apartmentNumber", e.target.value || undefined)
                                                            }
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Tầng</p>
                                                       <Input
                                                            value={toInputValue(form.floorNumber)}
                                                            onChange={(e) => setNumberField("floorNumber", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Trạng thái</p>
                                                       <Select
                                                            value={form.status || "available"}
                                                            onValueChange={(value) =>
                                                                 setField("status", value as ApartmentStatus)
                                                            }
                                                       >
                                                            <SelectTrigger className="w-full">
                                                                 <SelectValue placeholder="Chọn trạng thái" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                 <SelectItem value="available">Còn trống</SelectItem>
                                                                 <SelectItem value="occupied">Đang thuê</SelectItem>
                                                                 <SelectItem value="maintenance">Bảo trì</SelectItem>
                                                                 <SelectItem value="reserved">Đã giữ chỗ</SelectItem>
                                                                 <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                                                            </SelectContent>
                                                       </Select>
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Diện tích tổng (m²)</p>
                                                       <Input
                                                            value={toInputValue(form.totalArea)}
                                                            onChange={(e) => setNumberField("totalArea", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Diện tích sử dụng (m²)</p>
                                                       <Input
                                                            value={toInputValue(form.usableArea)}
                                                            onChange={(e) => setNumberField("usableArea", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Số phòng ngủ</p>
                                                       <Input
                                                            value={toInputValue(form.numberOfBedrooms)}
                                                            onChange={(e) => setNumberField("numberOfBedrooms", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Số phòng tắm</p>
                                                       <Input
                                                            value={toInputValue(form.numberOfBathrooms)}
                                                            onChange={(e) => setNumberField("numberOfBathrooms", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Nội thất</p>
                                                       <Select
                                                            value={form.furnishingStatus || "unfurnished"}
                                                            onValueChange={(value) =>
                                                                 setField("furnishingStatus", value as FurnishingStatus)
                                                            }
                                                       >
                                                            <SelectTrigger className="w-full">
                                                                 <SelectValue placeholder="Chọn nội thất" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                 <SelectItem value="unfurnished">Không nội thất</SelectItem>
                                                                 <SelectItem value="semi_furnished">Nội thất cơ bản</SelectItem>
                                                                 <SelectItem value="fully_furnished">Đầy đủ nội thất</SelectItem>
                                                            </SelectContent>
                                                       </Select>
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Giá thuê</p>
                                                       <Input
                                                            value={toInputValue(form.baseRentPrice)}
                                                            onChange={(e) => setNumberField("baseRentPrice", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Tiền cọc</p>
                                                       <Input
                                                            value={toInputValue(form.depositAmount)}
                                                            onChange={(e) => setNumberField("depositAmount", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1 md:col-span-2">
                                                       <p className="text-xs text-muted-foreground">Địa chỉ hiện tại</p>
                                                       <Input value={getDisplayAddress(detailApartment)} disabled />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Năm xây dựng</p>
                                                       <Input
                                                            value={toInputValue(form.yearBuilt)}
                                                            onChange={(e) => setNumberField("yearBuilt", e.target.value)}
                                                       />
                                                  </div>
                                                  <div className="space-y-1">
                                                       <p className="text-xs text-muted-foreground">Video tour URL</p>
                                                       <Input
                                                            value={form.videoTourUrl || ""}
                                                            onChange={(e) =>
                                                                 setField("videoTourUrl", e.target.value || undefined)
                                                            }
                                                       />
                                                  </div>
                                             </>
                                        ) : (
                                             <>
                                                  <DetailItem label="ID" value={detailApartment.id} />
                                                  <DetailItem label="Mã căn hộ" value={detailApartment.apartmentNumber} />
                                                  <DetailItem label="Tên tòa nhà" value={detailApartment.buildingName} />
                                                  <DetailItem label="Tầng" value={detailApartment.floorNumber} />
                                                  <DetailItem label="Trạng thái" value={formatStatus(detailApartment.status)} />
                                                  <DetailItem label="Nội thất" value={detailApartment.furnishingStatus} />
                                                  <DetailItem
                                                       label="Giá thuê"
                                                       value={formatVND(detailApartment.baseRentPrice, true)}
                                                  />
                                                  <DetailItem
                                                       label="Tiền cọc"
                                                       value={
                                                            detailApartment.depositAmount
                                                                 ? formatVND(detailApartment.depositAmount, true)
                                                                 : "-"
                                                       }
                                                  />
                                                  <DetailItem
                                                       label="Diện tích tổng"
                                                       value={`${detailApartment.totalArea} m²`}
                                                  />
                                                  <DetailItem
                                                       label="Diện tích sử dụng"
                                                       value={
                                                            detailApartment.usableArea
                                                                 ? `${detailApartment.usableArea} m²`
                                                                 : "-"
                                                       }
                                                  />
                                                  <DetailItem
                                                       label="Số phòng ngủ"
                                                       value={detailApartment.numberOfBedrooms}
                                                  />
                                                  <DetailItem
                                                       label="Số phòng tắm"
                                                       value={detailApartment.numberOfBathrooms}
                                                  />
                                                  <DetailItem
                                                       label="Địa chỉ mới (v2)"
                                                       value={
                                                            detailApartment.newAddress
                                                                 ? `${detailApartment.newAddress.wardName || "-"}, ${detailApartment.newAddress.provinceName || "-"}`
                                                                 : "-"
                                                       }
                                                  />
                                                  <DetailItem label="Địa chỉ hiển thị" value={getDisplayAddress(detailApartment)} />
                                                  <DetailItem label="Năm xây dựng" value={detailApartment.yearBuilt} />
                                                  <DetailItem label="Video tour" value={detailApartment.videoTourUrl} />
                                                  <DetailItem
                                                       label="Ngày tạo"
                                                       value={formatDateTime(detailApartment.createdAt)}
                                                  />
                                                  <DetailItem
                                                       label="Cập nhật lần cuối"
                                                       value={formatDateTime(detailApartment.updatedAt)}
                                                  />
                                             </>
                                        )}
                                   </div>
                              </section>

                              {editMode && (
                                   <ApartmentAddressFields
                                        initialCodes={{
                                             newProvinceCode: detailApartment.newAddress?.provinceCode || undefined,
                                             newWardCode: form.newWardCode,
                                        }}
                                        onChange={({ newWardCode }: { newWardCode?: number }) => {
                                             setField("newWardCode", newWardCode)
                                        }}
                                   />
                              )}

                              <section className="rounded-lg border p-4 space-y-3">
                                   <h3 className="text-sm font-semibold">Mô tả và tiện ích</h3>
                                   {editMode ? (
                                        <div className="space-y-3">
                                             <div className="space-y-1">
                                                  <p className="text-xs text-muted-foreground">Mô tả</p>
                                                  <Textarea
                                                       value={form.description || ""}
                                                       onChange={(e) => setField("description", e.target.value || undefined)}
                                                  />
                                             </div>
                                             <div className="space-y-1">
                                                  <p className="text-xs text-muted-foreground">Tiện ích (phân tách bằng dấu phẩy)</p>
                                                  <Textarea
                                                       value={(form.amenities || []).join(", ")}
                                                       onChange={(e) =>
                                                            setField(
                                                                 "amenities",
                                                                 e.target.value
                                                                      .split(",")
                                                                      .map((item) => item.trim())
                                                                      .filter(Boolean),
                                                            )
                                                       }
                                                       rows={3}
                                                  />
                                             </div>
                                        </div>
                                   ) : (
                                        <>
                                             <div>
                                                  <p className="text-xs text-muted-foreground mb-1">Mô tả</p>
                                                  <p className="text-sm">{detailApartment.description || "-"}</p>
                                             </div>
                                             <div>
                                                  <p className="text-xs text-muted-foreground mb-1">Tiện ích</p>
                                                  <p className="text-sm">
                                                       {detailApartment.amenities?.length
                                                            ? detailApartment.amenities.join(", ")
                                                            : "-"}
                                                  </p>
                                             </div>
                                        </>
                                   )}
                              </section>

                              <section className="rounded-lg border p-4 space-y-3">
                                   <h3 className="text-sm font-semibold">Hình ảnh</h3>
                                   {editMode && (
                                        <div className="space-y-1">
                                             <p className="text-xs text-muted-foreground">Tải ảnh lên từ máy tính</p>
                                             <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                                                  <UploadIcon className="size-4" />
                                                  Chọn ảnh
                                                  <input
                                                       type="file"
                                                       accept="image/*"
                                                       multiple
                                                       className="hidden"
                                                       onChange={handleUploadImages}
                                                  />
                                             </label>
                                        </div>
                                   )}

                                   {displayImages.length > 0 ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                             {displayImages.map((src, index) => (
                                                  <div key={`${src}-${index}`} className="relative">
                                                       <Image
                                                            src={src}
                                                            alt={`Apartment image ${index + 1}`}
                                                            width={320}
                                                            height={180}
                                                            unoptimized
                                                            className="h-28 w-full rounded-md object-cover border"
                                                       />
                                                       {editMode && (
                                                            <button
                                                                 type="button"
                                                                 onClick={() => handleRemoveImage(index)}
                                                                 className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                                                                 aria-label={`Xóa ảnh ${index + 1}`}
                                                            >
                                                                 <XIcon className="size-3" />
                                                            </button>
                                                       )}
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <p className="text-sm text-muted-foreground">Không có hình ảnh.</p>
                                   )}
                              </section>

                              <section className="rounded-lg border p-4 space-y-3">
                                   <h3 className="text-sm font-semibold">Thông tin phòng</h3>
                                   {detailApartment.rooms.length > 0 ? (
                                        <div className="space-y-2">
                                             {detailApartment.rooms.map((room) => (
                                                  <div key={room.id} className="rounded-md border p-3 text-sm">
                                                       <p className="font-medium">
                                                            {room.roomNumber} - {room.roomType}
                                                       </p>
                                                       <p className="text-muted-foreground">
                                                            Diện tích: {room.area || "-"} m² | Trạng thái: {room.status}
                                                       </p>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <p className="text-sm text-muted-foreground">Không có thông tin phòng.</p>
                                   )}
                              </section>

                              <section className="rounded-lg border p-4 space-y-3">
                                   <h3 className="text-sm font-semibold">Thông tin thuê và thiết bị</h3>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <DetailItem label="Số người thuê" value={detailApartment.userApartments.length} />
                                        <DetailItem label="Thiết bị IoT" value={detailApartment.iotDevices.length} />
                                        <DetailItem label="Đồng hồ tiện ích" value={detailApartment.utilityMeters.length} />
                                   </div>

                                   {detailApartment.userApartments.length > 0 && (
                                        <div className="space-y-2">
                                             {detailApartment.userApartments.map((tenant) => (
                                                  <div key={tenant.id} className="rounded-md border p-3 text-sm">
                                                       <p className="font-medium">{tenant.user.fullName}</p>
                                                       <p className="text-muted-foreground">
                                                            Vai trò: {tenant.isPrimaryTenant ? "Người thuê chính" : "Thành viên"} |
                                                            Trạng thái: {tenant.status}
                                                       </p>
                                                  </div>
                                             ))}
                                        </div>
                                   )}
                              </section>

                              <DialogFooter>
                                   {editMode ? (
                                        <>
                                             <Button variant="outline" onClick={handleCancelEdit}>
                                                  Hủy
                                             </Button>
                                             <Button onClick={handleSave} disabled={updateApartment.isPending}>
                                                  {updateApartment.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                                             </Button>
                                        </>
                                   ) : allowEdit ? (
                                        <Button onClick={handleStartEdit}>Chỉnh sửa</Button>
                                   ) : null}
                              </DialogFooter>
                         </div>
                    )}
               </DialogContent>
          </Dialog>
     )
}
