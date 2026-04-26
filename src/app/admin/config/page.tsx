"use client"

import { useMemo, useState } from "react"
import { vi } from "date-fns/locale"
import { AlertCircle, CalendarIcon, Plus, Trash2 } from "lucide-react"
import { message, Modal } from "antd"

import { useApartments } from "@/hooks/query/useApartments"
import {
     useApartmentPolicies,
     useCreateApartmentPolicy,
     useDeleteApartmentPolicy,
     useSaveCommissionPhases,
     useUpdateApartmentPolicy,
} from "@/hooks/query/useSystemConfig"
import { systemConfigService } from "@/lib/services/system-config.service"
import type { ApartmentItem } from "@/types/apartment"
import type {
     ApartmentPolicyCreateRequest,
     ApartmentPolicyUpdateRequest,
     CommissionPhaseInput,
} from "@/types/system-config"
import { formatDateTime } from "@/utils/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

const ALL_VALUE = "__all__"

type CommissionStepFormRow = {
     id: string
     phaseName: string
     effectiveFrom: string
     effectiveTo: string
     commissionRate: string
}

type ApartmentPolicyFormState = {
     apartmentId: string
     policyId: string
     isRequired: string
     effectiveDate: string
     expiryDate: string
     notes: string
}

const createCommissionStepRow = (): CommissionStepFormRow => ({
     id: crypto.randomUUID(),
     phaseName: "",
     effectiveFrom: "",
     effectiveTo: "",
     commissionRate: "",
})

const createApartmentPolicyForm = (): ApartmentPolicyFormState => ({
     apartmentId: "",
     policyId: "",
     isRequired: "true",
     effectiveDate: "",
     expiryDate: "",
     notes: "",
})

const parseDateValue = (value: string) => {
     if (!value) return undefined
     const date = new Date(`${value}T00:00:00`)
     return Number.isNaN(date.getTime()) ? undefined : date
}

const toDateValue = (date: Date) => {
     const year = date.getFullYear()
     const month = String(date.getMonth() + 1).padStart(2, "0")
     const day = String(date.getDate()).padStart(2, "0")
     return `${year}-${month}-${day}`
}

const toDisplayDate = (value: string) =>
     parseDateValue(value)?.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
     }) || "Chọn ngày"

