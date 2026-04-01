import {
     DetailItem,
     EditableTagList,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/apartment-shared/section-primitives"
import { Input } from "@/components/ui/input"
import type { ApartmentDetailResponse } from "@/types/apartment"
import { formatDateTime } from "@/types/apartment-modal"
import { Select as AntdSelect } from "antd"
import { Home, Users } from "lucide-react"

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
