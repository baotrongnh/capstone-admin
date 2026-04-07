import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { ApartmentAddressFields } from "@/components/apartment/ui/address-fields"
import { ApartmentCoordinateMap } from "@/components/apartment/apartment-coordinate-map"
import {
     DetailItem,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/ui/section-primitives"
import type { DepositPreset } from "@/hooks/apartment/use-apartment-editor-state"
import type {
     ApartmentFieldErrors,
     ApartmentValidationField,
} from "@/lib/apartment/apartment-validation"
import type { ApartmentForm } from "@/types/apartment-form"
import type { GeocodeStatus } from "@/types/apartment"
import { formatVNDInput } from "@/utils/format"
import { Info, type LucideIcon } from "lucide-react"

type DetailEntry = {
     label: string
     value?: string | number | null
     icon?: LucideIcon
}

type ApartmentDetailsSectionProps = {
     editMode: boolean
     form: ApartmentForm
     fieldErrors?: ApartmentFieldErrors
     detailItems: DetailEntry[]
     fullAddress: string
     availableYears: number[]
     usableAreaInvalid: boolean
     initialProvinceCode?: number
     selectedDepositPreset?: DepositPreset | null
     geocodeStatus?: GeocodeStatus
     geocodeErrorMessage?: string | null
     setField: (field: string, value: unknown) => void
     setNumberField: (field: string, raw: string) => void
     setCurrencyField: (field: string, raw: string) => void
     onSelectDepositPreset?: (value: DepositPreset) => void
     onPickCoordinate?: (value: { latitude: number; longitude: number }) => void
}

const getGeocodeStatusText = (status: GeocodeStatus, errorMessage?: string | null) => {
     if (status === "loading") {
          return "Đang tự động lấy tọa độ từ địa chỉ..."
     }

     if (status === "success") {
          return "Đã cập nhật tọa độ tự động theo địa chỉ."
     }

     if (status === "not_found") {
          return "Không tìm thấy tọa độ từ địa chỉ hiện tại. Bạn có thể chọn trực tiếp trên bản đồ."
     }

     if (status === "error") {
          return errorMessage || "Không thể tự động lấy tọa độ. Vui lòng thử lại hoặc chọn trên bản đồ."
     }

     return null
}

export function ApartmentDetailsSection({
     editMode,
     form,
     fieldErrors,
     detailItems,
     fullAddress,
     availableYears,
     usableAreaInvalid,
     initialProvinceCode,
     selectedDepositPreset,
     geocodeStatus = "idle",
     geocodeErrorMessage,
     setField,
     setNumberField,
     setCurrencyField,
     onSelectDepositPreset,
     onPickCoordinate,
}: ApartmentDetailsSectionProps) {
     const baseRentPrice = form.baseRentPrice || 0
     const canPickDepositPreset = baseRentPrice > 0

     const getFieldError = (field: ApartmentValidationField) => fieldErrors?.[field]

     const geocodeStatusText = getGeocodeStatusText(geocodeStatus, geocodeErrorMessage)
     const isGeocodeErrorStatus = geocodeStatus === "error" || geocodeStatus === "not_found"

     return (
          <SectionCard className="bg-muted/20">
               <SectionTitle
                    title="Thông tin cơ bản"
                    description="Các trường nền tảng của căn hộ"
                    icon={Info}
               />

               <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {editMode ? (
                         <>
                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tên tòa nhà</p>
                                   <Input value={form.buildingName || ""} onChange={(e) => setField("buildingName", e.target.value || undefined)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Mã căn hộ</p>
                                   <Input
                                        value={form.apartmentNumber || ""}
                                        onChange={(e) => setField("apartmentNumber", e.target.value || undefined)}
                                        aria-invalid={getFieldError("apartmentNumber") ? true : undefined}
                                   />
                                   {getFieldError("apartmentNumber") ? (
                                        <p className="text-xs text-destructive">{getFieldError("apartmentNumber")}</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tầng</p>
                                   <Input value={form.floorNumber ?? ""} onChange={(e) => setNumberField("floorNumber", e.target.value)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Trạng thái</p>
                                   <Select value={form.status || "available"} onValueChange={(value) => setField("status", value)}>
                                        <SelectTrigger className="w-full">
                                             <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="available">Còn trống</SelectItem>
                                             <SelectItem value="occupied">Đang cho thuê</SelectItem>
                                             {/* <SelectItem value="maintenance">Bảo trì</SelectItem> */}
                                             <SelectItem value="reserved">Đã đặt cọc</SelectItem>
                                             <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                                        </SelectContent>
                                   </Select>
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Nội thất</p>
                                   <Select value={form.furnishingStatus || "unfurnished"} onValueChange={(value) => setField("furnishingStatus", value)}>
                                        <SelectTrigger className="w-full" aria-invalid={getFieldError("furnishingStatus") ? true : undefined}>
                                             <SelectValue placeholder="Chọn nội thất" />
                                        </SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="unfurnished">Không nội thất</SelectItem>
                                             <SelectItem value="semi_furnished">Nội thất cơ bản</SelectItem>
                                             <SelectItem value="fully_furnished">Đầy đủ nội thất</SelectItem>
                                        </SelectContent>
                                   </Select>
                                   {getFieldError("furnishingStatus") ? (
                                        <p className="text-xs text-destructive">{getFieldError("furnishingStatus")}</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Năm xây dựng</p>
                                   <Select
                                        value={form.yearBuilt ? String(form.yearBuilt) : "__empty__"}
                                        onValueChange={(value) => setField("yearBuilt", value === "__empty__" ? undefined : Number(value))}
                                   >
                                        <SelectTrigger className="w-full">
                                             <SelectValue placeholder="Chọn năm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="__empty__">Chưa chọn</SelectItem>
                                             {availableYears.map((year) => (
                                                  <SelectItem key={year} value={String(year)}>
                                                       {year}
                                                  </SelectItem>
                                             ))}
                                        </SelectContent>
                                   </Select>
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Diện tích tổng (m²)</p>
                                   <Input
                                        value={form.totalArea ?? ""}
                                        onChange={(e) => setNumberField("totalArea", e.target.value)}
                                        aria-invalid={getFieldError("totalArea") ? true : undefined}
                                   />
                                   {getFieldError("totalArea") ? (
                                        <p className="text-xs text-destructive">{getFieldError("totalArea")}</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Diện tích sử dụng (m²)</p>
                                   <Input value={form.usableArea ?? ""} onChange={(e) => setNumberField("usableArea", e.target.value)} />
                                   {usableAreaInvalid ? (
                                        <p className="text-xs text-destructive">Diện tích sử dụng không được lớn hơn diện tích tổng.</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Số phòng ngủ</p>
                                   <Input
                                        value={form.numberOfBedrooms ?? ""}
                                        onChange={(e) => setNumberField("numberOfBedrooms", e.target.value)}
                                        aria-invalid={getFieldError("numberOfBedrooms") ? true : undefined}
                                   />
                                   {getFieldError("numberOfBedrooms") ? (
                                        <p className="text-xs text-destructive">{getFieldError("numberOfBedrooms")}</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Số phòng tắm</p>
                                   <Input
                                        value={form.numberOfBathrooms ?? ""}
                                        onChange={(e) => setNumberField("numberOfBathrooms", e.target.value)}
                                        aria-invalid={getFieldError("numberOfBathrooms") ? true : undefined}
                                   />
                                   {getFieldError("numberOfBathrooms") ? (
                                        <p className="text-xs text-destructive">{getFieldError("numberOfBathrooms")}</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Giá thuê (VNĐ)</p>
                                   <Input
                                        value={formatVNDInput(form.baseRentPrice)}
                                        onChange={(e) => setCurrencyField("baseRentPrice", e.target.value)}
                                        aria-invalid={getFieldError("baseRentPrice") ? true : undefined}
                                   />
                                   {getFieldError("baseRentPrice") ? (
                                        <p className="text-xs text-destructive">{getFieldError("baseRentPrice")}</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tiền cọc (VNĐ)</p>
                                   <Input value={formatVNDInput(form.depositAmount)} onChange={(e) => setCurrencyField("depositAmount", e.target.value)} />
                                   {onSelectDepositPreset ? (
                                        <div className="pt-1">
                                             <p className="mb-1 text-[11px] text-muted-foreground">Chọn nhanh theo giá thuê</p>
                                             <div className="flex flex-wrap gap-2">
                                                  <Button
                                                       type="button"
                                                       size="sm"
                                                       variant={selectedDepositPreset === 1 ? "default" : "outline"}
                                                       disabled={!canPickDepositPreset}
                                                       onClick={() => onSelectDepositPreset(1)}
                                                  >
                                                       1 tháng
                                                  </Button>
                                                  <Button
                                                       type="button"
                                                       size="sm"
                                                       variant={selectedDepositPreset === 2 ? "default" : "outline"}
                                                       disabled={!canPickDepositPreset}
                                                       onClick={() => onSelectDepositPreset(2)}
                                                  >
                                                       2 tháng
                                                  </Button>
                                             </div>
                                        </div>
                                   ) : null}
                              </div>

                              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                   <p className="text-xs text-muted-foreground">Địa chỉ hành chính</p>
                                   <ApartmentAddressFields
                                        initialCodes={{ provinceCode: initialProvinceCode, wardCode: form.wardCode }}
                                        onChange={({ wardCode }: { wardCode?: number }) => setField("wardCode", wardCode)}
                                   />
                              </div>

                              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                   <p className="text-xs text-muted-foreground">Số nhà, đường</p>
                                   <Input value={form.streetAddress || ""} onChange={(e) => setField("streetAddress", e.target.value || undefined)} />
                              </div>

                              <div className="space-y-1 md:col-span-1 xl:col-span-1">
                                   <p className="text-xs text-muted-foreground">Vĩ độ</p>
                                   <Input
                                        value={form.latitude ?? ""}
                                        onChange={(e) => setNumberField("latitude", e.target.value)}
                                        placeholder="VD: 10.7769"
                                   />
                              </div>

                              <div className="space-y-1 md:col-span-1 xl:col-span-1">
                                   <p className="text-xs text-muted-foreground">Kinh độ</p>
                                   <Input
                                        value={form.longitude ?? ""}
                                        onChange={(e) => setNumberField("longitude", e.target.value)}
                                        placeholder="VD: 106.7009"
                                   />
                              </div>

                              <div className="space-y-2 md:col-span-2 xl:col-span-3">
                                   <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs text-muted-foreground">Bản đồ chọn tọa độ</p>
                                        <p className="text-[11px] text-muted-foreground">
                                             Nhấp vào bản đồ hoặc kéo ghim để chỉnh vị trí.
                                        </p>
                                   </div>
                                   <ApartmentCoordinateMap
                                        latitude={form.latitude}
                                        longitude={form.longitude}
                                        disabled={!onPickCoordinate}
                                        onPickCoordinate={(value) => onPickCoordinate?.(value)}
                                   />
                                   {geocodeStatusText ? (
                                        <p className={isGeocodeErrorStatus ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                                             {geocodeStatusText}
                                        </p>
                                   ) : null}
                              </div>

                              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                   <p className="text-xs text-muted-foreground">Địa chỉ đầy đủ</p>
                                   <Input value={fullAddress || "-"} disabled />
                              </div>
                         </>
                    ) : (
                         detailItems.map((item) => <DetailItem key={item.label} label={item.label} value={item.value} icon={item.icon} />)
                    )}
               </div>
          </SectionCard>
     )
}
