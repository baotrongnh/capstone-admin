import {
     SectionCard,
     SectionTitle
} from "@/components/apartment/ui/section-primitives"
import type { ApartmentTenants } from "@/types/apartment"
import { formatDateTime } from "@/utils/format"
import { Users } from "lucide-react"
import { memo } from "react"

type ApartmentTenantSectionProps = {
     tenants: ApartmentTenants
}

export type ApartmentTenantSectionModel = {
     tenants: ApartmentTenants
}

type ApartmentTenantSectionModelProps = {
     model: ApartmentTenantSectionModel
}

export const ApartmentTenantSection = memo(function ApartmentTenantSection(props: ApartmentTenantSectionProps | ApartmentTenantSectionModelProps) {
     const tenants = "model" in props ? props.model.tenants : props.tenants

     return (
          <SectionCard>
               <SectionTitle
                    title="Người thuê"
                    description="Danh sách người thuê hiện tại của căn hộ"
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
                                        Ngày dọn vào: {formatDateTime(tenant.moveInDate)} | Ngày hết hạn: {formatDateTime(tenant.moveOutDate)}
                                   </p>
                              </div>
                         ))}
                    </div>
               ) : (
                    <p className="text-sm text-muted-foreground">Không có thông tin người thuê.</p>
               )}
          </SectionCard>
     )
})

