"use client"

import { useMemo, useState } from "react"
import { AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRevenueOverview } from "@/hooks/query/useRevenues"
import type { RevenueOverviewData } from "@/types/revenue"
import { toEndOfDayIso, toInputDate, toStartOfDayIso } from "@/utils/date-utils"
import { formatDateTime, formatVND } from "@/utils/format"

const INVOICE_TYPE_LABELS: Record<string, string> = {
     rent: "Tiền thuê",
     deposit: "Đặt cọc",
     contractDeposit: "Đặt cọc hợp đồng",
     utility: "Tiện ích",
     service: "Dịch vụ",
     penalty: "Phạt",
     other: "Khác",
}

const getInvoiceTypeLabel = (value?: string | null) => {
     if (!value) return "-"
     return INVOICE_TYPE_LABELS[value] || value
}

const getInvoiceScopeLabel = (isPartnerApartment?: boolean) => {
     return isPartnerApartment ? "Đối tác" : "Hệ thống"
}

const getInvoiceScopeBadgeClass = (isPartnerApartment?: boolean) =>
     isPartnerApartment
          ? "border-amber-200 bg-amber-100 text-amber-700"
          : "border-cyan-200 bg-cyan-100 text-cyan-700"

const SummaryCard = ({
     title,
     value,
     isLoading,
}: {
     title: string
     value: string
     isLoading?: boolean
}) => (
     <Card className="border-border/70">
          <CardContent className="p-4">
               <p className="text-xs text-muted-foreground">{title}</p>
               {isLoading ? (
                    <Skeleton className="mt-2 h-8 w-28" />
               ) : (
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
               )}
          </CardContent>
     </Card>
)

