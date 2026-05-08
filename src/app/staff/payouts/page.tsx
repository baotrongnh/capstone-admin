"use client"

import { useMemo, useState } from "react"
import { RefreshCcwIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
     useConfirmContractDepositPayout,
     useConfirmPartnerMonthlyPayout,
     useDueContractDepositPayouts,
     useDuePartnerMonthlyPayouts,
} from "@/hooks/query/usePayments"
import type { ContractDepositPayoutItem, PartnerMonthlyPayoutItem } from "@/types/payment"
import { formatDateTime, formatVND } from "@/utils/format"
import { toast } from "sonner"

type PayoutKind = "partner" | "deposit"

type ConfirmTarget =
     | { kind: "partner"; item: PartnerMonthlyPayoutItem }
     | { kind: "deposit"; item: ContractDepositPayoutItem }

const toMonthValue = (date: Date) => {
     const month = String(date.getMonth() + 1).padStart(2, "0")
     return `${date.getFullYear()}-${month}`
}

const previousMonth = () => {
     const now = new Date()
     return new Date(now.getFullYear(), now.getMonth() - 1, 1)
}

const getStatusLabel = (status?: string | null) => {
     switch (status) {
          case "pending":
               return "Chờ chi trả"
          case "paid":
               return "Đã chi trả"
          case "refunded":
               return "Đã hoàn cọc"
          default:
               return status || "-"
     }
}

const getStatusClass = (status?: string | null) => {
     switch (status) {
          case "paid":
          case "refunded":
               return "border-emerald-200 bg-emerald-100 text-emerald-700"
          default:
               return "border-amber-200 bg-amber-100 text-amber-700"
     }
}

const toMoney = (value?: string | number | null) => formatVND(value ?? 0, true)

const emptyValue = (value?: string | number | boolean | null) => {
     if (value === null || value === undefined || value === "") return "-"
     if (typeof value === "boolean") return value ? "Có" : "Không"
     return String(value)
}

const DetailItem = ({ label, value }: { label: string; value?: string | number | boolean | null }) => (
     <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 break-words text-sm font-medium text-gray-900">{emptyValue(value)}</p>
     </div>
)

