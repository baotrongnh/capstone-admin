"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useCompleteMaintenance, useMaintenance, useMaintenances, useUpdateMaintenance } from "@/hooks/query/useMaintenance"
import {
     getMaintenancePriorityOption,
     getMaintenanceStatusOption,
     MAINTENANCE_PRIORITY_OPTIONS,
     MAINTENANCE_STATUS_OPTIONS,
     MaintenanceItem,
     MaintenancePriority,
     MaintenanceStatus,
     MaintenanceUpdateForm,
     MaintenanceUpdateRequestBody,
     normalizeMaintenancePriority,
     normalizeMaintenanceStatus,
     toIsoDateTime,
     toLocalDateTimeInput,
} from "@/types/maintenance"
import { formatDateTime } from "@/utils/format"
import { message, Modal } from "antd"
import { MoreHorizontalIcon, RefreshCcwIcon, WrenchIcon } from "lucide-react"
import { useState } from "react"

const createUpdateForm = (item?: Partial<Pick<MaintenanceItem, "status" | "urgency">>): MaintenanceUpdateForm => ({
     status: normalizeMaintenanceStatus(item?.status),
     priority: normalizeMaintenancePriority(item?.urgency),
     scheduledDate: "",
     resolutionNotes: "",
     cost: "",
})

const buildUpdatePayload = (form: MaintenanceUpdateForm): { payload: MaintenanceUpdateRequestBody; invalidCost: boolean } => {
     const payload: MaintenanceUpdateRequestBody = {
          status: form.status,
          priority: form.priority,
     }

     const scheduledDate = toIsoDateTime(form.scheduledDate)
     if (scheduledDate) {
          payload.scheduledDate = scheduledDate
     }

     const resolutionNotes = form.resolutionNotes.trim()
     if (resolutionNotes) {
          payload.resolutionNotes = resolutionNotes
     }

     const rawCost = form.cost.trim()
     if (!rawCost) {
          return { payload, invalidCost: false }
     }

     const parsedCost = Number(rawCost)
     if (!Number.isFinite(parsedCost) || parsedCost < 0) {
          return { payload, invalidCost: true }
     }

     payload.cost = parsedCost
     return { payload, invalidCost: false }
}

