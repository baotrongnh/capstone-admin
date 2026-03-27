import { Input } from "@/components/ui/input"
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import type { ApartmentForm, ApartmentStatus, FurnishingStatus } from "@/types/apartment-modal"
import { formatVNDInput } from "@/utils/format"
import { Info, type LucideIcon } from "lucide-react"
import { ApartmentAddressFields } from "./apartment-address-fields"
import { DetailItem, SectionCard, SectionTitle } from "./apartment-detail-shared"

type DetailEntry = {
     label: string
     value?: string | number | null
     icon?: LucideIcon
}

type SetField = <K extends keyof ApartmentForm>(key: K, value: ApartmentForm[K]) => void

type SetNumberField = <K extends keyof ApartmentForm>(key: K, raw: string) => void

type SetCurrencyField = <K extends keyof ApartmentForm>(key: K, raw: string) => void

type BasicInfoSectionProps = {
     editMode: boolean
     form: ApartmentForm
     detailItems: DetailEntry[]
     fullAddress: string
     availableYears: number[]
     usableAreaInvalid: boolean
     initialProvinceCode?: number
     onSetField: SetField
     onSetNumberField: SetNumberField
     onSetCurrencyField: SetCurrencyField
}

export function ApartmentBasicInfoSection({
     editMode,
     form,
     detailItems,
     fullAddress,
     availableYears,
     usableAreaInvalid,
     initialProvinceCode,
     onSetField,
     onSetNumberField,
     onSetCurrencyField,
}: BasicInfoSectionProps) {
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
                                   <Input value={form.buildingName || ""} onChange={(e) => onSetField("buildingName", e.target.value || undefined)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Mã căn hộ</p>
                                   <Input value={form.apartmentNumber || ""} onChange={(e) => onSetField("apartmentNumber", e.target.value || undefined)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tầng</p>
                                   <Input value={form.floorNumber ?? ""} onChange={(e) => onSetNumberField("floorNumber", e.target.value)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Trạng thái</p>
                                   <Select value={form.status || "available"} onValueChange={(value) => onSetField("status", value as ApartmentStatus)}>
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
                                   <p className="text-xs text-muted-foreground">Nội thất</p>
                                   <Select value={form.furnishingStatus || "unfurnished"} onValueChange={(value) => onSetField("furnishingStatus", value as FurnishingStatus)}>
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
                                   <p className="text-xs text-muted-foreground">Năm xây dựng</p>
                                   <Select
                                        value={form.yearBuilt ? String(form.yearBuilt) : "__empty__"}
                                        onValueChange={(value) => onSetField("yearBuilt", value === "__empty__" ? undefined : Number(value))}
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
                                   <Input value={form.totalArea ?? ""} onChange={(e) => onSetNumberField("totalArea", e.target.value)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Diện tích sử dụng (m²)</p>
                                   <Input value={form.usableArea ?? ""} onChange={(e) => onSetNumberField("usableArea", e.target.value)} />
                                   {usableAreaInvalid ? (
                                        <p className="text-xs text-destructive">Diện tích sử dụng không được lớn hơn diện tích tổng.</p>
                                   ) : null}
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Số phòng ngủ</p>
                                   <Input value={form.numberOfBedrooms ?? ""} onChange={(e) => onSetNumberField("numberOfBedrooms", e.target.value)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Số phòng tắm</p>
                                   <Input value={form.numberOfBathrooms ?? ""} onChange={(e) => onSetNumberField("numberOfBathrooms", e.target.value)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Giá thuê (VNĐ)</p>
                                   <Input value={formatVNDInput(form.baseRentPrice)} onChange={(e) => onSetCurrencyField("baseRentPrice", e.target.value)} />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tiền cọc (VNĐ)</p>
                                   <Input value={formatVNDInput(form.depositAmount)} onChange={(e) => onSetCurrencyField("depositAmount", e.target.value)} />
                              </div>

                              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                   <p className="text-xs text-muted-foreground">Địa chỉ hành chính</p>
                                   <ApartmentAddressFields
                                        initialCodes={{ provinceCode: initialProvinceCode, wardCode: form.wardCode }}
                                        onChange={({ wardCode }: { wardCode?: number }) => onSetField("wardCode", wardCode)}
                                   />
                              </div>

                              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                                   <p className="text-xs text-muted-foreground">Số nhà, đường</p>
                                   <Input value={form.streetAddress || ""} onChange={(e) => onSetField("streetAddress", e.target.value || undefined)} />
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
