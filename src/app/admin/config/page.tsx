"use client"

import { useState } from "react"

import { ApartmentPolicyDialog } from "@/components/config/apartment-policy-dialog"
import { ApartmentPolicyTable } from "@/components/config/apartment-policy-table"
import { CommissionCard } from "@/components/config/commission-card"

export default function AdminSystemConfigPage() {
     const [policyDialog, setPolicyDialog] = useState({ open: false, editId: null as string | null })
     const dialog = {
          ...policyDialog,
          create: () => setPolicyDialog({ open: true, editId: null }),
          edit: (editId: string) => setPolicyDialog({ open: true, editId }),
          close: () => setPolicyDialog((current) => ({ ...current, open: false })),
     }

     return (
          <div className="space-y-4 p-4">
               <div>
                    <h1 className="text-2xl font-bold text-foreground">Cấu hình hệ thống</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Quản lý hoa hồng hợp tác và policy căn hộ.</p>
               </div>

               <CommissionCard />
               <ApartmentPolicyTable dialog={dialog} />
               <ApartmentPolicyDialog dialog={dialog} />
          </div>
     )
}