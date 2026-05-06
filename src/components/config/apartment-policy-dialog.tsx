"use client"

import { useState } from "react"
import { message } from "antd"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useApartments } from "@/hooks/query/useApartments"
import { useApartmentPolicy, useCreateApartmentPolicy, useUpdateApartmentPolicy } from "@/hooks/query/useSystemConfig"
import { ConfigDateField } from "./config-date-field"
import { toEndOfDayIso, toLocalDateInput, toStartOfDayIso } from "@/utils/date-utils"

type FormState = {
     apartmentId: string
     policyId: string
     isRequired: string
     effectiveDate: string
     expiryDate: string
     notes: string
}

const EMPTY_FORM: FormState = {
     apartmentId: "",
     policyId: "",
     isRequired: "true",
     effectiveDate: "",
     expiryDate: "",
     notes: "",
}

const getSavedForm = (detail?: ReturnType<typeof useApartmentPolicy>["data"]): FormState => ({
     apartmentId: detail?.apartmentId ?? "",
     policyId: detail?.policyId ?? "",
     isRequired: String(detail?.isRequired ?? true),
     effectiveDate: toLocalDateInput(detail?.effectiveDate),
     expiryDate: toLocalDateInput(detail?.expiryDate),
     notes: detail?.notes ?? "",
})

export function ApartmentPolicyDialog({ dialog }: { dialog: { open: boolean; editId: string | null; close: () => void } }) {
     const isEdit = Boolean(dialog.editId)

     return (
          <Dialog open={dialog.open} onOpenChange={(open) => !open && dialog.close()}>
               <DialogContent className="max-w-2xl">
                    <DialogHeader>
                         <DialogTitle>{isEdit ? "Chỉnh sửa policy căn hộ" : "Thêm policy cho căn hộ"}</DialogTitle>
                         <DialogDescription>{isEdit ? "Cập nhật thông tin gán policy." : "Gán policy cho căn hộ."}</DialogDescription>
                    </DialogHeader>

                    {dialog.open ? <ApartmentPolicyForm key={dialog.editId ?? "create"} dialog={dialog} /> : null}
               </DialogContent>
          </Dialog>
     )
}

function ApartmentPolicyForm({ dialog }: { dialog: { editId: string | null; close: () => void } }) {
     const [draft, setDraft] = useState<Partial<FormState>>({})
     const detailQuery = useApartmentPolicy(dialog.editId)
     const apartmentQuery = useApartments({ page: 1, limit: 100 })
     const createPolicy = useCreateApartmentPolicy()
     const updatePolicy = useUpdateApartmentPolicy()

     const isEdit = Boolean(dialog.editId)
     const isSaving = createPolicy.isPending || updatePolicy.isPending
     const savedForm = isEdit ? getSavedForm(detailQuery.data) : EMPTY_FORM
     const form: FormState = {
          apartmentId: draft.apartmentId ?? savedForm.apartmentId,
          policyId: draft.policyId ?? savedForm.policyId,
          isRequired: draft.isRequired ?? savedForm.isRequired,
          effectiveDate: draft.effectiveDate ?? savedForm.effectiveDate,
          expiryDate: draft.expiryDate ?? savedForm.expiryDate,
          notes: draft.notes ?? savedForm.notes,
     }

     const updateField = (field: keyof FormState, value: string) => {
          setDraft((current) => ({ ...current, [field]: value }))
     }

     const save = () => {
          if (!form.apartmentId || !form.policyId) {
               message.warning("Vui lòng chọn căn hộ và nhập Policy ID.")
               return
          }

          const payload = {
               isRequired: form.isRequired === "true",
               effectiveDate: toStartOfDayIso(form.effectiveDate),
               expiryDate: toEndOfDayIso(form.expiryDate),
               notes: form.notes.trim() || undefined,
          }

          if (isEdit && dialog.editId) {
               updatePolicy.mutate({ id: dialog.editId, payload }, { onSuccess: dialog.close })
               return
          }

          createPolicy.mutate(
               {
                    apartmentId: form.apartmentId,
                    policyId: form.policyId,
                    ...payload,
               },
               { onSuccess: dialog.close },
          )
     }

     return (
          <>
               <div className="grid gap-3 py-2 md:grid-cols-2">
                    <div className="space-y-1">
                         <p className="text-xs text-muted-foreground">Căn hộ</p>
                         <Select value={form.apartmentId} onValueChange={(value) => updateField("apartmentId", value)} disabled={isEdit}>
                              <SelectTrigger><SelectValue placeholder="Chọn căn hộ" /></SelectTrigger>
                              <SelectContent>
                                   {(apartmentQuery.data?.data ?? []).map((apartment) => (
                                        <SelectItem key={apartment.id} value={apartment.id}>
                                             {apartment.apartmentNumber}{apartment.buildingName ? ` - ${apartment.buildingName}` : ""}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                    </div>

                    <div className="space-y-1">
                         <p className="text-xs text-muted-foreground">Policy ID</p>
                         <Input value={form.policyId} onChange={(event) => updateField("policyId", event.target.value)} placeholder="Nhập policyId" disabled={isEdit} />
                    </div>

                    <div className="space-y-1">
                         <p className="text-xs text-muted-foreground">Mức áp dụng</p>
                         <Select value={form.isRequired} onValueChange={(value) => updateField("isRequired", value)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                   <SelectItem value="true">Bắt buộc</SelectItem>
                                   <SelectItem value="false">Tùy chọn</SelectItem>
                              </SelectContent>
                         </Select>
                    </div>

                    <ConfigDateField field={{ label: "Ngày hiệu lực", value: form.effectiveDate, onChange: (value) => updateField("effectiveDate", value) }} />
                    <ConfigDateField field={{ label: "Ngày kết thúc", value: form.expiryDate, onChange: (value) => updateField("expiryDate", value) }} />

                    {isEdit ? (
                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Thông tin policy</p>
                              <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                                   {detailQuery.isLoading ? "Đang tải..." : detailQuery.data?.policy ? (
                                        <>
                                             <p className="font-medium text-foreground">{detailQuery.data.policy.title}</p>
                                             <p>{detailQuery.data.policy.policyType} · v{detailQuery.data.policy.version}</p>
                                        </>
                                   ) : "Không có dữ liệu."}
                              </div>
                         </div>
                    ) : null}

                    <div className="space-y-1 md:col-span-2">
                         <p className="text-xs text-muted-foreground">Ghi chú</p>
                         <Textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} placeholder="Ghi chú" />
                    </div>
               </div>

               <DialogFooter>
                    <Button variant="outline" onClick={dialog.close} disabled={isSaving}>Hủy</Button>
                    <Button onClick={save} disabled={isSaving || detailQuery.isLoading}>{isSaving ? "Đang lưu..." : "Lưu"}</Button>
               </DialogFooter>
          </>
     )
}