const toLocalDateInput = (value?: string | null) => {
     if (!value) return ""
     const date = new Date(value)
     if (Number.isNaN(date.getTime())) return ""
     const offset = date.getTimezoneOffset()
     return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

const toStartOfDayIso = (value: string) => {
     if (!value) return undefined
     const date = new Date(`${value}T00:00:00`)
     return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

const toEndOfDayIso = (value: string) => {
     if (!value) return undefined
     const date = new Date(`${value}T23:59:59.999`)
     return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

const getRequiredBadgeClass = (isRequired?: boolean) =>
     isRequired
          ? "border-emerald-200 bg-emerald-100 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-700"

function ShadcnDateField({
     label,
     value,
     onChange,
}: {
     label: string
     value: string
     onChange: (value: string) => void
}) {
     return (
          <div className="space-y-1">
               <p className="text-xs text-muted-foreground">{label}</p>
               <Popover>
                    <PopoverTrigger asChild>
                         <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 size-4" />
                              {toDisplayDate(value)}
                         </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                              mode="single"
                              locale={vi}
                              selected={parseDateValue(value)}
                              onSelect={(date) => {
                                   if (!date) return
                                   const normalized = new Date(date)
                                   normalized.setHours(0, 0, 0, 0)
                                   onChange(toDateValue(normalized))
                              }}
                              initialFocus
                         />
                    </PopoverContent>
               </Popover>
          </div>
     )
}

export default function AdminSystemConfigPage() {
     const [commissionRows, setCommissionRows] = useState<CommissionStepFormRow[]>([createCommissionStepRow()])
     const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
     const [savedCommissionSteps, setSavedCommissionSteps] = useState<CommissionPhaseInput[]>([])

     const [policyApartmentFilter, setPolicyApartmentFilter] = useState(ALL_VALUE)
     const [policyRequiredFilter, setPolicyRequiredFilter] = useState(ALL_VALUE)
     const [policyIdFilter, setPolicyIdFilter] = useState("")
     const [openPolicyDialog, setOpenPolicyDialog] = useState(false)
     const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null)
     const [policyForm, setPolicyForm] = useState<ApartmentPolicyFormState>(createApartmentPolicyForm())
     const [policyDetailLoading, setPolicyDetailLoading] = useState(false)
     const [selectedPolicyPreview, setSelectedPolicyPreview] = useState<{ title: string; policyType: string; version: string } | null>(null)

     const commissionMutation = useSaveCommissionPhases()
     const createPolicyMutation = useCreateApartmentPolicy()
     const updatePolicyMutation = useUpdateApartmentPolicy()
     const deletePolicyMutation = useDeleteApartmentPolicy()

     const { data: apartmentResponse, isLoading: apartmentsLoading } = useApartments({ page: 1, limit: 100 })
     const apartments = useMemo(() => ((apartmentResponse?.data ?? []) as ApartmentItem[]), [apartmentResponse?.data])

     const apartmentMap = useMemo(
          () => new Map(apartments.map((apartment) => [apartment.id, apartment])),
          [apartments],
     )

     const policyQuery = useMemo(
          () => ({
               apartmentId: policyApartmentFilter === ALL_VALUE ? undefined : policyApartmentFilter,
               policyId: policyIdFilter.trim() || undefined,
               isRequired:
                    policyRequiredFilter === ALL_VALUE
                         ? undefined
                         : policyRequiredFilter === "true",
          }),
          [policyApartmentFilter, policyIdFilter, policyRequiredFilter],
     )

     const { data: policyListResponse, isLoading: policiesLoading, isError: policiesError, refetch: refetchPolicies } =
          useApartmentPolicies(policyQuery)
     const policyItems = policyListResponse?.data ?? []

     const updateCommissionRow = (id: string, field: keyof CommissionStepFormRow, value: string) => {
          setCommissionRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
     }

     const openCreatePolicyDialog = () => {
          setEditingPolicyId(null)
          setSelectedPolicyPreview(null)
          setPolicyForm(createApartmentPolicyForm())
          setOpenPolicyDialog(true)
     }

     const openEditPolicyDialog = async (id: string) => {
          setEditingPolicyId(id)
          setPolicyDetailLoading(true)
          setSelectedPolicyPreview(null)
          setPolicyForm(createApartmentPolicyForm())
          setOpenPolicyDialog(true)

          try {
               const response = await systemConfigService.getApartmentPolicyById(id)
               const detail = response.data

               if (!detail) {
                    message.error("Không tải được chi tiết policy của căn hộ.")
                    return
               }

               setSelectedPolicyPreview({
                    title: detail.policy.title,
                    policyType: detail.policy.policyType,
                    version: detail.policy.version,
               })
               setPolicyForm({
                    apartmentId: detail.apartmentId,
                    policyId: detail.policyId,
                    isRequired: detail.isRequired ? "true" : "false",
                    effectiveDate: toLocalDateInput(detail.effectiveDate),
                    expiryDate: toLocalDateInput(detail.expiryDate),
                    notes: detail.notes || "",
               })
          } catch (error) {
               message.error((error as Error)?.message || "Không tải được chi tiết policy của căn hộ.")
          } finally {
               setPolicyDetailLoading(false)
          }
     }

     const closePolicyDialog = () => {
          setOpenPolicyDialog(false)
          setEditingPolicyId(null)
          setPolicyDetailLoading(false)
          setSelectedPolicyPreview(null)
          setPolicyForm(createApartmentPolicyForm())
     }

     const updatePolicyFormField = <K extends keyof ApartmentPolicyFormState>(field: K, value: ApartmentPolicyFormState[K]) => {
          setPolicyForm((prev) => ({ ...prev, [field]: value }))
     }

     const handleSaveCommissionSteps = async () => {
          const normalizedRows = commissionRows.filter(
               (row) => row.phaseName.trim() || row.effectiveFrom || row.effectiveTo || row.commissionRate.trim(),
          )

          if (normalizedRows.length === 0) {
               message.error("Vui lòng nhập ít nhất một giai đoạn áp dụng.")
               return
          }

          const phases: CommissionPhaseInput[] = []

          for (const row of normalizedRows) {
               const effectiveFrom = toStartOfDayIso(row.effectiveFrom)
               const effectiveTo = toEndOfDayIso(row.effectiveTo)
               const commissionRate = Number(row.commissionRate)

               if (!row.phaseName.trim() || !effectiveFrom || !Number.isFinite(commissionRate)) {
                    message.error("Mỗi giai đoạn cần có tên, ngày bắt đầu và tỷ lệ hợp lệ.")
                    return
               }

               if (effectiveTo && new Date(effectiveTo).getTime() <= new Date(effectiveFrom).getTime()) {
                    message.error("Ngày kết thúc phải sau ngày bắt đầu ở từng giai đoạn áp dụng.")
                    return
               }

               phases.push({
                    phaseName: row.phaseName.trim(),
                    effectiveFrom,
                    effectiveTo: effectiveTo || null,
                    commissionRate,
               })
          }

          try {
               const response = await commissionMutation.mutateAsync(phases)
               setSavedCommissionSteps(response.data?.phases ?? phases)
               setLastSavedAt(response.data?.updatedAt ?? new Date().toISOString())
          } catch {
               // handled in mutation
          }
     }

     const handleSubmitApartmentPolicy = async () => {
          if (!policyForm.apartmentId || !policyForm.policyId.trim()) {
               message.error("Vui lòng chọn căn hộ và nhập policy ID.")
               return
          }

          if (!policyForm.effectiveDate) {
               message.error("Vui lòng chọn ngày hiệu lực.")
               return
          }

          if (
               policyForm.expiryDate &&
               parseDateValue(policyForm.expiryDate) &&
               parseDateValue(policyForm.effectiveDate) &&
               parseDateValue(policyForm.expiryDate)!.getTime() <= parseDateValue(policyForm.effectiveDate)!.getTime()
          ) {
               message.error("Ngày kết thúc phải sau ngày hiệu lực.")
               return
          }

          const createPayload: ApartmentPolicyCreateRequest = {
               apartmentId: policyForm.apartmentId,
               policyId: policyForm.policyId.trim(),
               isRequired: policyForm.isRequired === "true",
               effectiveDate: policyForm.effectiveDate,
               expiryDate: policyForm.expiryDate || undefined,
               notes: policyForm.notes.trim() || undefined,
          }

          const updatePayload: ApartmentPolicyUpdateRequest = {
               isRequired: policyForm.isRequired === "true",
               effectiveDate: policyForm.effectiveDate || undefined,
               expiryDate: policyForm.expiryDate || undefined,
               notes: policyForm.notes.trim() || undefined,
          }

          try {
               if (editingPolicyId) {
                    await updatePolicyMutation.mutateAsync({ id: editingPolicyId, payload: updatePayload })
               } else {
                    await createPolicyMutation.mutateAsync(createPayload)
               }
               closePolicyDialog()
          } catch {
               // handled in mutation
          }
     }

     const handleDeleteApartmentPolicy = (id: string) => {
          Modal.confirm({
               title: "Xóa policy khỏi căn hộ",
               content: "Bạn có chắc muốn xóa bản ghi policy này khỏi căn hộ không?",
               okText: "Xóa",
               cancelText: "Hủy",
               async onOk() {
                    await deletePolicyMutation.mutateAsync(id)
               },
          })
     }

     return (
          <div className="@container/main flex flex-1 flex-col gap-2">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                         <div className="rounded-2xl border border-border/70 bg-linear-to-r from-violet-500/10 via-background to-cyan-500/10 p-5">
                              <h1 className="text-xl font-semibold tracking-tight">Cấu hình hệ thống</h1>
                              <p className="mt-1 text-sm text-muted-foreground">
                                   Quản lý tỷ lệ hoa hồng hợp tác căn hộ và các policy đang áp dụng cho căn hộ trong hệ thống.
                              </p>
                         </div>
                    </div>

                    <div className="px-4 lg:px-6">
                         <Card className="border-border/70">
                              <CardHeader>
                                   <CardTitle className="text-base">Thiết lập tỷ lệ hoa hồng hợp tác</CardTitle>
                                   <CardDescription>
                                        Thiết lập các giai đoạn áp dụng để hệ thống tự tính phần trăm doanh thu nhận được khi căn hộ tham gia hợp tác.
                                   </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   {commissionRows.map((row, index) => (
                                        <div key={row.id} className="grid gap-3 rounded-xl border p-4 md:grid-cols-12">
                                             <div className="md:col-span-3">
                                                  <p className="mb-1 text-xs text-muted-foreground">Tên giai đoạn</p>
                                                  <Input
                                                       value={row.phaseName}
                                                       onChange={(event) => updateCommissionRow(row.id, "phaseName", event.target.value)}
                                                       placeholder={`Ví dụ: Giai đoạn ${index + 1}`}
                                                  />
                                             </div>

                                             <div className="md:col-span-3">
                                                  <ShadcnDateField
                                                       label="Ngày bắt đầu"
                                                       value={row.effectiveFrom}
                                                       onChange={(value) => updateCommissionRow(row.id, "effectiveFrom", value)}
                                                  />
                                             </div>

                                             <div className="md:col-span-3">
                                                  <ShadcnDateField
                                                       label="Ngày kết thúc"
                                                       value={row.effectiveTo}
                                                       onChange={(value) => updateCommissionRow(row.id, "effectiveTo", value)}
                                                  />
                                             </div>

                                             <div className="md:col-span-2">
                                                  <p className="mb-1 text-xs text-muted-foreground">Tỷ lệ hệ thống nhận (%)</p>
                                                  <Input
                                                       type="number"
                                                       min={0}
                                                       max={100}
                                                       value={row.commissionRate}
                                                       onChange={(event) => updateCommissionRow(row.id, "commissionRate", event.target.value)}
                                                       placeholder="10"
                                                  />
                                             </div>

                                             <div className="flex items-end md:col-span-1">
                                                  <Button
                                                       type="button"
                                                       variant="outline"
                                                       size="icon"
                                                       onClick={() =>
                                                            setCommissionRows((prev) =>
                                                                 prev.length > 1 ? prev.filter((item) => item.id !== row.id) : prev,
                                                            )
                                                       }
                                                       disabled={commissionRows.length === 1}
                                                  >
                                                       <Trash2 className="size-4" />
                                                  </Button>
                                             </div>
                                        </div>
                                   ))}

                                   <div className="flex flex-wrap gap-2">
                                        <Button type="button" variant="outline" onClick={() => setCommissionRows((prev) => [...prev, createCommissionStepRow()])}>
                                             <Plus className="mr-1 size-4" />
                                             Thêm giai đoạn
                                        </Button>
                                        <Button onClick={handleSaveCommissionSteps} disabled={commissionMutation.isPending}>
                                             {commissionMutation.isPending ? "Đang cập nhật..." : "Lưu cấu hình"}
                                        </Button>
                                   </div>

                                   {lastSavedAt ? (
                                        <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                                             <p className="font-medium">Cấu hình vừa lưu</p>
                                             <p className="mt-1 text-muted-foreground">Cập nhật lúc: {formatDateTime(lastSavedAt)}</p>
                                             <div className="mt-3 space-y-2">
                                                  {savedCommissionSteps.map((step, index) => (
                                                       <div key={`${step.phaseName}-${index}`} className="rounded-lg border bg-background px-3 py-2">
                                                            <p className="font-medium">{step.phaseName}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                 {formatDateTime(step.effectiveFrom)} - {step.effectiveTo ? formatDateTime(step.effectiveTo) : "Không giới hạn"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">Tỷ lệ hệ thống nhận: {step.commissionRate}%</p>
                                                       </div>
                                                  ))}
                                             </div>
                                        </div>
                                   ) : null}
                              </CardContent>
                         </Card>
                    </div>

                    <div className="px-4 lg:px-6">
                         <Card className="border-border/70">
                              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                        <CardTitle className="text-base">Quản lý policy áp dụng cho căn hộ</CardTitle>
                                        <CardDescription>
                                             Theo dõi, thêm mới, chỉnh sửa hoặc gỡ policy đang gán cho từng căn hộ.
                                        </CardDescription>
                                   </div>
                                   <Button onClick={openCreatePolicyDialog}>Thêm policy cho căn hộ</Button>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   <div className="grid gap-3 md:grid-cols-4">
                                        <div className="space-y-1">
                                             <p className="text-xs text-muted-foreground">Căn hộ</p>
                                             <Select value={policyApartmentFilter} onValueChange={setPolicyApartmentFilter}>
                                                  <SelectTrigger>
                                                       <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                       <SelectItem value={ALL_VALUE}>Tất cả căn hộ</SelectItem>
                                                       {apartments.map((apartment) => (
                                                            <SelectItem key={apartment.id} value={apartment.id}>
                                                                 {apartment.apartmentNumber} {apartment.buildingName ? `- ${apartment.buildingName}` : ""}
                                                            </SelectItem>
                                                       ))}
                                                  </SelectContent>
                                             </Select>
                                        </div>

                                        <div className="space-y-1">
                                             <p className="text-xs text-muted-foreground">Policy ID</p>
                                             <Input
                                                  value={policyIdFilter}
                                                  onChange={(event) => setPolicyIdFilter(event.target.value)}
                                                  placeholder="Nhập policyId"
                                             />
                                        </div>

                                        <div className="space-y-1">
                                             <p className="text-xs text-muted-foreground">Mức áp dụng</p>
                                             <Select value={policyRequiredFilter} onValueChange={setPolicyRequiredFilter}>
                                                  <SelectTrigger>
                                                       <SelectValue />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                       <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                                                       <SelectItem value="true">Bắt buộc</SelectItem>
                                                       <SelectItem value="false">Tùy chọn</SelectItem>
                                                  </SelectContent>
                                             </Select>
                                        </div>

                                        <div className="flex items-end gap-2">
                                             <Button
                                                  variant="outline"
                                                  onClick={() => {
                                                       setPolicyApartmentFilter(ALL_VALUE)
                                                       setPolicyIdFilter("")
                                                       setPolicyRequiredFilter(ALL_VALUE)
                                                  }}
                                             >
                                                  Đặt lại
                                             </Button>
                                             <Button variant="outline" onClick={() => refetchPolicies()}>
                                                  Làm mới
                                             </Button>
                                        </div>
                                   </div>

                                   {policiesError ? (
                                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                             <AlertCircle className="h-4 w-4" />
                                             Không thể tải danh sách policy của căn hộ.
                                        </div>
                                   ) : null}

                                   <Table>
                                        <TableHeader>
                                             <TableRow>
                                                  <TableHead>Căn hộ</TableHead>
                                                  <TableHead>Policy ID</TableHead>
                                                  <TableHead>Mức áp dụng</TableHead>
                                                  <TableHead>Ngày hiệu lực</TableHead>
                                                  <TableHead>Ngày kết thúc</TableHead>
                                                  <TableHead>Tạo lúc</TableHead>
                                                  <TableHead className="text-right">Thao tác</TableHead>
                                             </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {policiesLoading || apartmentsLoading ? (
                                                  Array.from({ length: 6 }).map((_, index) => (
                                                       <TableRow key={index}>
                                                            <TableCell colSpan={7}>
                                                                 <Skeleton className="h-8 w-full" />
                                                            </TableCell>
                                                       </TableRow>
                                                  ))
                                             ) : policyItems.length > 0 ? (
                                                  policyItems.map((item) => {
                                                       const apartment = apartmentMap.get(item.apartmentId)

                                                       return (
                                                            <TableRow key={item.id}>
                                                                 <TableCell>
                                                                      <div className="space-y-1">
                                                                           <p className="font-medium">{apartment?.apartmentNumber || item.apartmentId}</p>
                                                                           <p className="text-xs text-muted-foreground">{apartment?.buildingName || "-"}</p>
                                                                      </div>
                                                                 </TableCell>
                                                                 <TableCell className="font-mono text-xs">{item.policyId}</TableCell>
                                                                 <TableCell>
                                                                      <Badge className={`${getRequiredBadgeClass(item.isRequired)} border`}>
                                                                           {item.isRequired ? "Bắt buộc" : "Tùy chọn"}
                                                                      </Badge>
                                                                 </TableCell>
                                                                 <TableCell>{formatDateTime(item.effectiveDate)}</TableCell>
                                                                 <TableCell>{formatDateTime(item.expiryDate)}</TableCell>
                                                                 <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                                                                 <TableCell className="text-right">
                                                                      <div className="flex justify-end gap-2">
                                                                           <Button size="sm" variant="outline" onClick={() => openEditPolicyDialog(item.id)}>
                                                                                Sửa
                                                                           </Button>
                                                                           <Button size="sm" variant="outline" onClick={() => handleDeleteApartmentPolicy(item.id)}>
                                                                                Xóa
                                                                           </Button>
                                                                      </div>
                                                                 </TableCell>
                                                            </TableRow>
                                                       )
                                                  })
                                             ) : (
                                                  <TableRow>
                                                       <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                            Không có policy nào phù hợp với bộ lọc hiện tại.
                                                       </TableCell>
                                                  </TableRow>
                                             )}
                                        </TableBody>
                                   </Table>
                              </CardContent>
                         </Card>
                    </div>
               </div>

               <Dialog open={openPolicyDialog} onOpenChange={(open) => !open && closePolicyDialog()}>
                    <DialogContent className="sm:max-w-2xl">
                         <DialogHeader>
                              <DialogTitle>{editingPolicyId ? "Cập nhật policy cho căn hộ" : "Thêm policy cho căn hộ"}</DialogTitle>
                              <DialogDescription>
                                   {editingPolicyId
                                        ? "Điều chỉnh lại cách áp dụng policy cho căn hộ đã chọn."
                                        : "Thiết lập một policy mới cho căn hộ trong hệ thống."}
                              </DialogDescription>
                         </DialogHeader>

                         <div className="grid gap-3 py-1 md:grid-cols-2">
                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Căn hộ</p>
                                   <Select
                                        value={policyForm.apartmentId}
                                        onValueChange={(value) => updatePolicyFormField("apartmentId", value)}
                                        disabled={Boolean(editingPolicyId)}
                                   >
                                        <SelectTrigger>
                                             <SelectValue placeholder="Chọn căn hộ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                             {apartments.map((apartment) => (
                                                  <SelectItem key={apartment.id} value={apartment.id}>
                                                       {apartment.apartmentNumber} {apartment.buildingName ? `- ${apartment.buildingName}` : ""}
                                                  </SelectItem>
                                             ))}
                                        </SelectContent>
                                   </Select>
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Policy ID</p>
                                   <Input
                                        value={policyForm.policyId}
                                        onChange={(event) => updatePolicyFormField("policyId", event.target.value)}
                                        placeholder="Nhập policyId"
                                        disabled={Boolean(editingPolicyId)}
                                   />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Mức áp dụng</p>
                                   <Select value={policyForm.isRequired} onValueChange={(value) => updatePolicyFormField("isRequired", value)}>
                                        <SelectTrigger>
                                             <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="true">Bắt buộc</SelectItem>
                                             <SelectItem value="false">Tùy chọn</SelectItem>
                                        </SelectContent>
                                   </Select>
                              </div>

                              <ShadcnDateField
                                   label="Ngày hiệu lực"
                                   value={policyForm.effectiveDate}
                                   onChange={(value) => updatePolicyFormField("effectiveDate", value)}
                              />

                              <ShadcnDateField
                                   label="Ngày kết thúc"
                                   value={policyForm.expiryDate}
                                   onChange={(value) => updatePolicyFormField("expiryDate", value)}
                              />

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Thông tin policy hiện tại</p>
                                   <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                                        {editingPolicyId ? (
                                             policyDetailLoading ? (
                                                  "Đang tải chi tiết..."
                                             ) : selectedPolicyPreview ? (
                                                  <>
                                                       <p className="font-medium text-foreground">{selectedPolicyPreview.title}</p>
                                                       <p>{selectedPolicyPreview.policyType} · v{selectedPolicyPreview.version}</p>
                                                  </>
                                             ) : (
                                                  "Không có dữ liệu chi tiết."
                                             )
                                        ) : (
                                             "Hãy nhập đúng policy ID để gán cho căn hộ."
                                        )}
                                   </div>
                              </div>

                              <div className="space-y-1 md:col-span-2">
                                   <p className="text-xs text-muted-foreground">Ghi chú</p>
                                   <Textarea
                                        value={policyForm.notes}
                                        onChange={(event) => updatePolicyFormField("notes", event.target.value)}
                                        rows={4}
                                        placeholder="Nhập ghi chú nếu cần"
                                   />
                              </div>
                         </div>

                         <DialogFooter>
                              <Button variant="outline" onClick={closePolicyDialog} disabled={createPolicyMutation.isPending || updatePolicyMutation.isPending}>
                                   Hủy
                              </Button>
                              <Button onClick={handleSubmitApartmentPolicy} disabled={createPolicyMutation.isPending || updatePolicyMutation.isPending}>
                                   {createPolicyMutation.isPending || updatePolicyMutation.isPending ? "Đang lưu..." : "Lưu"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}
