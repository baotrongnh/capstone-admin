import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { ApartmentAddressFields } from "@/components/apartment/ui/address-fields"
import { ApartmentCoordinateMap } from "@/components/apartment/sections/apartment-coordinate-map"
import {
  DetailItem,
  SectionCard,
  SectionTitle,
} from "@/components/apartment/ui/section-primitives";
import type { DepositPreset } from "@/hooks/apartment/use-apartment-editor-state";
import type {
     ApartmentFieldErrors,
     ApartmentValidationField,
} from "@/lib/apartment/apartment-validation"
import type { ApartmentStatus } from "@/types/apartment"
import type { ApartmentForm } from "@/types/apartment-form"
import type { GeocodeStatus } from "@/types/apartment"
import { formatVNDInput } from "@/utils/format"
import { ReactNode } from "react"
import { Info, type LucideIcon } from "lucide-react"

type DetailEntry = {
     group?: string
     label: string
     value?: string | number | null
     icon?: LucideIcon
}

export type ApartmentDetailsSectionModel = {
     editMode: boolean
     form: ApartmentForm
     fieldErrors?: ApartmentFieldErrors
     detailItems: DetailEntry[]
     fullAddress: string
     availableYears: number[]
     usableAreaInvalid: boolean
     initialStatus?: ApartmentStatus | null
     initialProvinceCode?: number
     selectedDepositPreset?: DepositPreset | null
     geocodeStatus?: GeocodeStatus
     geocodeErrorMessage?: string | null
}

export type ApartmentDetailsSectionActions = {
     setField: (field: string, value: unknown) => void
     setNumberField: (field: string, raw: string) => void
     setCurrencyField: (field: string, raw: string) => void
     onSelectDepositPreset?: (value: DepositPreset) => void
     onPickCoordinate?: (value: { latitude: number; longitude: number }) => void
}

type ApartmentDetailsSectionProps = {
     model: ApartmentDetailsSectionModel
     actions: ApartmentDetailsSectionActions
}

const getGeocodeStatusText = (status: GeocodeStatus, errorMessage?: string | null) => {
     if (status === "loading") {
          return "Đang tự động lấy tọa độ từ địa chỉ..."
     }

  if (status === "success") {
    return "Đã cập nhật tọa độ tự động theo địa chỉ.";
  }

  if (status === "not_found") {
    return "Không tìm thấy tọa độ từ địa chỉ hiện tại. Bạn có thể chọn trực tiếp trên bản đồ.";
  }

  if (status === "error") {
    return (
      errorMessage ||
      "Không thể tự động lấy tọa độ. Vui lòng thử lại hoặc chọn trên bản đồ."
    );
  }

  return null;
};

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
     return (
          <p className="text-xs text-muted-foreground">
               {label}
               {required ? <span className="ml-1 text-destructive">*</span> : null}
          </p>
     )
}