export default function StaffMaintenancePage() {
     const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceStatus>("all")
     const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceItem | null>(null)
     const [openDetail, setOpenDetail] = useState(false)
     const [openUpdate, setOpenUpdate] = useState(false)
     const [updateForm, setUpdateForm] = useState<MaintenanceUpdateForm>(createUpdateForm())

     const activeStatusFilter = statusFilter === "all" ? undefined : statusFilter

     const { data: listResponse, isLoading, isFetching, refetch } =
          useMaintenances(activeStatusFilter ? { status: activeStatusFilter } : undefined)

     const maintenanceList = listResponse?.data ?? []

     const { data: detailResponse, isLoading: detailLoading } = useMaintenance(selectedMaintenance?.id || null)

     const detail = detailResponse?.data

     const updateMaintenance = useUpdateMaintenance()
     const completeMaintenance = useCompleteMaintenance()

     const openDetailDialog = (item: MaintenanceItem) => {
          setSelectedMaintenance(item)
          setOpenDetail(true)
     }

     const openUpdateDialog = (item: MaintenanceItem) => {
          setSelectedMaintenance(item)
          setUpdateForm(createUpdateForm(item))
          setOpenUpdate(true)
     }

     const updateFormField = <K extends keyof MaintenanceUpdateForm>(key: K, value: MaintenanceUpdateForm[K]) => {
          setUpdateForm((prev) => ({
               ...prev,
               [key]: value,
          }))
     }

     const handleUpdateFromDetail = () => {
          setUpdateForm((prev) => ({
               ...prev,
               status: normalizeMaintenanceStatus(detail?.status),
               priority: normalizeMaintenancePriority(detail?.urgency),
               scheduledDate: toLocalDateTimeInput(detail?.preferredDate),
          }))
     }

     const handleSubmitUpdate = async () => {
          const id = selectedMaintenance?.id
          if (!id) return

          const { payload, invalidCost } = buildUpdatePayload(updateForm)
          if (invalidCost) {
               message.error("Chi phí không hợp lệ.")
               return
          }

          try {
               await updateMaintenance.mutateAsync({ id, payload })
               setOpenUpdate(false)
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
                         await completeMaintenance.mutateAsync(item.id);
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

               <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <Table>
                         <TableHeader className="bg-muted/40">
                              <TableRow>
                                   <TableHead>Tiêu đề</TableHead>
                                   <TableHead>Căn hộ</TableHead>
                                   <TableHead>Loại sự cố</TableHead>
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
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                             Đang tải danh sách bảo trì...
                                        </TableCell>
                                   </TableRow>
                              ) : maintenanceList.length === 0 ? (
                                   <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                             Không có yêu cầu bảo trì nào.
                                        </TableCell>
                                   </TableRow>
                              ) : (
                                   maintenanceList.map((item) => {
                                        const statusMeta = getMaintenanceStatusOption(item.status);
                                        const priorityMeta = getMaintenancePriorityOption(item.urgency);

                                        return (
                                             <TableRow key={item.id}>
                                                  <TableCell>
                                                       <div className="space-y-1">
                                                            <p className="font-semibold text-sm">{item.title}</p>
                                                            <p className="text-xs text-muted-foreground">#{item.id}</p>
                                                       </div>
                                                  </TableCell>
                                                  <TableCell>
                                                       <div className="text-sm">
                                                            <p className="font-medium">{item.apartment.apartmentNumber}</p>
                                                            <p className="text-xs text-muted-foreground">{item.apartment.address}</p>
                                                       </div>
                                                  </TableCell>
                                                  <TableCell className="capitalize">{item.category}</TableCell>
                                                  <TableCell>
                                                       <Badge className={`${priorityMeta?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"} border`}>
                                                            {priorityMeta?.label || item.urgency}
                                                       </Badge>
                                                  </TableCell>
                                                  <TableCell>
                                                       <Badge className={`${statusMeta?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"} border`}>
                                                            {statusMeta?.label || item.status}
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
                                        );
                                   })
                              )}
                         </TableBody>
                    </Table>
               </div>

               <Dialog
                    open={openDetail}
                    onOpenChange={(open) => {
                         setOpenDetail(open)
                         if (!open) {
                              setSelectedMaintenance(null)
                         }
                    }}
               >
                    <DialogContent className="sm:max-w-2xl">
                         <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                   <WrenchIcon className="size-4" />
                                   Chi tiết yêu cầu bảo trì
                              </DialogTitle>
                              <DialogDescription>
                                   Thông tin chi tiết lấy từ endpoint GET /api/v1/maintenance/{"{id}"}.
                              </DialogDescription>
                         </DialogHeader>

                         {detailLoading ? (
                              <p className="text-sm text-muted-foreground">Đang tải chi tiết...</p>
                         ) : !detail ? (
                              <p className="text-sm text-muted-foreground">Không tìm thấy dữ liệu chi tiết.</p>
                         ) : (
                              <div className="space-y-4 text-sm">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Tiêu đề</p>
                                             <p className="font-medium">{detail.title}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Danh mục</p>
                                             <p className="capitalize">{detail.category}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Trạng thái</p>
                                             <p>{getMaintenanceStatusOption(detail.status)?.label || detail.status}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Mức độ</p>
                                             <p>{getMaintenancePriorityOption(detail.urgency)?.label || detail.urgency}</p>
                                        </div>
                                        <div className="rounded-lg border p-3 md:col-span-2">
                                             <p className="text-xs text-muted-foreground">Mô tả</p>
                                             <p>{detail.description || "-"}</p>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Căn hộ</p>
                                             <p className="font-medium">{detail?.apartment?.apartmentNumber}</p>
                                             <p className="text-xs text-muted-foreground">{detail.apartment?.address}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Người báo</p>
                                             <p className="font-medium">{detail?.user?.fullName}</p>
                                             <p className="text-xs text-muted-foreground">{detail.user?.phone}</p>
                                        </div>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Ngày ưu tiên</p>
                                             <p>{formatDateTime(detail?.preferredDate) || "-"}</p>
                                        </div>
                                        <div className="rounded-lg border p-3">
                                             <p className="text-xs text-muted-foreground">Hoàn tất lúc</p>
                                             <p>{formatDateTime(detail?.completedAt) || "-"}</p>
                                        </div>
                                   </div>
                              </div>
                         )}
                    </DialogContent>
               </Dialog>

               <Dialog
                    open={openUpdate}
                    onOpenChange={(open) => {
                         setOpenUpdate(open)
                         if (!open) {
                              setSelectedMaintenance(null);
                              setUpdateForm(createUpdateForm())
                         }
                    }}
               >
                    <DialogContent className="sm:max-w-2xl">
                         <DialogHeader>
                              <DialogTitle>Cập nhật xử lý bảo trì</DialogTitle>
                              <DialogDescription>
                                   Thực hiện PATCH /api/v1/maintenance/{"{id}"} theo đúng schema OpenAPI.
                              </DialogDescription>
                         </DialogHeader>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-1">
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
                                             {MAINTENANCE_STATUS_OPTIONS.map((item) => (
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
                                   <Input
                                        type="datetime-local"
                                        value={updateForm.scheduledDate}
                                        onChange={(event) => updateFormField("scheduledDate", event.target.value)}
                                   />
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

                         <DialogFooter className="gap-2 sm:gap-0">
                              {detail ? (
                                   <Button
                                        variant="outline"
                                        onClick={handleUpdateFromDetail}
                                        disabled={updateMaintenance.isPending}
                                   >
                                        Lấy dữ liệu từ chi tiết
                                   </Button>
                              ) : null}
                              <Button variant="outline" onClick={() => setOpenUpdate(false)} disabled={updateMaintenance.isPending}>
                                   Hủy
                              </Button>
                              <Button onClick={handleSubmitUpdate} disabled={updateMaintenance.isPending}>
                                   {updateMaintenance.isPending ? "Đang cập nhật..." : "Lưu cập nhật"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}