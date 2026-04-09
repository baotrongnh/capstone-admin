import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
     DetailItem,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/ui/section-primitives"
import type { AmenityOption } from "@/lib/apartment/amenity-mapping"
import type {
     ApartmentOwnerOption,
     ApartmentOwnerSummary,
} from "@/types/apartment"
import { Select as AntdSelect } from "antd"
import { Building2, Hash, Info, UserCircle2 } from "lucide-react"

type ApartmentOwnerSectionProps = {
     editMode: boolean
     ownerSummary: ApartmentOwnerSummary
     ownerId?: string
     ownerOptions: ApartmentOwnerOption[]
     usersLoading: boolean
     onOwnerChange: (ownerId?: string) => void
}

export function ApartmentOwnerSection({
     editMode,
     ownerSummary,
     ownerId,
     ownerOptions,
     usersLoading,
     onOwnerChange,
}: ApartmentOwnerSectionProps) {
     const currentOwnerId = ownerId || ownerSummary.id || undefined

     return (
          <SectionCard>
               <SectionTitle
                    title="Chủ sở hữu"
                    description="Thông tin owner và tìm kiếm nhanh"
                    icon={UserCircle2}
               />

               {editMode ? (
                    <div className="space-y-3">
                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Owner</p>
                              <AntdSelect
                                   showSearch
                                   allowClear
                                   loading={usersLoading}
                                   value={ownerId}
                                   placeholder="Tìm theo tên hoặc email"
                                   onChange={(value) => onOwnerChange(value || undefined)}
                                   optionFilterProp="label"
                                   options={ownerOptions.map((user) => ({
                                        label: `${user.fullName} - ${user.email}`,
                                        value: user.id,
                                   }))}
                                   className="w-full"
                              />
                         </div>

                         <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                              <DetailItem label="Owner ID" value={currentOwnerId || "-"} icon={Hash} />
                              <DetailItem label="Họ tên" value={ownerSummary.fullName || "-"} icon={UserCircle2} />
                              <DetailItem label="Công ty" value={ownerSummary.companyName || "-"} icon={Building2} />
                         </div>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                         <DetailItem label="Owner ID" value={ownerSummary.id} icon={Hash} />
                         <DetailItem label="Họ tên" value={ownerSummary.fullName} icon={UserCircle2} />
                         <DetailItem label="Công ty" value={ownerSummary.companyName} icon={Building2} />
                    </div>
               )}
          </SectionCard>
     )
}

type ApartmentAmenitySectionProps = {
     editMode: boolean
     description?: string
     amenityIds: string[]
     options: AmenityOption[]
     amenitiesLoading?: boolean
     onDescriptionChange: (value?: string) => void
     onAmenitiesChange: (value: string[]) => void
}

export function ApartmentAmenitySection({
     editMode,
     description,
     amenityIds,
     options,
     amenitiesLoading = false,
     onDescriptionChange,
     onAmenitiesChange,
}: ApartmentAmenitySectionProps) {
     const optionLabelMap = new Map(options.map((item) => [item.value, item.label]))

     return (
          <SectionCard>
               <SectionTitle
                    title="Mô tả căn hộ và tiện ích"
                    description="Nhập mô tả và chọn tiện ích có tìm kiếm"
                    icon={Info}
               />

               {editMode ? (
                    <div className="space-y-3">
                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Mô tả</p>
                              <Textarea value={description || ""} onChange={(e) => onDescriptionChange(e.target.value || undefined)} />
                         </div>

                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Tiện ích</p>
                              <AntdSelect
                                   mode="multiple"
                                   showSearch
                                   loading={amenitiesLoading}
                                   value={amenityIds}
                                   onChange={(value) => onAmenitiesChange(value as string[])}
                                   placeholder="Tìm và chọn tiện ích"
                                   options={options}
                                   className="w-full"
                              />
                         </div>
                    </div>
               ) : (
                    <div className="space-y-3">
                         <div>
                              <p className="text-xs text-muted-foreground mb-1">Mô tả</p>
                              <p className="text-sm">{description || "-"}</p>
                         </div>
                         <div>
                              <p className="text-xs text-muted-foreground mb-1">Tiện ích</p>
                              <div className="flex flex-wrap gap-2">
                                   {amenityIds.length > 0 ? (
                                        amenityIds.map((id) => (
                                             <Badge key={id} variant="outline">
                                                  {optionLabelMap.get(id) || id}
                                             </Badge>
                                        ))
                                   ) : (
                                        <p className="text-sm text-muted-foreground">-</p>
                                   )}
                              </div>
                         </div>
                    </div>
               )}
          </SectionCard>
     )
}
