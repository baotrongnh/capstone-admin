"use client"

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
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
     useConfirmStaffPartnerPayout,
     useStaffPartnerPayouts,
} from "@/hooks/query/useRevenues"
import type { StaffPartnerPayoutItem } from "@/types/revenue"
import { formatDateTime, formatVND } from "@/utils/format"
import { CalendarIcon, RefreshCcwIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

const ALL_PARTNERS = "__all__"

const toMonthValue = (date: Date) => {
     const now = new Date()
     const source = Number.isNaN(date.getTime()) ? now : date
     const month = String(source.getMonth() + 1).padStart(2, "0")
     return `${source.getFullYear()}-${month}`
}

const parseMonthValue = (value: string) => {
     const [year, month] = value.split("-").map(Number)
     if (!year || !month) {
          return new Date()
     }
     return new Date(year, month - 1, 1)
}

const formatMonthLabelVi = (value: string) =>
     parseMonthValue(value).toLocaleDateString("vi-VN", {
          month: "long",
          year: "numeric",
     })

export default function StaffPartnerPayoutsPage() {
     const [monthFilter, setMonthFilter] = useState(() => toMonthValue(new Date()))
     const [partnerFilter, setPartnerFilter] = useState(ALL_PARTNERS)
     const [openConfirm, setOpenConfirm] = useState(false)
     const [selectedPayout, setSelectedPayout] = useState<StaffPartnerPayoutItem | null>(null)
     const [confirmNote, setConfirmNote] = useState("")
     const [transferProofFile, setTransferProofFile] = useState<File | null>(null)

     const queryParams = {
          month: monthFilter || undefined,
          partnerId: partnerFilter === ALL_PARTNERS ? undefined : partnerFilter,
          page: 1,
          limit: 50,
     }

     const { data: payoutList, isLoading, isFetching, refetch } = useStaffPartnerPayouts(queryParams)
     const confirmPayoutMutation = useConfirmStaffPartnerPayout()

     const payouts = useMemo(() => payoutList?.items ?? [], [payoutList])

     const partnerOptions = useMemo(
          () =>
               Array.from(
                    new Map(
                         payouts.map((item) => [item.partner.id, item.partner]),
                    ).values(),
               ),
          [payouts],
     )

     const openConfirmDialog = (item: StaffPartnerPayoutItem) => {
          setSelectedPayout(item)
          setConfirmNote("")
          setTransferProofFile(null)
          setOpenConfirm(true)
     }

     const closeConfirmDialog = () => {
          setOpenConfirm(false)
          setSelectedPayout(null)
          setConfirmNote("")
          setTransferProofFile(null)
     }

     const handleConfirmPayout = async () => {
          if (!selectedPayout) {
               return
          }

          if (!transferProofFile) {
               toast.error("Vui lòng chọn ảnh minh chứng chuyển khoản.")
               return
          }

          try {
               await confirmPayoutMutation.mutateAsync({
                    partnerId: selectedPayout.partner.id,
                    month: selectedPayout.periodMonth,
                    note: confirmNote.trim() || undefined,
                    transferProof: transferProofFile,
               })
               closeConfirmDialog()
          } catch {
               // Error toast handled in mutation hook.
          }
     }

     return (
          <div className="space-y-5">
               <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold text-gray-900">Chi trả doanh thu đối tác</h1>
                         <p className="text-sm text-muted-foreground">
                              Theo dõi doanh thu chi trả theo tháng và xác nhận chuyển khoản cho partner.
                         </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                         <Popover>
                              <PopoverTrigger asChild>
                                   <Button variant="outline" className="w-55 justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 size-4" />
                                        {formatMonthLabelVi(monthFilter)}
                                   </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                   <Calendar
                                        mode="single"
                                        locale={vi}
                                        formatters={{
                                             formatMonthDropdown: (date) =>
                                                  date.toLocaleString("vi-VN", { month: "long" }),
                                        }}
                                        selected={parseMonthValue(monthFilter)}
                                        onSelect={(date) => {
                                             if (date) {
                                                  setMonthFilter(toMonthValue(date))
                                             }
                                        }}
                                        captionLayout="dropdown"
                                   />
                              </PopoverContent>
                         </Popover>

                         <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                              <SelectTrigger className="w-70">
                                   <SelectValue placeholder="Lọc theo partner" />
                              </SelectTrigger>
                              <SelectContent>
                                   <SelectItem value={ALL_PARTNERS}>Tất cả partner</SelectItem>
                                   {partnerOptions.map((partner) => (
                                        <SelectItem key={partner.id} value={partner.id}>
                                             {partner.fullName}
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
                                   <TableHead>Partner</TableHead>
                                   <TableHead>Tháng</TableHead>
                                   <TableHead>Số HĐ</TableHead>
                                   <TableHead>Tổng gộp</TableHead>
                                   <TableHead>Hoa hồng hệ thống</TableHead>
                                   <TableHead>Thực nhận</TableHead>
                                   <TableHead>Trạng thái</TableHead>
                                   <TableHead>Xác nhận</TableHead>
                                   <TableHead className="text-right">Thao tác</TableHead>
                              </TableRow>
                         </TableHeader>
                         <TableBody>
                              {isLoading ? (
                                   <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                             Đang tải danh sách chi trả...
                                        </TableCell>
                                   </TableRow>
                              ) : payouts.length === 0 ? (
                                   <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                             Không có dữ liệu chi trả.
                                        </TableCell>
                                   </TableRow>
                              ) : (
                                   payouts.map((item) => (
                                        <TableRow key={`${item.partner.id}-${item.periodMonth}`}>
                                             <TableCell>
                                                  <div className="space-y-1">
                                                       <p className="font-semibold text-sm">{item.partner.fullName}</p>
                                                       <p className="text-xs text-muted-foreground">{item.partner.companyName || item.partner.id}</p>
                                                  </div>
                                             </TableCell>
                                             <TableCell>{item.periodMonth}</TableCell>
                                             <TableCell>{item.invoiceCount}</TableCell>
                                             <TableCell>{formatVND(item.totalGrossAmount, true)}</TableCell>
                                             <TableCell>{formatVND(item.totalSystemCommissionAmount, true)}</TableCell>
                                             <TableCell className="font-medium">{formatVND(item.totalNetPayoutAmount, true)}</TableCell>
                                             <TableCell>
                                                  <Badge className={`${item.isTransferred ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"} border`}>
                                                       {item.isTransferred ? "Đã chuyển" : "Chưa chuyển"}
                                                  </Badge>
                                             </TableCell>
                                             <TableCell>
                                                  <div className="space-y-1 text-xs text-muted-foreground">
                                                       <p>{formatDateTime(item.confirmedAt)}</p>
                                                       <p>{item.confirmedByStaffName || "-"}</p>
                                                  </div>
                                             </TableCell>
                                             <TableCell className="text-right">
                                                  <Button
                                                       size="sm"
                                                       disabled={item.isTransferred || confirmPayoutMutation.isPending}
                                                       onClick={() => openConfirmDialog(item)}
                                                  >
                                                       Xác nhận CK
                                                  </Button>
                                             </TableCell>
                                        </TableRow>
                                   ))
                              )}
                         </TableBody>
                    </Table>
               </div>

               <Dialog open={openConfirm} onOpenChange={(open) => {
                    if (!open) {
                         closeConfirmDialog()
                         return
                    }
                    setOpenConfirm(true)
               }}>
                    <DialogContent className="sm:max-w-xl">
                         <DialogHeader>
                              <DialogTitle>Xác nhận chuyển khoản cho partner</DialogTitle>
                              <DialogDescription>
                                   Thực hiện POST /api/v1/revenues/staff/partner-payouts/confirm với ảnh minh chứng chuyển khoản.
                              </DialogDescription>
                         </DialogHeader>

                         <div className="space-y-3 text-sm">
                              <div className="rounded-lg border p-3">
                                   <p><span className="text-muted-foreground">Partner:</span> {selectedPayout?.partner.fullName || "-"}</p>
                                   <p><span className="text-muted-foreground">Tháng:</span> {selectedPayout?.periodMonth || "-"}</p>
                                   <p><span className="text-muted-foreground">Số tiền chi trả:</span> {formatVND(selectedPayout?.totalNetPayoutAmount ?? 0, true)}</p>
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Ghi chú chuyển khoản</p>
                                   <Textarea
                                        value={confirmNote}
                                        onChange={(event) => setConfirmNote(event.target.value)}
                                        rows={3}
                                        placeholder="Ví dụ: Đã chuyển khoản lúc 10:30 ngày 08/04/2026"
                                   />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Ảnh minh chứng chuyển khoản (bắt buộc)</p>
                                   <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => setTransferProofFile(event.target.files?.[0] ?? null)}
                                   />
                                   {selectedPayout?.transferProofImageUrl ? (
                                        <a
                                             href={selectedPayout.transferProofImageUrl}
                                             target="_blank"
                                             rel="noreferrer"
                                             className="text-xs text-primary underline"
                                        >
                                             Xem ảnh minh chứng hiện tại
                                        </a>
                                   ) : null}
                              </div>
                         </div>

                         <DialogFooter>
                              <Button variant="outline" onClick={closeConfirmDialog} disabled={confirmPayoutMutation.isPending}>
                                   Hủy
                              </Button>
                              <Button onClick={handleConfirmPayout} disabled={confirmPayoutMutation.isPending || !transferProofFile}>
                                   {confirmPayoutMutation.isPending ? "Đang xác nhận..." : "Xác nhận chuyển khoản"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}