function FieldBlock({
     label,
     required = false,
     error,
     className,
     children,
}: {
     label: string
     required?: boolean
     error?: string
     className?: string
     children: ReactNode
}) {
     return (
          <div className={className ? `space-y-1 ${className}` : "space-y-1"}>
               <FieldLabel label={label} required={required} />
               {children}
               {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
     )
}

export function ApartmentDetailsSection({ model, actions }: ApartmentDetailsSectionProps) {
     const {
          editMode,
          form,
          fieldErrors,
          detailItems,
          fullAddress,
          availableYears,
          usableAreaInvalid,
          initialStatus,
          initialProvinceCode,
          selectedDepositPreset,
          geocodeStatus = "idle",
          geocodeErrorMessage,
     } = model

     const {
          setField,
          setNumberField,
          setCurrencyField,
          onSelectDepositPreset,
          onPickCoordinate,
     } = actions

     const baseRentPrice = form.baseRentPrice || 0
     const canPickDepositPreset = baseRentPrice > 0
     const cannotSwitchToAvailable =
          editMode && (initialStatus === "occupied" || initialStatus === "reserved")

  const getFieldError = (field: ApartmentValidationField) =>
    fieldErrors?.[field];

  const geocodeStatusText = getGeocodeStatusText(
    geocodeStatus,
    geocodeErrorMessage,
  );
  const isGeocodeErrorStatus =
    geocodeStatus === "error" || geocodeStatus === "not_found";

  console.log("Vĩ độ:", form.latitude, "Kinh độ:", form.longitude);
  return (
    <SectionCard className="bg-muted/20">
      <SectionTitle
        title="Thông tin cơ bản"
        description="Các thông tin cơ bản của căn hộ"
        icon={Info}
      />

               {editMode ? (
                    <p className="mb-3 text-xs text-muted-foreground flex justify-end gap-1">
                         Trường có dấu <span className="text-destructive">*</span> là bắt buộc.
                    </p>
               ) : null}

               <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {editMode ? (
                         <>
                              <FieldBlock label="Tên tòa nhà" required error={getFieldError("buildingName")}>
                                   <Input value={form.buildingName || ""} onChange={(e) => setField("buildingName", e.target.value || undefined)} />
                              </FieldBlock>

                              <FieldBlock label="Mã căn hộ" required error={getFieldError("apartmentNumber")}>
                                   <Input
                                        value={form.apartmentNumber || ""}
                                        onChange={(e) => setField("apartmentNumber", e.target.value || undefined)}
                                        aria-invalid={getFieldError("apartmentNumber") ? true : undefined}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Tầng">
                                   <Input value={form.floorNumber ?? ""} onChange={(e) => setNumberField("floorNumber", e.target.value)} />
                              </FieldBlock>

                              <FieldBlock label="Trạng thái" required error={getFieldError("status")}>
                                   <Select value={form.status || "available"} onValueChange={(value) => setField("status", value)}>
                                        <SelectTrigger className="w-full" aria-invalid={getFieldError("status") ? true : undefined}>
                                             <SelectValue placeholder="Chọn trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="available" disabled={cannotSwitchToAvailable}>Còn trống</SelectItem>
                                             <SelectItem value="occupied">Đang cho thuê</SelectItem>
                                             {/* <SelectItem value="maintenance">Bảo trì</SelectItem> */}
                                             <SelectItem value="reserved">Đã đặt cọc</SelectItem>
                                             <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                                        </SelectContent>
                                   </Select>
                                   {cannotSwitchToAvailable ? (
                                        <p className="text-xs text-muted-foreground">
                                             Căn hộ đang cho thuê/đã đặt cọc không thể chuyển về trạng thái còn trống.
                                        </p>
                                   ) : null}
                              </FieldBlock>

                              <FieldBlock label="Nội thất" required error={getFieldError("furnishingStatus")}>
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
                              </FieldBlock>

                              <FieldBlock label="Năm xây dựng">
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
                              </FieldBlock>

                              <FieldBlock label="Diện tích tổng (m²)" required error={getFieldError("totalArea")}>
                                   <Input
                                        value={form.totalArea ?? ""}
                                        onChange={(e) => setNumberField("totalArea", e.target.value)}
                                        aria-invalid={getFieldError("totalArea") ? true : undefined}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Diện tích sử dụng (m²)">
                                   <Input value={form.usableArea ?? ""} onChange={(e) => setNumberField("usableArea", e.target.value)} />
                                   {usableAreaInvalid ? (
                                        <p className="text-xs text-destructive">Diện tích sử dụng không được lớn hơn diện tích tổng.</p>
                                   ) : null}
                              </FieldBlock>

                              <FieldBlock label="Số phòng ngủ" error={getFieldError("numberOfBedrooms")}>
                                   <Input
                                        value={form.numberOfBedrooms ?? ""}
                                        onChange={(e) => setNumberField("numberOfBedrooms", e.target.value)}
                                        aria-invalid={getFieldError("numberOfBedrooms") ? true : undefined}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Số phòng tắm" error={getFieldError("numberOfBathrooms")}>
                                   <Input
                                        value={form.numberOfBathrooms ?? ""}
                                        onChange={(e) => setNumberField("numberOfBathrooms", e.target.value)}
                                        aria-invalid={getFieldError("numberOfBathrooms") ? true : undefined}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Số người ở tối đa" required error={getFieldError("maxOccupants")}>
                                   <Input
                                        value={form.maxOccupants ?? ""}
                                        onChange={(e) => setNumberField("maxOccupants", e.target.value)}
                                        aria-invalid={getFieldError("maxOccupants") ? true : undefined}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Giá thuê (VNĐ)" required error={getFieldError("baseRentPrice")}>
                                   <Input
                                        value={formatVNDInput(form.baseRentPrice)}
                                        onChange={(e) => setCurrencyField("baseRentPrice", e.target.value)}
                                        aria-invalid={getFieldError("baseRentPrice") ? true : undefined}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Tiền cọc (VNĐ)" required error={getFieldError("depositAmount")}>
                                   <Input
                                        value={formatVNDInput(form.depositAmount)}
                                        onChange={(e) => setCurrencyField("depositAmount", e.target.value)}
                                        aria-invalid={getFieldError("depositAmount") ? true : undefined}
                                   />
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
                              </FieldBlock>

                              <FieldBlock label="Địa chỉ hành chính" required error={getFieldError("wardCode")} className="md:col-span-2 xl:col-span-3">
                                   <ApartmentAddressFields
                                        initialCodes={{ provinceCode: initialProvinceCode, wardCode: form.wardCode }}
                                        onChange={({ wardCode }: { wardCode?: number }) => setField("wardCode", wardCode)}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Số nhà, đường" required error={getFieldError("streetAddress")} className="md:col-span-2 xl:col-span-3">
                                   <Input
                                        value={form.streetAddress || ""}
                                        onChange={(e) => setField("streetAddress", e.target.value || undefined)}
                                        aria-invalid={getFieldError("streetAddress") ? true : undefined}
                                   />
                              </FieldBlock>

                              <FieldBlock label="Vĩ độ" className="md:col-span-1 xl:col-span-1">
                                   <Input
                                        value={form.latitude ?? ""}
                                        onChange={(e) => setNumberField("latitude", e.target.value)}
                                        placeholder="VD: 10.7769"
                                   />
                              </FieldBlock>

                              <FieldBlock label="Kinh độ" className="md:col-span-1 xl:col-span-1">
                                   <Input
                                        value={form.longitude ?? ""}
                                        onChange={(e) => setNumberField("longitude", e.target.value)}
                                        placeholder="VD: 106.7009"
                                   />
                              </FieldBlock>

                              <div className="space-y-2 md:col-span-2 xl:col-span-3">
                                   <div className="flex items-center justify-between gap-2">
                                        <FieldLabel label="Bản đồ chọn tọa độ" />
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

                              <FieldBlock label="Địa chỉ đầy đủ" className="md:col-span-2 xl:col-span-3">
                                   <Input value={fullAddress || "-"} disabled />
                              </FieldBlock>
                         </>
                    ) : (
                         <DetailViewGroups detailItems={detailItems} />
                    )}
               </div>
          </SectionCard>
     )
}

function DetailViewGroups({ detailItems }: { detailItems: DetailEntry[] }) {
     const hasGroupedData = detailItems.some((item) => !!item.group)

     if (!hasGroupedData) {
          return detailItems.map((item) => (
               <DetailItem key={item.label} label={item.label} value={item.value} icon={item.icon} />
          ))
     }

     const groupOrder = ["Thông tin căn hộ", "Thông tin địa chỉ", "Tọa độ", "Thông tin hệ thống"]
     const groupedEntries = new Map<string, DetailEntry[]>()

     detailItems.forEach((item) => {
          const groupName = item.group || "Khác"
          const current = groupedEntries.get(groupName) || []
          current.push(item)
          groupedEntries.set(groupName, current)
     })

     const orderedGroups = [
          ...groupOrder.filter((group) => groupedEntries.has(group)),
          ...Array.from(groupedEntries.keys()).filter((group) => !groupOrder.includes(group)),
     ]

     return (
          <div className="space-y-4 md:col-span-2 xl:col-span-3">
               {orderedGroups.map((groupName, index) => {
                    const entries = groupedEntries.get(groupName) || []
                    if (entries.length === 0) return null

                    return (
                         <div
                              key={groupName}
                              className={index > 0 ? "space-y-2 border-t pt-3" : "space-y-2"}
                         >
                              <p className="text-sm font-semibold">{groupName}</p>
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                   {entries.map((item) => (
                                        <DetailItem
                                             key={`${groupName}-${item.label}`}
                                             label={item.label}
                                             value={item.value}
                                             icon={item.icon}
                                        />
                                   ))}
                              </div>
                         </div>
                    )
               })}
          </div>
     )
}
