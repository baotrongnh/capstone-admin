"use client"

import { useMemo, useState } from "react"
import { message, Modal } from "antd"
import { MoreHorizontalIcon, RefreshCcwIcon, WrenchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useCompleteMaintenance, useMaintenance, useMaintenances } from "@/hooks/query/useMaintenance"
import {
     getMaintenanceAddress,
     getMaintenanceCategoryLabel,
     getMaintenancePriorityOption,
     getMaintenanceStatusOption,
     MAINTENANCE_PRIORITY_OPTIONS,
     MAINTENANCE_STATUS_OPTIONS,
     type MaintenanceCompleteForm,
     type MaintenanceItem,
     type MaintenanceStatus,
} from "@/types/maintenance"
import { formatDateTime } from "@/utils/format"

const createCompleteForm = (): MaintenanceCompleteForm => ({
     resolutionNotes: "",
     cost: "",
     completionImages: [],
})

const getBadgeClass = (value?: string | null, type: "status" | "priority" = "status") =>
     type === "status"
          ? getMaintenanceStatusOption(value)?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"
          : getMaintenancePriorityOption(value)?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"

const getImagePreview = (file: File) => URL.createObjectURL(file)

type RuntimeMaintenanceItem = MaintenanceItem & {
     assignedTask?: {
          id?: string | null
          assignedToStaffId?: string | null
          status?: string | null
     } | null
}

const getRuntimeItem = (item: MaintenanceItem) => item as RuntimeMaintenanceItem

const getApartmentLines = (apartment?: MaintenanceItem["apartment"] | null) => [
     apartment?.apartmentNumber,
     apartment?.streetAddress || apartment?.address,
     apartment?.wardName,
     apartment?.provinceName,
     apartment?.fullAddress,
].filter(Boolean)

const getImageUrl = (value?: string | null) => (typeof value === "string" && value.trim() ? value.trim() : "")
const canPreviewImage = (value: string) => /^(https?:|data:|blob:)/i.test(value)

