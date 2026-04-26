"use client"

import { useState } from "react"
import { vi } from "date-fns/locale"
import { message, Modal } from "antd"
import { CalendarIcon, MoreHorizontalIcon, RefreshCcwIcon, WrenchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
     useCompleteMaintenance,
     useMaintenance,
     useMaintenances,
     useUpdateMaintenance,
} from "@/hooks/query/useMaintenance"
import {
     getMaintenanceAddress,
     getMaintenanceCategoryLabel,
     getMaintenancePriorityOption,
     getMaintenanceStatusOption,
     MAINTENANCE_PRIORITY_OPTIONS,
     MAINTENANCE_STATUS_OPTIONS,
     type MaintenanceItem,
     type MaintenancePriority,
     type MaintenanceStatus,
     type MaintenanceUpdateForm,
     type MaintenanceUpdateRequestBody,
     normalizeMaintenancePriority,
     toIsoDateTime,
     toLocalDateInput,
} from "@/types/maintenance"
import { formatDateTime } from "@/utils/format"

const TODAY = new Date(new Date().setHours(0, 0, 0, 0))
const UPDATE_STATUS_OPTIONS = MAINTENANCE_STATUS_OPTIONS.filter((option) =>
     ["scheduled", "in_progress", "completed", "cancelled"].includes(option.value),
)

const createUpdateForm = (
     item?: Partial<Pick<MaintenanceItem, "status" | "urgency" | "preferredDate">>,
): MaintenanceUpdateForm => ({
     status: UPDATE_STATUS_OPTIONS.some((option) => option.value === item?.status)
          ? (item?.status as MaintenanceStatus)
          : "scheduled",
     priority: normalizeMaintenancePriority(item?.urgency),
     scheduledDate: toLocalDateInput(item?.preferredDate),
     resolutionNotes: "",
     cost: "",
})

const parseDate = (value: string) => {
     if (!value) return undefined

     const date = new Date(`${value}T00:00:00`)
     return Number.isNaN(date.getTime()) ? undefined : date
}

const formatDateLabel = (value: string) =>
     parseDate(value)?.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
     }) || "Chọn ngày lên lịch"

const toDateValue = (date: Date) => {
     const year = date.getFullYear()
     const month = String(date.getMonth() + 1).padStart(2, "0")
     const day = String(date.getDate()).padStart(2, "0")
     return `${year}-${month}-${day}`
}

const buildUpdatePayload = (
     form: MaintenanceUpdateForm,
): { payload: MaintenanceUpdateRequestBody; invalidCost: boolean } => {
     const payload: MaintenanceUpdateRequestBody = {
          status: form.status,
          priority: form.priority,
     }

     const scheduledDate = toIsoDateTime(form.scheduledDate)
     if (scheduledDate) payload.scheduledDate = scheduledDate

     const resolutionNotes = form.resolutionNotes.trim()
     if (resolutionNotes) payload.resolutionNotes = resolutionNotes

     const rawCost = form.cost.trim()
     if (!rawCost) return { payload, invalidCost: false }

     const cost = Number(rawCost)
     if (!Number.isFinite(cost) || cost < 0) {
          return { payload, invalidCost: true }
     }

     payload.cost = cost
     return { payload, invalidCost: false }
}

const getBadgeClass = (value?: string | null, type: "status" | "priority" = "status") =>
     type === "status"
          ? getMaintenanceStatusOption(value)?.badgeClass || "border-slate-200 bg-slate-100 text-slate-700"
          : getMaintenancePriorityOption(value)?.badgeClass || "border-slate-200 bg-slate-100 text-slate-700"

const renderImages = (images?: string[] | null) => {
     if (!images?.length) return null

     return (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
               {images.map((imageUrl, index) => (
                <a
                     key={`${imageUrl}-${index}`}
                     href={imageUrl}
                     target="_blank"
                     rel="noreferrer"
                     className="group overflow-hidden rounded-lg border bg-muted"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                         src={imageUrl}
                         alt={`maintenance-${index + 1}`}
                         className="aspect-square h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    </a>
               ))}
          </div>
     )
}

