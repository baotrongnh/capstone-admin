import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
     DetailItem,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/apartment-shared/section-primitives"
import { Select as AntdSelect } from "antd"
import { Building2, Hash, Info, UserCircle2 } from "lucide-react"

type OwnerOption = {
     id: string
     fullName: string
     email: string
}

type ApartmentOwnerSectionProps = {
     editMode: boolean
     ownerOptions: OwnerOption[]
     ownerId?: string
     ownerName: string
     ownerCompany: string
     usersLoading: boolean
     detailOwnerId?: string | null
     detailOwnerName?: string | null
     detailOwnerCompany?: string | null
     onOwnerChange: (ownerId?: string) => void
}

export function ApartmentOwnerSection({
     editMode,
     ownerOptions,
     ownerId,
     ownerName,
     ownerCompany,
     usersLoading,
     detailOwnerId,
     detailOwnerName,
     detailOwnerCompany,
     onOwnerChange,
}: ApartmentOwnerSectionProps) {
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
                              <DetailItem label="Owner ID" value={ownerId || "-"} icon={Hash} />
                              <DetailItem label="Họ tên" value={ownerName} icon={UserCircle2} />
                              <DetailItem label="Công ty" value={ownerCompany} icon={Building2} />
                         </div>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                         <DetailItem label="Owner ID" value={detailOwnerId} icon={Hash} />
                         <DetailItem label="Họ tên" value={detailOwnerName} icon={UserCircle2} />
                         <DetailItem label="Công ty" value={detailOwnerCompany} icon={Building2} />
                    </div>
               )}
          </SectionCard>
     )
}

type ApartmentAmenitySectionProps = {
     editMode: boolean
     description?: string
     amenities: string[]
     presetOptions: string[]
     onDescriptionChange: (value?: string) => void
     onAmenitiesChange: (value: string[]) => void
}

export function ApartmentAmenitySection({
     editMode,
     description,
     amenities,
     presetOptions,
     onDescriptionChange,
     onAmenitiesChange,
}: ApartmentAmenitySectionProps) {
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
                                   mode="tags"
                                   showSearch
                                   value={amenities}
                                   onChange={(value) => onAmenitiesChange(value)}
                                   placeholder="Tìm hoặc nhập tiện ích"
                                   options={presetOptions.map((item) => ({ label: item, value: item }))}
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
                                   {amenities.length > 0 ? (
                                        amenities.map((item) => (
                                             <Badge key={item} variant="outline">
                                                  {item}
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