export default function StaffMaintenancePage() {
     const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceStatus>("all")
     const [selectedId, setSelectedId] = useState<string | null>(null)
     const [completeItem, setCompleteItem] = useState<MaintenanceItem | null>(null)
     const [completeForm, setCompleteForm] = useState<MaintenanceCompleteForm>(createCompleteForm())

     const { data: listResponse, isLoading, isFetching, refetch } = useMaintenances(
          statusFilter === "all" ? undefined : { status: statusFilter },
     )
     const { data: detailResponse } = useMaintenance(selectedId)
     const completeMaintenance = useCompleteMaintenance()

     const items = useMemo(() => listResponse?.data ?? [], [listResponse?.data])
     const detail = detailResponse?.data
     const selectedListItem = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId])

     const openCompleteDialog = (item: MaintenanceItem) => {
          if (item.status === "completed") {
               message.info("Yêu cầu này đã hoàn tất.")
               return
          }
          setCompleteItem(item)
          setCompleteForm(createCompleteForm())
     }

     const closeCompleteDialog = () => {
          setCompleteItem(null)
          setCompleteForm(createCompleteForm())
     }

     const submitComplete = async () => {
          if (!completeItem) return

          const resolutionNotes = completeForm.resolutionNotes.trim()
          if (!resolutionNotes) {
               message.warning("Vui lòng nhập ghi chú hoàn tất.")
               return
          }

          const rawCost = completeForm.cost.trim()
          const cost = rawCost ? Number(rawCost) : undefined
          if (rawCost && (!Number.isFinite(cost) || Number(cost) < 0)) {
               message.warning("Chi phí không hợp lệ.")
               return
          }

          await completeMaintenance.mutateAsync({
               id: completeItem.id,
               payload: {
                    resolutionNotes,
                    ...(typeof cost === "number" ? { cost } : {}),
                    ...(completeForm.completionImages.length > 0
                         ? { completionImages: completeForm.completionImages }
                         : {}),
               },
          })
          closeCompleteDialog()
     }

     return (
          <div className="space-y-6">
               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-semibold tracking-tight">Bảo trì</h1>
                         <p className="text-sm text-muted-foreground">
                         </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                         <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | MaintenanceStatus)}>
                              <SelectTrigger className="w-[190px]">
                                   <SelectValue placeholder="Lọc trạng thái" />
                              </SelectTrigger>
                              <SelectContent>
                                   <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                   {MAINTENANCE_STATUS_OPTIONS.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                         <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                              <RefreshCcwIcon className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
                              Làm mới
                         </Button>
                    </div>
               </div>

               <div className="rounded-xl border bg-card">
                    <Table>
                         <TableHeader>
                                   <TableRow>
                                        <TableHead>Yêu cầu</TableHead>
                                        <TableHead>Căn hộ</TableHead>
                                        <TableHead>Phân công</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Ưu tiên</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ảnh</TableHead>
                                        <TableHead>Ngày hẹn</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                   </TableRow>
                         </TableHeader>
                         <TableBody>
                              {isLoading ? (
                                   <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Đang tải...</TableCell></TableRow>
                              ) : items.length === 0 ? (
                                   <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">Không có yêu cầu bảo trì.</TableCell></TableRow>
                              ) : items.map((item) => (
                                   <TableRow key={item.id}>
                                        <TableCell>
                                             <div className="font-medium">{item.title}</div>
                                             <div className="text-xs text-muted-foreground">ID: {item.id}</div>
                                             <div className="text-xs text-muted-foreground">Tạo: {formatDateTime(item.createdAt)}</div>
                                        </TableCell>
                                        <TableCell>
                                             <div className="max-w-[220px] space-y-1 text-sm">
                                                  {getApartmentLines(item.apartment).map((line, index) => (
                                                       <div key={`${line}-${index}`} className={index === 0 ? "font-medium" : "text-muted-foreground"}>{line}</div>
                                                  ))}
                                             </div>
                                        </TableCell>
                                        <TableCell>
                                             <Badge variant="outline">{getRuntimeItem(item).assignedTask?.status || "Chưa có"}</Badge>
                                             {getRuntimeItem(item).assignedTask?.id ? <div className="mt-1 text-xs text-muted-foreground">{getRuntimeItem(item).assignedTask?.id}</div> : null}
                                        </TableCell>
                                        <TableCell>{getMaintenanceCategoryLabel(item.category)}</TableCell>
                                        <TableCell><Badge className={`${getBadgeClass(item.urgency, "priority")} border`}>{getMaintenancePriorityOption(item.urgency)?.label || item.urgency}</Badge></TableCell>
                                        <TableCell><Badge className={`${getBadgeClass(item.status)} border`}>{getMaintenanceStatusOption(item.status)?.label || item.status}</Badge></TableCell>
                                        <TableCell>{item.images?.length ? `${item.images.length} ảnh` : "-"}</TableCell>
                                        <TableCell>{formatDateTime(item.preferredDate) || "-"}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                       <Button variant="ghost" size="icon"><MoreHorizontalIcon className="size-4" /></Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                       <DropdownMenuItem onClick={() => setSelectedId(item.id)}>Xem chi tiết</DropdownMenuItem>
                                                       <DropdownMenuItem disabled={item.status === "completed"} onClick={() => openCompleteDialog(item)}>
                                                            Hoàn tất
                                                       </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                             </DropdownMenu>
                                        </TableCell>
                                   </TableRow>
                              ))}
                         </TableBody>
                    </Table>
               </div>

               <Dialog open={!!selectedId && !!detail} onOpenChange={(open) => !open && setSelectedId(null)}>
                    <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                         <DialogHeader>
                              <DialogTitle>{detail?.title || "Chi tiết bảo trì"}</DialogTitle>
                              <DialogDescription>{detail?.description || "Thông tin yêu cầu bảo trì"}</DialogDescription>
                         </DialogHeader>
                         {detail ? (
                              <div className="space-y-5">
                                   <div className="grid gap-4 md:grid-cols-3">
                                        <Info label="ID yêu cầu" value={detail.id} />
                                        <Info label="Trạng thái" value={getMaintenanceStatusOption(detail.status)?.label || detail.status} />
                                        <Info label="Độ ưu tiên" value={getMaintenancePriorityOption(detail.urgency)?.label || detail.urgency} />
                                        <Info label="Loại" value={getMaintenanceCategoryLabel(detail.category)} />
                                        <Info label="Ngày tạo" value={formatDateTime(detail.createdAt)} />
                                        <Info label="Ngày cập nhật" value={formatDateTime(detail.updatedAt)} />
                                        <Info label="Ngày hẹn" value={formatDateTime(detail.preferredDate) || "-"} />
                                        <Info label="Khung giờ hẹn" value={detail.preferredTimeSlot || "-"} />
                                        <Info label="Cần người thuê có mặt" value={detail.isTenantPresentRequired ? "Có" : "Không"} />
                                        <Info label="Người gửi" value={detail.user?.fullName || "-"} />
                                        <Info label="SĐT người gửi" value={detail.user?.phone || "-"} />
                                        <Info label="Đã đánh giá" value={detail.isRated ? "Có" : "Không"} />
                                   </div>

                                   <div className="grid gap-4 md:grid-cols-2">
                                        <Info label="Mã căn hộ" value={detail.apartment?.apartmentNumber || selectedListItem?.apartment?.apartmentNumber || "-"} />
                                        <Info label="Địa chỉ" value={getMaintenanceAddress(detail.apartment)} />
                                        <Info label="Đường" value={detail.apartment?.streetAddress || detail.apartment?.address || "-"} />
                                        <Info label="Phường" value={detail.apartment?.wardName || "-"} />
                                        <Info label="Mã phường" value={String(detail.apartment?.wardCode ?? "-")} />
                                        <Info label="Tỉnh/TP" value={detail.apartment?.provinceName || "-"} />
                                   </div>

                                   <div className="grid gap-4 md:grid-cols-3">
                                        <Info label="Task ID" value={getRuntimeItem(selectedListItem as MaintenanceItem)?.assignedTask?.id || detail.assignedTaskId || "-"} />
                                        <Info label="Staff ID" value={getRuntimeItem(selectedListItem as MaintenanceItem)?.assignedTask?.assignedToStaffId || "-"} />
                                        <Info label="Task status" value={getRuntimeItem(selectedListItem as MaintenanceItem)?.assignedTask?.status || "-"} />
                                   </div>

                                   <div className="grid gap-4 md:grid-cols-2">
                                        <Info label="Chi phí dự kiến" value={detail.costEstimate || "-"} />
                                        <Info label="Chi phí thực tế" value={detail.actualCost || "-"} />
                                        <Info label="Bên thanh toán" value={detail.costCoveredBy || "-"} />
                                        <Info label="Hoàn tất lúc" value={formatDateTime(detail.completedAt) || "-"} />
                                        <div className="md:col-span-2"><Info label="Ghi chú hoàn tất" value={detail.completionNotes || "-"} /></div>
                                        <div className="md:col-span-2"><Info label="Phản hồi người thuê" value={detail.tenantFeedback || "-"} /></div>
                                   </div>

                                   <ImageGallery title="Ảnh sự cố" images={detail.images || selectedListItem?.images || []} />
                                   <ImageGallery title="Ảnh hoàn tất" images={detail.completionImages || []} />
                              </div>
                         ) : null}
                    </DialogContent>
               </Dialog>

               <Dialog open={!!completeItem} onOpenChange={(open) => !open && closeCompleteDialog()}>
                    <DialogContent className="max-w-2xl">
                         <DialogHeader>
                              <DialogTitle>Hoàn tất bảo trì</DialogTitle>
                              <DialogDescription>{completeItem?.title}</DialogDescription>
                         </DialogHeader>
                         <div className="space-y-4">
                              <div className="space-y-2">
                                   <p className="text-sm font-medium">Ghi chú hoàn tất <span className="text-red-500">*</span></p>
                                   <Textarea value={completeForm.resolutionNotes} onChange={(event) => setCompleteForm((prev) => ({ ...prev, resolutionNotes: event.target.value }))} rows={4} placeholder="Ví dụ: Đã thay linh kiện, kiểm tra hoạt động ổn định." />
                              </div>
                              <div className="space-y-2">
                                   <p className="text-sm font-medium">Chi phí (VNĐ)</p>
                                   <Input type="number" min={0} value={completeForm.cost} onChange={(event) => setCompleteForm((prev) => ({ ...prev, cost: event.target.value }))} placeholder="Nhập chi phí nếu có" />
                              </div>
                              <div className="space-y-2">
                                   <p className="text-sm font-medium">Ảnh hoàn tất</p>
                                   <Input type="file" accept="image/*" multiple onChange={(event) => setCompleteForm((prev) => ({ ...prev, completionImages: Array.from(event.target.files ?? []) }))} />
                                   {completeForm.completionImages.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                             {completeForm.completionImages.map((file, index) => (
                                                  <button key={`${file.name}-${index}`} type="button" className="relative size-20 overflow-hidden rounded-lg border" onClick={() => Modal.confirm({ title: "Xóa ảnh?", onOk: () => setCompleteForm((prev) => ({ ...prev, completionImages: prev.completionImages.filter((_, i) => i !== index) })) })}>
                                                       <img src={getImagePreview(file)} alt={file.name} className="h-full w-full object-cover" />
                                                  </button>
                                             ))}
                                        </div>
                                   ) : null}
                              </div>
                         </div>
                         <DialogFooter>
                              <Button variant="outline" onClick={closeCompleteDialog} disabled={completeMaintenance.isPending}>Hủy</Button>
                              <Button onClick={submitComplete} disabled={completeMaintenance.isPending}>
                                   {completeMaintenance.isPending ? "Đang hoàn tất..." : "Hoàn tất"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}