export default function StaffPartnerPayoutsPage() {
     const [activeTab, setActiveTab] = useState<PayoutKind>("partner")
     const [month, setMonth] = useState(() => toMonthValue(previousMonth()))
     const [target, setTarget] = useState<ConfirmTarget | null>(null)
     const [detailTarget, setDetailTarget] = useState<ConfirmTarget | null>(null)
     const [transferReference, setTransferReference] = useState("")
     const [transferNote, setTransferNote] = useState("")
     const [refundReason, setRefundReason] = useState("")
     const [transferProof, setTransferProof] = useState<File | null>(null)

     const query = useMemo(() => ({ month: month || undefined }), [month])
     const partnerQuery = useDuePartnerMonthlyPayouts(query)
     const depositQuery = useDueContractDepositPayouts(query)
     const confirmPartner = useConfirmPartnerMonthlyPayout()
     const confirmDeposit = useConfirmContractDepositPayout()

     const partnerPayouts = partnerQuery.data ?? []
     const depositPayouts = depositQuery.data ?? []
     const isLoading = activeTab === "partner" ? partnerQuery.isLoading : depositQuery.isLoading
     const isFetching = partnerQuery.isFetching || depositQuery.isFetching
     const isConfirming = confirmPartner.isPending || confirmDeposit.isPending

     const resetDialog = () => {
          setTarget(null)
          setTransferReference("")
          setTransferNote("")
          setRefundReason("")
          setTransferProof(null)
     }

     const openConfirm = (nextTarget: ConfirmTarget) => {
          setTarget(nextTarget)
          setTransferReference("")
          setTransferNote(nextTarget.kind === "partner" ? `Chi trả doanh thu tháng ${nextTarget.item.payoutMonth}` : "Hoàn trả tiền cọc hợp đồng")
          setRefundReason(nextTarget.kind === "deposit" ? "Hợp đồng đã kết thúc, hoàn trả tiền cọc" : "")
          setTransferProof(null)
     }

     const refetch = () => {
          partnerQuery.refetch()
          depositQuery.refetch()
     }

     const handleConfirm = async () => {
          if (!target) return
          if (!transferProof) {
               toast.error("Vui lòng chọn ảnh minh chứng chuyển khoản.")
               return
          }

          try {
               if (target.kind === "partner") {
                    await confirmPartner.mutateAsync({
                         partnerId: target.item.partnerId,
                         payoutMonth: target.item.payoutMonth,
                         transferReference,
                         transferNote,
                         transferProof,
                    })
               } else {
                    await confirmDeposit.mutateAsync({
                         contractId: target.item.contractId,
                         transferReference,
                         transferNote,
                         refundReason,
                         transferProof,
                    })
               }

               resetDialog()
          } catch {
          }
     }

     return (
          <div className="space-y-5">
               <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold text-gray-900">Chi trả</h1>
                         <p className="text-sm text-muted-foreground">
                              Quản lý chi trả doanh thu đối tác và hoàn tiền cọc đến hạn theo tháng.
                         </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                         <Input className="h-9 w-[150px]" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
                         <Button variant="outline" onClick={refetch} disabled={isFetching}>
                              <RefreshCcwIcon className="size-4" />
                              Làm mới
                         </Button>
                    </div>
               </div>

               <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PayoutKind)}>
                    <TabsList>
                         <TabsTrigger value="partner">Chi trả đối tác</TabsTrigger>
                         <TabsTrigger value="deposit">Trả tiền cọc</TabsTrigger>
                    </TabsList>

                    <TabsContent value="partner">
                         <Card>
                              <CardHeader>
                                   <CardTitle className="text-base">Chi trả doanh thu đến hạn ({partnerPayouts.length})</CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <Table>
                                        <TableHeader>
                                             <TableRow>
                                                  <TableHead>Đối tác</TableHead>
                                                  <TableHead>Ngân hàng</TableHead>
                                                  <TableHead>Kỳ</TableHead>
                                                  <TableHead>Hạn trả</TableHead>
                                                  <TableHead className="text-right">Số tiền</TableHead>
                                                  <TableHead>Trạng thái</TableHead>
                                                  <TableHead className="text-right">Thao tác</TableHead>
                                             </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {isLoading ? (
                                                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Đang tải...</TableCell></TableRow>
                                             ) : partnerPayouts.length === 0 ? (
                                                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Không có chi trả doanh thu đến hạn.</TableCell></TableRow>
                                             ) : partnerPayouts.map((item) => (
                                                  <TableRow key={`${item.partnerId}-${item.payoutMonth}`}>
                                                       <TableCell>
                                                            <p className="font-medium">{item.partnerCompanyName || item.partnerName}</p>
                                                            <p className="text-xs text-muted-foreground">{item.partnerName}</p>
                                                       </TableCell>
                                                       <TableCell>
                                                            <p>{item.bankName || "-"}</p>
                                                            <p className="text-xs text-muted-foreground">{item.bankAccountNumber || "-"}</p>
                                                       </TableCell>
                                                       <TableCell>{item.payoutMonth}</TableCell>
                                                       <TableCell>{formatDateTime(item.dueDate)}</TableCell>
                                                       <TableCell className="text-right font-semibold">{toMoney(item.payoutAmount)}</TableCell>
                                                       <TableCell><Badge className={`${getStatusClass(item.status)} border`}>{getStatusLabel(item.status)}</Badge></TableCell>
                                                       <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                 <Button size="sm" variant="outline" onClick={() => setDetailTarget({ kind: "partner", item })}>
                                                                      Chi tiết
                                                                 </Button>
                                                                 <Button size="sm" onClick={() => openConfirm({ kind: "partner", item })} disabled={isConfirming}>
                                                                 Xác nhận
                                                                 </Button>
                                                            </div>
                                                       </TableCell>
                                                  </TableRow>
                                             ))}
                                        </TableBody>
                                   </Table>
                              </CardContent>
                         </Card>
                    </TabsContent>

                    <TabsContent value="deposit">
                         <Card>
                              <CardHeader>
                                   <CardTitle className="text-base">Trả tiền cọc thuê nhà</CardTitle>
                              </CardHeader>
                              <CardContent>
                                   <Table>
                                        <TableHeader>
                                             <TableRow>
                                                  <TableHead>Người nhận</TableHead>
                                                  <TableHead>Hợp đồng</TableHead>
                                                  <TableHead>Căn hộ</TableHead>
                                                  <TableHead>Ngân hàng</TableHead>
                                                  <TableHead>Hạn trả</TableHead>
                                                  <TableHead className="text-right">Tiền cọc</TableHead>
                                                  <TableHead>Trạng thái</TableHead>
                                                  <TableHead className="text-right">Thao tác</TableHead>
                                             </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {isLoading ? (
                                                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Đang tải...</TableCell></TableRow>
                                             ) : depositPayouts.length === 0 ? (
                                                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Không có tiền cọc đến hạn trả.</TableCell></TableRow>
                                             ) : depositPayouts.map((item) => (
                                                  <TableRow key={item.contractId}>
                                                       <TableCell>
                                                            <p className="font-medium">{item.recipientFullName}</p>
                                                            <p className="text-xs text-muted-foreground">{item.recipientPhone || "-"}</p>
                                                       </TableCell>
                                                       <TableCell>{item.contractNumber}</TableCell>
                                                       <TableCell>{item.apartmentNumber}</TableCell>
                                                       <TableCell>
                                                            <p>{item.recipientBankName || "-"}</p>
                                                            <p className="text-xs text-muted-foreground">{item.recipientBankAccountNumber || "-"}</p>
                                                       </TableCell>
                                                       <TableCell>{formatDateTime(item.dueDate)}</TableCell>
                                                       <TableCell className="text-right font-semibold">{toMoney(item.payoutAmount)}</TableCell>
                                                       <TableCell><Badge className={`${getStatusClass(item.status)} border`}>{getStatusLabel(item.status)}</Badge></TableCell>
                                                       <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                 <Button size="sm" variant="outline" onClick={() => setDetailTarget({ kind: "deposit", item })}>
                                                                      Chi tiết
                                                                 </Button>
                                                                 <Button size="sm" onClick={() => openConfirm({ kind: "deposit", item })} disabled={isConfirming}>
                                                                      Xác nhận
                                                                 </Button>
                                                            </div>
                                                       </TableCell>
                                                  </TableRow>
                                             ))}
                                        </TableBody>
                                   </Table>
                              </CardContent>
                         </Card>
                    </TabsContent>
               </Tabs>

               <Dialog open={!!target} onOpenChange={(open) => !open && resetDialog()}>
                    <DialogContent className="sm:max-w-xl">
                         <DialogHeader>
                              <DialogTitle>{target?.kind === "deposit" ? "Xác nhận trả tiền cọc" : "Xác nhận chi trả doanh thu"}</DialogTitle>
                              <DialogDescription>
                                   Upload ảnh minh chứng và thông tin giao dịch sau khi đã chuyển khoản.
                              </DialogDescription>
                         </DialogHeader>

                         <div className="space-y-3 text-sm">
                              <div className="rounded-lg border bg-muted/30 p-3">
                                   {target?.kind === "partner" ? (
                                        <>
                                             <p><span className="text-muted-foreground">Đối tác:</span> {target.item.partnerCompanyName || target.item.partnerName}</p>
                                             <p><span className="text-muted-foreground">Ngân hàng:</span> {target.item.bankName || "-"}</p>
                                             <p><span className="text-muted-foreground">STK:</span> {target.item.bankAccountNumber || "-"}</p>
                                             <p><span className="text-muted-foreground">Tháng:</span> {target.item.payoutMonth}</p>
                                             <p><span className="text-muted-foreground">Số tiền:</span> {toMoney(target.item.payoutAmount)}</p>
                                        </>
                                   ) : target?.kind === "deposit" ? (
                                        <>
                                             <p><span className="text-muted-foreground">Người nhận:</span> {target.item.recipientFullName}</p>
                                             <p><span className="text-muted-foreground">Ngân hàng:</span> {target.item.recipientBankName || "-"}</p>
                                             <p><span className="text-muted-foreground">STK:</span> {target.item.recipientBankAccountNumber || "-"}</p>
                                             <p><span className="text-muted-foreground">Hợp đồng:</span> {target.item.contractNumber}</p>
                                             <p><span className="text-muted-foreground">Số tiền:</span> {toMoney(target.item.payoutAmount)}</p>
                                        </>
                                   ) : null}
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                   <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Mã giao dịch</p>
                                        <Input value={transferReference} onChange={(event) => setTransferReference(event.target.value)} placeholder="VD: MB-TRX-000321" />
                                   </div>
                                   <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Ảnh minh chứng *</p>
                                        <Input type="file" accept="image/*" onChange={(event) => setTransferProof(event.target.files?.[0] ?? null)} />
                                   </div>
                              </div>

                              {target?.kind === "deposit" ? (
                                   <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Lý do hoàn cọc</p>
                                        <Input value={refundReason} onChange={(event) => setRefundReason(event.target.value)} />
                                   </div>
                              ) : null}

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Ghi chú</p>
                                   <Textarea value={transferNote} onChange={(event) => setTransferNote(event.target.value)} rows={3} />
                              </div>
                         </div>

                         <DialogFooter>
                              <Button variant="outline" onClick={resetDialog} disabled={isConfirming}>Hủy</Button>
                              <Button onClick={handleConfirm} disabled={isConfirming || !transferProof}>
                                   {isConfirming ? "Đang xác nhận..." : "Xác nhận đã chuyển"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>

               <Dialog open={!!detailTarget} onOpenChange={(open) => !open && setDetailTarget(null)}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                         <DialogHeader>
                              <DialogTitle>{detailTarget?.kind === "deposit" ? "Chi tiết hoàn tiền cọc" : "Chi tiết chi trả đối tác"}</DialogTitle>
                              <DialogDescription>Thông tin đầy đủ theo dữ liệu API trả về.</DialogDescription>
                         </DialogHeader>

                         {detailTarget?.kind === "partner" ? (
                              <div className="space-y-4">
                                   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <DetailItem label="Payout ID" value={detailTarget.item.payoutId} />
                                        <DetailItem label="Partner ID" value={detailTarget.item.partnerId} />
                                        <DetailItem label="Tên đối tác" value={detailTarget.item.partnerName} />
                                        <DetailItem label="Công ty" value={detailTarget.item.partnerCompanyName} />
                                        <DetailItem label="Ngân hàng" value={detailTarget.item.bankName} />
                                        <DetailItem label="STK" value={detailTarget.item.bankAccountNumber} />
                                        <DetailItem label="Điều khoản thanh toán" value={detailTarget.item.paymentTerms} />
                                        <DetailItem label="Tháng chi trả" value={detailTarget.item.payoutMonth} />
                                        <DetailItem label="Bắt đầu kỳ" value={formatDateTime(detailTarget.item.billingPeriodStart)} />
                                        <DetailItem label="Kết thúc kỳ" value={formatDateTime(detailTarget.item.billingPeriodEndExclusive)} />
                                        <DetailItem label="Hạn trả" value={formatDateTime(detailTarget.item.dueDate)} />
                                        <DetailItem label="Doanh thu gộp" value={toMoney(detailTarget.item.grossRevenue)} />
                                        <DetailItem label="Hoa hồng" value={toMoney(detailTarget.item.commissionAmount)} />
                                        <DetailItem label="Tỷ lệ hoa hồng" value={`${detailTarget.item.effectiveCommissionRate}%`} />
                                        <DetailItem label="Số tiền chi trả" value={toMoney(detailTarget.item.payoutAmount)} />
                                        <DetailItem label="Tiền tệ" value={detailTarget.item.currency} />
                                        <DetailItem label="Trạng thái" value={getStatusLabel(detailTarget.item.status)} />
                                        <DetailItem label="Đến hạn" value={detailTarget.item.isDue} />
                                        <DetailItem label="Mã giao dịch" value={detailTarget.item.transferReference} />
                                        <DetailItem label="Ghi chú" value={detailTarget.item.transferNote} />
                                        <DetailItem label="Xác nhận lúc" value={detailTarget.item.confirmedAt ? formatDateTime(detailTarget.item.confirmedAt) : null} />
                                        <DetailItem label="Staff xác nhận" value={detailTarget.item.confirmedByStaffId} />
                                   </div>
                                   {detailTarget.item.transferProofUrl ? (
                                        <a className="text-sm font-medium text-blue-600 hover:underline" href={detailTarget.item.transferProofUrl} target="_blank" rel="noreferrer">
                                             Xem ảnh minh chứng chuyển khoản
                                        </a>
                                   ) : null}
                              </div>
                         ) : detailTarget?.kind === "deposit" ? (
                              <div className="space-y-4">
                                   <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <DetailItem label="Payout Payment ID" value={detailTarget.item.payoutPaymentId} />
                                        <DetailItem label="Contract ID" value={detailTarget.item.contractId} />
                                        <DetailItem label="Mã hợp đồng" value={detailTarget.item.contractNumber} />
                                        <DetailItem label="Apartment ID" value={detailTarget.item.apartmentId} />
                                        <DetailItem label="Căn hộ" value={detailTarget.item.apartmentNumber} />
                                        <DetailItem label="Recipient User ID" value={detailTarget.item.recipientUserId} />
                                        <DetailItem label="Người nhận" value={detailTarget.item.recipientFullName} />
                                        <DetailItem label="Số điện thoại" value={detailTarget.item.recipientPhone} />
                                        <DetailItem label="Ngân hàng" value={detailTarget.item.recipientBankName} />
                                        <DetailItem label="STK" value={detailTarget.item.recipientBankAccountNumber} />
                                        <DetailItem label="Tháng chi trả" value={detailTarget.item.payoutMonth} />
                                        <DetailItem label="Ngày kết thúc HĐ" value={formatDateTime(detailTarget.item.contractEndDate)} />
                                        <DetailItem label="Hạn trả" value={formatDateTime(detailTarget.item.dueDate)} />
                                        <DetailItem label="Tiền cọc" value={toMoney(detailTarget.item.depositAmount)} />
                                        <DetailItem label="Số tiền chi trả" value={toMoney(detailTarget.item.payoutAmount)} />
                                        <DetailItem label="Tiền tệ" value={detailTarget.item.currency} />
                                        <DetailItem label="Trạng thái" value={getStatusLabel(detailTarget.item.status)} />
                                        <DetailItem label="Đến hạn" value={detailTarget.item.isDue} />
                                        <DetailItem label="Mã giao dịch" value={detailTarget.item.transferReference} />
                                        <DetailItem label="Ghi chú" value={detailTarget.item.transferNote} />
                                        <DetailItem label="Xác nhận lúc" value={detailTarget.item.confirmedAt ? formatDateTime(detailTarget.item.confirmedAt) : null} />
                                        <DetailItem label="Staff xác nhận" value={detailTarget.item.confirmedByStaffId} />
                                   </div>
                                   {detailTarget.item.transferProofUrl ? (
                                        <a className="text-sm font-medium text-blue-600 hover:underline" href={detailTarget.item.transferProofUrl} target="_blank" rel="noreferrer">
                                             Xem ảnh minh chứng chuyển khoản
                                        </a>
                                   ) : null}
                              </div>
                         ) : null}
                    </DialogContent>
               </Dialog>
          </div>
     )
}