export default function AdminInvoicesPage() {
     const now = new Date()
     const defaultFrom = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1))
     const defaultTo = toInputDate(now)

     const [appliedFrom, setAppliedFrom] = useState(defaultFrom)
     const [appliedTo, setAppliedTo] = useState(defaultTo)
     const [page, setPage] = useState(1)
     const [limit, setLimit] = useState("20")

     const query = useMemo(
          () => ({
               from: toStartOfDayIso(appliedFrom),
               to: toEndOfDayIso(appliedTo),
               page,
               limit: Number(limit),
          }),
          [appliedFrom, appliedTo, page, limit],
     )

     const { data, isLoading, isError } = useRevenueOverview(query)

     const resetRange = () => {
          setAppliedFrom(defaultFrom)
          setAppliedTo(defaultTo)
          setPage(1)
     }

     const resetFilters = () => {
          setPage(1)
          setLimit("20")
          resetRange()
     }

     const overview = data ?? ({
          invoiceCount: 0,
          totalInvoiceAmount: 0,
          totalSystemRevenue: 0,
          totalPartnerGrossRevenue: 0,
          totalPartnerNetPayout: 0,
          invoices: [],
          page: 1,
          limit: 20,
          totalPages: 0,
     } satisfies RevenueOverviewData)

     return (
          <div className="@container/main flex flex-1 flex-col gap-2">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                         <div className="rounded-2xl border border-border/70 bg-linear-to-r from-sky-500/10 via-background to-cyan-500/10 p-5">
                              <h1 className="text-xl font-semibold tracking-tight">Quản lý hóa đơn</h1>
                              <p className="mt-1 text-sm text-muted-foreground">
                                   Theo dõi danh sách hóa đơn đã thanh toán và phần phân bổ doanh thu theo đúng dữ liệu từ hệ thống.
                              </p>
                         </div>
                    </div>

                    <div className="px-4 lg:px-6">
                         <Card className="border-border/70">
                              <CardHeader className="px-4 py-3">
                                   <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="mr-2 text-sm font-medium">Bộ lọc</CardTitle>
                                        <Input
                                             className="h-8 w-[140px] text-xs"
                                             type="date"
                                             value={appliedFrom}
                                             onChange={(event) => {
                                                  setAppliedFrom(event.target.value)
                                                  setPage(1)
                                             }}
                                             aria-label="Từ ngày"
                                        />
                                        <Input
                                             className="h-8 w-[140px] text-xs"
                                             type="date"
                                             value={appliedTo}
                                             onChange={(event) => {
                                                  setAppliedTo(event.target.value)
                                                  setPage(1)
                                             }}
                                             aria-label="Đến ngày"
                                        />
                                        <Select
                                             value={limit}
                                             onValueChange={(value) => {
                                                  setLimit(value)
                                                  setPage(1)
                                             }}
                                        >
                                             <SelectTrigger className="h-8 w-[130px] text-xs">
                                                  <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  <SelectItem value="10">10 dòng</SelectItem>
                                                  <SelectItem value="20">20 dòng</SelectItem>
                                                  <SelectItem value="50">50 dòng</SelectItem>
                                             </SelectContent>
                                        </Select>
                                        <Button className="ml-auto h-8 px-3 text-xs" variant="outline" onClick={resetFilters}>
                                             Đặt lại
                                        </Button>
                                   </div>
                              </CardHeader>
                         </Card>
                    </div>

                    {isError ? (
                         <div className="mx-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
                              <AlertCircle className="h-4 w-4" />
                              Không thể tải dữ liệu hóa đơn. Vui lòng thử lại.
                         </div>
                    ) : null}

                    <div className="grid gap-4 px-4 lg:px-6 md:grid-cols-2 xl:grid-cols-4">
                         <SummaryCard
                              title="Số hóa đơn"
                              value={overview.invoiceCount.toLocaleString("vi-VN")}
                              isLoading={isLoading}
                         />
                         <SummaryCard
                              title="Tổng giá trị hóa đơn"
                              value={formatVND(overview.totalInvoiceAmount, true)}
                              isLoading={isLoading}
                         />
                         <SummaryCard
                              title="Doanh thu hệ thống"
                              value={formatVND(overview.totalSystemRevenue, true)}
                              isLoading={isLoading}
                         />
                         <SummaryCard
                              title="Chi trả đối tác"
                              value={formatVND(overview.totalPartnerNetPayout, true)}
                              isLoading={isLoading}
                         />
                    </div>

                    <div className="px-4 lg:px-6">
                         <Card className="border-border/70">
                              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                   <div>
                                        <CardTitle className="text-base">Danh sách hóa đơn đã ghi nhận doanh thu</CardTitle>
                                   </div>
                                   <div className="text-sm text-muted-foreground">
                                        Trang {overview.page}/{Math.max(overview.totalPages, 1)}
                                   </div>
                              </CardHeader>

                              <CardContent>
                                   <Table>
                                        <TableHeader>
                                             <TableRow>
                                                  <TableHead>Mã hóa đơn</TableHead>
                                                  <TableHead>Loại</TableHead>
                                                  <TableHead>Căn hộ</TableHead>
                                                  <TableHead>Hợp đồng</TableHead>
                                                  <TableHead>Đối tác</TableHead>
                                                  <TableHead>Phạm vi</TableHead>
                                                  <TableHead>Ngày thanh toán</TableHead>
                                                  <TableHead className="text-right">Giá trị</TableHead>
                                                  <TableHead className="text-right">DT hệ thống</TableHead>
                                                  <TableHead className="text-right">DT đối tác</TableHead>
                                                  <TableHead className="text-right">Chi trả đối tác</TableHead>
                                             </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {isLoading ? (
                                                  Array.from({ length: 6 }).map((_, index) => (
                                                       <TableRow key={index}>
                                                            <TableCell colSpan={11}>
                                                                 <Skeleton className="h-8 w-full" />
                                                            </TableCell>
                                                       </TableRow>
                                                  ))
                                             ) : overview.invoices.length > 0 ? (
                                                  overview.invoices.map((invoice: RevenueOverviewData["invoices"][number]) => (
                                                       <TableRow key={invoice.invoiceId}>
                                                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                                            <TableCell>{getInvoiceTypeLabel(invoice.invoiceType)}</TableCell>
                                                            <TableCell>
                                                                 <div className="space-y-1">
                                                                      <p className="font-medium">{invoice.apartment.apartmentNumber}</p>
                                                                      <p className="text-xs text-muted-foreground">{invoice.apartment.buildingName || "-"}</p>
                                                                 </div>
                                                            </TableCell>
                                                            <TableCell>{invoice.contract.contractNumber}</TableCell>
                                                            <TableCell>
                                                                 {invoice.partner ? (
                                                                      <div className="space-y-1">
                                                                           <p className="font-medium">{invoice.partner.companyName || invoice.partner.fullName}</p>
                                                                           <p className="text-xs text-muted-foreground">{invoice.partner.fullName}</p>
                                                                      </div>
                                                                 ) : (
                                                                      "-"
                                                                 )}
                                                            </TableCell>
                                                            <TableCell>
                                                                 <Badge className={`${getInvoiceScopeBadgeClass(invoice.isPartnerApartment)} border`}>
                                                                      {getInvoiceScopeLabel(invoice.isPartnerApartment)}
                                                                 </Badge>
                                                            </TableCell>
                                                            <TableCell>{formatDateTime(invoice.invoicePaidAt)}</TableCell>
                                                            <TableCell className="text-right font-medium">{formatVND(invoice.invoiceAmount, true)}</TableCell>
                                                            <TableCell className="text-right">{formatVND(invoice.systemRevenueAmount, true)}</TableCell>
                                                            <TableCell className="text-right">{formatVND(invoice.partnerGrossRevenueAmount, true)}</TableCell>
                                                            <TableCell className="text-right">{formatVND(invoice.partnerNetPayoutAmount, true)}</TableCell>
                                                       </TableRow>
                                                  ))
                                             ) : (
                                                  <TableRow>
                                                       <TableCell colSpan={11} className="py-8 text-center text-muted-foreground">
                                                            Không có hóa đơn phù hợp với bộ lọc hiện tại.
                                                       </TableCell>
                                                  </TableRow>
                                             )}
                                        </TableBody>
                                   </Table>

                                   <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-muted-foreground">
                                             Hiển thị {overview.invoices.length} hóa đơn trong trang hiện tại
                                        </p>

                                        <div className="flex items-center gap-2">
                                             <Button
                                                  variant="outline"
                                                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                                  disabled={page <= 1 || isLoading}
                                             >
                                                  Trang trước
                                             </Button>
                                             <Button
                                                  variant="outline"
                                                  onClick={() => setPage((prev) => Math.min(prev + 1, Math.max(overview.totalPages, 1)))}
                                                  disabled={page >= Math.max(overview.totalPages, 1) || isLoading}
                                             >
                                                  Trang sau
                                             </Button>
                                        </div>
                                   </div>
                              </CardContent>
                         </Card>
                    </div>
               </div>
          </div>
     )
}