function Info({ label, value }: { label: string; value: string }) {
     return (
          <div className="rounded-lg border bg-muted/30 p-3">
               <p className="text-xs text-muted-foreground">{label}</p>
               <p className="mt-1 font-medium">{value}</p>
          </div>
     )
}

function ImageGallery({ title, images }: { title: string; images?: (string | null)[] | null }) {
     const validImages = (images ?? []).map(getImageUrl).filter(Boolean)

     return (
          <div className="space-y-2">
               <p className="text-sm font-medium">{title} ({validImages.length})</p>
               {validImages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                         {validImages.map((image, index) => (
                              <div key={`${image}-${index}`} className="overflow-hidden rounded-lg border bg-muted/30">
                                   {canPreviewImage(image) ? (
                                        <a href={image} target="_blank" rel="noreferrer">
                                             <img src={image} alt={`${title} ${index + 1}`} className="h-40 w-full object-cover" />
                                        </a>
                                   ) : (
                                        <div className="flex h-40 items-center justify-center px-3 text-center text-xs text-muted-foreground">
                                             Không thể preview ảnh local từ thiết bị
                                        </div>
                                   )}
                                   <div className="break-all border-t p-2 text-xs text-muted-foreground">{image}</div>
                              </div>
                         ))}
                    </div>
               ) : (
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">Chưa có ảnh.</div>
               )}
          </div>
     )
}