export default function StaffMaintenancePage() {
     const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceStatus>("all")
     const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceItem | null>(null)
     const [openDetail, setOpenDetail] = useState(false)
     const [openUpdate, setOpenUpdate] = useState(false)
     const [updateForm, setUpdateForm] = useState<MaintenanceUpdateForm>(createUpdateForm())

     const { data: listResponse, isLoading, isFetching, refetch } = useMaintenances(
          statusFilter === "all" ? undefined : { status: statusFilter },
     )
     const { data: detailResponse, isLoading: detailLoading } = useMaintenance(selectedMaintenance?.id || null)

     const maintenanceList = listResponse?.data ?? []
     const detail = detailResponse?.data
     const updateMaintenance = useUpdateMaintenance()
     const completeMaintenance = useCompleteMaintenance()

     const openDetailDialog = (item: MaintenanceItem) => {
          setSelectedMaintenance(item)
          setOpenDetail(true)
     }

     const closeDetailDialog = () => {
          setOpenDetail(false)
          setSelectedMaintenance(null)
     }

     const openUpdateDialog = (item: MaintenanceItem) => {
          setSelectedMaintenance(item)
          setUpdateForm(createUpdateForm(item))
          setOpenUpdate(true)
     }

     const closeUpdateDialog = () => {
          setOpenUpdate(false)
          setSelectedMaintenance(null)
          setUpdateForm(createUpdateForm())
     }

     const updateFormField = <K extends keyof MaintenanceUpdateForm>(key: K, value: MaintenanceUpdateForm[K]) =>
          setUpdateForm((prev) => ({ ...prev, [key]: value }))

     const handleSubmitUpdate = async () => {
          if (!selectedMaintenance?.id) return

          const { payload, invalidCost } = buildUpdatePayload(updateForm)
          if (invalidCost) {
               message.error("Chi phí không hợp lệ.")
               return
          }

          try {
               await updateMaintenance.mutateAsync({ id: selectedMaintenance.id, payload })
               closeUpdateDialog()
          } catch {
               // Error toast already handled in hook.
          }
     }

     const handleComplete = (item: MaintenanceItem) => {
          if (item.status === "completed") {
               message.info("Yêu cầu này đã hoàn tất.")
               return
          }

          Modal.confirm({
               title: "Hoàn tất yêu cầu bảo trì",
               content: `Xác nhận chuyển yêu cầu "${item.title}" sang trạng thái hoàn tất?`,
               okText: "Hoàn tất",
               cancelText: "Hủy",
               async onOk() {
                    try {
                         await completeMaintenance.mutateAsync(item.id)
                    } catch {
                         // Error toast already handled in hook.
                    }
               },
          })
     }

     return (
          <div className="space-y-5">
               <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold text-gray-900">Xử lý yêu cầu khách hàng</h1>
                         <p className="text-sm text-muted-foreground">
                              Theo dõi, cập nhật tiến độ và hoàn tất yêu cầu khách hàng.
                         </p>
                    </div>

                    <div className="flex items-center gap-2">
                         <Select
                              value={statusFilter}
                              onValueChange={(value) => setStatusFilter(value as "all" | MaintenanceStatus)}
                         >
                              <SelectTrigger className="w-50">
                                   <SelectValue placeholder="Lọc theo trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                   <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                   {MAINTENANCE_STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                             {status.label}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>

                         <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                              <RefreshCcwIcon className="mr-1 size-4" />
                              Làm mới
                         </Button>
                    </div>
               </div>

               <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <Table>
                         <TableHeader className="bg-muted/40">
                              <TableRow>
                                   <TableHead>Tiêu đề</TableHead>
                                   <TableHead>Căn hộ</TableHead>
                                   <TableHead>Danh mục</TableHead>
                                   <TableHead>Mức độ</TableHead>
                                   <TableHead>Trạng thái</TableHead>
                                   <TableHead>Ngày hẹn</TableHead>
                                   <TableHead>Tạo lúc</TableHead>
                                   <TableHead className="text-right">Thao tác</TableHead>
                              </TableRow>
                         </TableHeader>
                         <TableBody>
                              {isLoading ? (
                                   <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                             Đang tải danh sách bảo trì...
                                        </TableCell>
                                   </TableRow>
                              ) : maintenanceList.length === 0 ? (
                                   <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                             Không có yêu cầu bảo trì nào.
                                        </TableCell>
                                   </TableRow>
                              ) : (
                                   maintenanceList.map((item) => (
                                        <TableRow key={item.id}>
                                             <TableCell>
                                                  <div className="space-y-1">
                                                       <p className="text-sm font-semibold">{item.title}</p>
                                                       <p className="text-xs text-muted-foreground">#{item.id}</p>
                                                  </div>
                                             </TableCell>
                                             <TableCell>
                                                  <div className="text-sm">
                                                       <p className="font-medium">{item.apartment.apartmentNumber}</p>
                                                       <p className="text-xs text-muted-foreground">{getMaintenanceAddress(item.apartment)}</p>
                                                  </div>
                                             </TableCell>
                                             <TableCell>{getMaintenanceCategoryLabel(item.category)}</TableCell>
                                             <TableCell>
                                                  <Badge className={`${getBadgeClass(item.urgency, "priority")} border`}>
                                                       {getMaintenancePriorityOption(item.urgency)?.label || item.urgency}
                                                  </Badge>
                                             </TableCell>
                                             <TableCell>
                                                  <Badge className={`${getBadgeClass(item.status)} border`}>
                                                       {getMaintenanceStatusOption(item.status)?.label || item.status}
                                                  </Badge>
                                             </TableCell>
                                             <TableCell>{formatDateTime(item.preferredDate) || "-"}</TableCell>
                                             <TableCell>{formatDateTime(item.createdAt) || "-"}</TableCell>
                                             <TableCell className="text-right">
                                                  <DropdownMenu>
                                                       <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                 <MoreHorizontalIcon className="size-4" />
                                                            </Button>
                                                       </DropdownMenuTrigger>
                                                       <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openDetailDialog(item)}>
                                                                 Xem chi tiết
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openUpdateDialog(item)}>
                                                                 Cập nhật xử lý
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                 disabled={item.status === "completed" || completeMaintenance.isPending}
                                                                 onClick={() => handleComplete(item)}
                                                            >
                                                                 Đánh dấu hoàn tất
                                                            </DropdownMenuItem>
                                                       </DropdownMenuContent>
                                                  </DropdownMenu>
                                             </TableCell>
                                        </TableRow>
                                   ))
                              )}
                         </TableBody>
                    </Table>
               </div>

               <Dialog open={openDetail} onOpenChange={(open) => !open && closeDetailDialog()}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                         <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                   <WrenchIcon className="size-4" />
                                   Chi tiết yêu cầu bảo trì
                              </DialogTitle>
                              <DialogDescription>
                                   Theo dõi nội dung yêu cầu, người gửi và mốc thời gian xử lý.
                              </DialogDescription>
                         </DialogHeader>

                         {detailLoading ? (
                              <p className="text-sm text-muted-foreground">Đang tải chi tiết...</p>
                         ) : !detail ? (
                              <p className="text-sm text-muted-foreground">Không tìm thấy dữ liệu chi tiết.</p>
                         ) : (
                              <div className="space-y-4 text-sm">
                                   <div className="rounded-lg border p-4">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                             <div className="space-y-1">
                                                  <p className="text-lg font-semibold">{detail.title}</p>
                                                  <p className="text-xs text-muted-foreground">Mã yêu cầu: #{detail.id}</p>
                                             </div>
                                             <div className="flex flex-wrap gap-2">
                                                  <Badge className={`${getBadgeClass(detail.status)} border`}>
                                                       {getMaintenanceStatusOption(detail.status)?.label || detail.status}
                                                  </Badge>
                                                  <Badge className={`${getBadgeClass(detail.urgency, "priority")} border`}>
                                                       {getMaintenancePriorityOption(detail.urgency)?.label || detail.urgency}
                                                  </Badge>
                                             </div>
                                        </div>
                                        <p className="mt-3 leading-6">{detail.description || "-"}</p>
                                   </div>

                                   <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Căn hộ</p>
                                             <p className="font-medium">{detail.apartment?.apartmentNumber || "-"}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Địa chỉ</p>
                                             <p className="font-medium break-words">{getMaintenanceAddress(detail.apartment)}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Người gửi yêu cầu</p>
                                             <p className="font-medium">{detail.user?.fullName || "-"}</p>
                                             <p className="text-xs text-muted-foreground">{detail.user?.phone || "-"}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Có cần khách có mặt</p>
                                             <p className="font-medium">{detail.isTenantPresentRequired ? "Có" : "Không"}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Thời gian ưu tiên</p>
                                             <p className="font-medium">{formatDateTime(detail.preferredDate) || "-"}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Hoàn tất lúc</p>
                                             <p className="font-medium">{formatDateTime(detail.completedAt) || "-"}</p>
                                        </div>
                                   </div>

                                   {detail.images?.length ? (
                                        <div className="space-y-2">
                                             <p className="text-sm font-medium">Hình ảnh sự cố</p>
                                             {renderImages(detail.images)}
                                        </div>
                                   ) : null}

                                   {detail.completionImages?.length ? (
                                        <div className="space-y-2">
                                             <p className="text-sm font-medium">Hình ảnh hoàn tất</p>
                                             {renderImages(detail.completionImages)}
                                        </div>
                                   ) : null}
                              </div>
                         )}
                    </DialogContent>
               </Dialog>

               <Dialog
                    open={openUpdate}
                    onOpenChange={(open) => {
                         if (!open) closeUpdateDialog()
                    }}
               >
                    <DialogContent className="sm:max-w-2xl">
                         <DialogHeader>
                              <DialogTitle>Cập nhật xử lý bảo trì</DialogTitle>
                              <DialogDescription>
                                   Cập nhật trạng thái và thông tin xử lý cho yêu cầu bảo trì đã chọn.
                              </DialogDescription>
                         </DialogHeader>

                         <div className="space-y-4 py-1">
                              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                                   <p className="font-semibold">{selectedMaintenance?.title || "-"}</p>
                                   <div className="mt-1 flex flex-col gap-1 text-muted-foreground md:flex-row md:flex-wrap md:items-center md:gap-4">
                                        <span>Mã yêu cầu: #{selectedMaintenance?.id || "-"}</span>
                                        <span>Căn hộ: {selectedMaintenance?.apartment.apartmentNumber || "-"}</span>
                                        <span>Ngày yêu cầu: {formatDateTime(selectedMaintenance?.preferredDate) || "-"}</span>
                                   </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                   <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Trạng thái</p>
                                        <Select
                                             value={updateForm.status}
                                             onValueChange={(value) => updateFormField("status", value as MaintenanceStatus)}
                                        >
                                             <SelectTrigger>
                                                  <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  {UPDATE_STATUS_OPTIONS.map((item) => (
                                                       <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                       </SelectItem>
                                                  ))}
                                             </SelectContent>
                                        </Select>
                                   </div>

                                   <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Mức độ</p>
                                        <Select
                                             value={updateForm.priority}
                                             onValueChange={(value) => updateFormField("priority", value as MaintenancePriority)}
                                        >
                                             <SelectTrigger>
                                                  <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  {MAINTENANCE_PRIORITY_OPTIONS.map((item) => (
                                                       <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                       </SelectItem>
                                                  ))}
                                             </SelectContent>
                                        </Select>
                                   </div>

                                   <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Ngày lên lịch</p>
                                        <Popover>
                                             <PopoverTrigger asChild>
                                                  <Button
                                                       type="button"
                                                       variant="outline"
                                                       className="w-full justify-start text-left font-normal"
                                                  >
                                                       <CalendarIcon className="mr-2 size-4" />
                                                       {formatDateLabel(updateForm.scheduledDate)}
                                                  </Button>
                                             </PopoverTrigger>
                                             <PopoverContent className="w-auto p-0" align="start">
                                                  <Calendar
                                                       mode="single"
                                                       locale={vi}
                                                       selected={parseDate(updateForm.scheduledDate)}
                                                       onSelect={(date) => {
                                                            if (!date) return

                                                            const nextDate = new Date(date)
                                                            nextDate.setHours(0, 0, 0, 0)
                                                            updateFormField("scheduledDate", toDateValue(nextDate))
                                                       }}
                                                       disabled={(date) => {
                                                            const normalized = new Date(date)
                                                            normalized.setHours(0, 0, 0, 0)
                                                            return normalized < TODAY
                                                       }}
                                                       initialFocus
                                                  />
                                             </PopoverContent>
                                        </Popover>
                                   </div>

                                   <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Chi phí (VNĐ)</p>
                                        <Input
                                             type="number"
                                             min={0}
                                             value={updateForm.cost}
                                             onChange={(event) => updateFormField("cost", event.target.value)}
                                             placeholder="Nhập chi phí nếu có"
                                        />
                                   </div>

                                   <div className="space-y-1 md:col-span-2">
                                        <p className="text-xs text-muted-foreground">Ghi chú xử lý</p>
                                        <Textarea
                                             value={updateForm.resolutionNotes}
                                             onChange={(event) => updateFormField("resolutionNotes", event.target.value)}
                                             placeholder="Ví dụ: Đã thay block điều hòa, kiểm tra hoạt động ổn định"
                                             rows={4}
                                        />
                                   </div>
                              </div>
                         </div>

                         <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <Button
                                   type="button"
                                   variant="ghost"
                                   onClick={() => setUpdateForm(createUpdateForm(selectedMaintenance ?? undefined))}
                                   disabled={updateMaintenance.isPending}
                              >
                                   Khôi phục dữ liệu đã chọn
                              </Button>
                              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                   <Button
                                        type="button"
                                        variant="outline"
                                        onClick={closeUpdateDialog}
                                        disabled={updateMaintenance.isPending}
                                   >
                                        Hủy
                                   </Button>
                                   <Button onClick={handleSubmitUpdate} disabled={updateMaintenance.isPending}>
                                        {updateMaintenance.isPending ? "Đang cập nhật..." : "Lưu cập nhật"}
                                   </Button>
                              </div>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}
