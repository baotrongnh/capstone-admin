import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ApartmentDetailResponse } from "@/types/apartment"
import { formatDateTime } from "@/types/apartment-modal"
import { Select as AntdSelect } from "antd"
import { Building2, Hash, Home, Info, UserCircle2, Users } from "lucide-react"
import {
     DetailItem,
     EditableTagList,
     SectionCard,
     SectionTitle,
} from "./apartment-detail-shared"

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

type ApartmentRoomsSectionProps = {
     editMode: boolean
     roomTags: string[]
     roomOptions: string[]
     rooms: NonNullable<ApartmentDetailResponse["data"]>["rooms"]
     onRoomTagsChange: (value: string[]) => void
}

export function ApartmentRoomsSection({
     editMode,
     roomTags,
     roomOptions,
     rooms,
     onRoomTagsChange,
}: ApartmentRoomsSectionProps) {
     return (
          <SectionCard>
               <SectionTitle
                    title="Quản lý phòng"
                    description="Thêm nhanh phòng bằng tags giống tiện ích"
                    icon={Home}
               />

               {editMode ? (
                    <div className="space-y-2">
                         <p className="text-xs text-muted-foreground">Danh sách phòng</p>
                         <AntdSelect
                              mode="tags"
                              showSearch
                              value={roomTags}
                              onChange={(value) => onRoomTagsChange(value)}
                              placeholder="Tìm hoặc nhập phòng mới"
                              options={roomOptions.map((item) => ({ label: item, value: item }))}
                              className="w-full"
                         />
                         <EditableTagList
                              items={roomTags}
                              onRemove={(item) => onRoomTagsChange(roomTags.filter((tag) => tag !== item))}
                              emptyText="Chưa có phòng nào."
                         />
                    </div>
               ) : rooms.length > 0 ? (
                    <div className="space-y-2">
                         {rooms.map((room) => (
                              <div key={room.id} className="rounded-lg border bg-background p-3 text-sm">
                                   <p className="font-medium">
                                        {room.roomNumber} - {room.roomType}
                                   </p>
                                   <p className="text-muted-foreground">
                                        Diện tích: {room.area || "-"} m² | Trạng thái: {room.status}
                                   </p>
                                   <p className="text-muted-foreground">
                                        Cửa sổ: {room.hasWindow ? "Có" : "Không"} | Điều hòa: {room.hasAirConditioning ? "Có" : "Không"} | WC riêng: {room.hasPrivateBathroom ? "Có" : "Không"}
                                   </p>
                              </div>
                         ))}
                    </div>
               ) : (
                    <p className="text-sm text-muted-foreground">Không có thông tin phòng.</p>
               )}
          </SectionCard>
     )
}

type ApartmentTenantSectionProps = {
     tenants: NonNullable<ApartmentDetailResponse["data"]>["userApartments"]
}

export function ApartmentTenantSection({ tenants }: ApartmentTenantSectionProps) {
     return (
          <SectionCard>
               <SectionTitle
                    title="Người thuê hiện tại"
                    description="Danh sách tenant đang hoạt động"
                    icon={Users}
               />

               {tenants.length > 0 ? (
                    <div className="space-y-2">
                         {tenants.map((tenant) => (
                              <div key={tenant.id} className="rounded-lg border bg-background p-3 text-sm">
                                   <p className="font-medium">{tenant.user.fullName}</p>
                                   <p className="text-muted-foreground">User ID: {tenant.user.id}</p>
                                   <p className="text-muted-foreground">
                                        Vai trò: {tenant.isPrimaryTenant ? "Người thuê chính" : "Thành viên"} | Trạng thái: {tenant.status}
                                   </p>
                                   <p className="text-muted-foreground">
                                        Ngày vào: {formatDateTime(tenant.moveInDate)} | Ngày ra: {formatDateTime(tenant.moveOutDate)}
                                   </p>
                              </div>
                         ))}
                    </div>
               ) : (
                    <p className="text-sm text-muted-foreground">Không có thông tin người thuê.</p>
               )}
          </SectionCard>
     )
}

type ApartmentRentalSummarySectionProps = {
     editMode: boolean
     tenantCount: number
     utilityMeterCount: number
     onTenantCountChange: (value: number) => void
}

export function ApartmentRentalSummarySection({
     editMode,
     tenantCount,
     utilityMeterCount,
     onTenantCountChange,
}: ApartmentRentalSummarySectionProps) {
     return (
          <SectionCard>
               <SectionTitle
                    title="Thuê và công tơ tiện ích"
                    description="Số người thuê và số lượng đồng hồ"
                    icon={Users}
               />

               {editMode ? (
                    <div className="space-y-1 max-w-sm">
                         <p className="text-xs text-muted-foreground">Số người thuê</p>
                         <Input
                              value={tenantCount}
                              onChange={(e) => {
                                   const next = Number(e.target.value)
                                   onTenantCountChange(Number.isNaN(next) ? 0 : next)
                              }}
                              type="number"
                              min={0}
                         />
                         <p className="text-[11px] text-muted-foreground">Trường tạm để nối API sau.</p>
                    </div>
               ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                         <DetailItem label="Số người thuê" value={tenantCount} icon={Users} />
                         <DetailItem label="Đồng hồ tiện ích" value={utilityMeterCount} icon={Users} />
                    </div>
               )}
          </SectionCard>
     )
}
