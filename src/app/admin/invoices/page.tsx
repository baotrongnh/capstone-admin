"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMonthlyUtilityInvoices } from "@/hooks/query/useInvoices"
import type { components } from "@/types/api"
import { formatDateTime, formatVND } from "@/utils/format"

type UtilityBreakdown = components["schemas"]["MonthlyUtilityBreakdownDto"]

const DEFAULT_LIMIT = "12"
const LOADING_ROWS = Array.from({ length: 6 })

const STATUS_LABELS: Record<string, string> = {
     draft: "Nháp",
     issued: "Đã phát hành",
     paid: "Đã thanh toán",
     overdue: "Quá hạn",
     cancelled: "Đã hủy",
}

const STATUS_CLASSES: Record<string, string> = {
     draft: "border-slate-200 bg-slate-100 text-slate-700",
     issued: "border-blue-200 bg-blue-100 text-blue-700",
     paid: "border-emerald-200 bg-emerald-100 text-emerald-700",
     overdue: "border-red-200 bg-red-100 text-red-700",
     cancelled: "border-zinc-200 bg-zinc-100 text-zinc-700",
}

const formatMoney = (value?: string | number | null) => (value ? formatVND(value, true) : "-")

const formatNumber = (value?: string | number | null) => {
     if (value === null || value === undefined || value === "") return "-"
     const number = Number(value)
     return Number.isNaN(number) ? String(value) : number.toLocaleString("vi-VN")
}

const StatusBadge = ({ status }: { status?: string | null }) => (
     <Badge className={`${STATUS_CLASSES[status || ""] || "border-border bg-muted text-muted-foreground"} border`}>
          {status ? STATUS_LABELS[status] || status : "-"}
     </Badge>
)

const BreakdownCell = ({ value }: { value?: UtilityBreakdown | null }) => {
     if (!value) return <span className="text-muted-foreground">-</span>

     return (
          <div className="min-w-40 space-y-1 text-xs">
               <p className="font-medium">{formatMoney(value.amount)}</p>
               <p className="text-muted-foreground">
                    {formatNumber(value.previousReading)} → {formatNumber(value.currentReading)} ({formatNumber(value.consumption)} {value.unit || ""})
               </p>
               <p className="text-muted-foreground">Đơn giá: {formatMoney(value.ratePerUnit)}</p>
          </div>
     )
}

export default function AdminInvoicesPage() {
     const [page, setPage] = useState(1)
     const [limit, setLimit] = useState(DEFAULT_LIMIT)
     const { data, isLoading, isFetching, isError, refetch } = useMonthlyUtilityInvoices({ page, limit: Number(limit) })
     const invoices = data?.items ?? []
     const totalPages = data?.totalPages ?? 1
     const totalItems = data?.total ?? 0

     const resetFilters = () => {
          setPage(1)
          setLimit(DEFAULT_LIMIT)
     }

     return (
          <div className="space-y-4 p-4">
               <div>
                    <h1 className="text-2xl font-bold text-foreground">Hóa đơn điện/nước</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Danh sách hóa đơn điện/nước theo tháng.</p>
               </div>

               <Card className="border-border/70">
                    <CardHeader className="px-4 py-3">
                         <div className="flex flex-wrap items-center gap-2">
                              <CardTitle className="mr-2 text-sm font-medium">Bộ lọc</CardTitle>
                              <Select
                                   value={limit}
                                   onValueChange={(value) => {
                                        setLimit(value)
                                        setPage(1)
                                   }}
                              >
                                   <SelectTrigger className="h-8 w-32.5 text-xs">
                                        <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="12">12 dòng</SelectItem>
                                        <SelectItem value="20">20 dòng</SelectItem>
                                        <SelectItem value="50">50 dòng</SelectItem>
                                   </SelectContent>
                              </Select>
                              <Button className="h-8 px-3 text-xs" variant="outline" onClick={resetFilters}>Đặt lại</Button>
                              <Button className="h-8 px-3 text-xs" variant="outline" onClick={() => refetch()} disabled={isFetching}>Làm mới</Button>
                              <p className="text-sm text-muted-foreground">Trang {page}/{Math.max(totalPages, 1)}</p>
                         </div>
                    </CardHeader>
               </Card>

               {isError ? (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                         <AlertCircle className="size-4" />
                         Không thể tải hóa đơn điện/nước.
                    </div>
               ) : null}

               <Card>
                    <CardHeader>
                         <CardTitle className="text-base">Danh sách hóa đơn</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                              <TableHeader>
                                   <TableRow>
                                        <TableHead>Hóa đơn</TableHead>
                                        <TableHead>Căn hộ</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Điện</TableHead>
                                        <TableHead>Nước</TableHead>
                                        <TableHead className="text-right">Tổng</TableHead>
                                        <TableHead>Thanh toán</TableHead>
                                   </TableRow>
                              </TableHeader>
                              <TableBody>
                                   {isLoading ? (
                                        LOADING_ROWS.map((_, index) => (
                                             <TableRow key={index}>
                                                  <TableCell colSpan={7}>
                                                       <Skeleton className="h-8 w-full" />
                                                  </TableCell>
                                             </TableRow>
                                        ))
                                   ) : invoices.length > 0 ? (
                                        invoices.map((invoice) => (
                                             <TableRow key={invoice.invoiceId}>
                                                  <TableCell>
                                                       <p className="font-medium">{invoice.invoiceNumber}</p>
                                                       <p className="text-xs text-muted-foreground">{invoice.billingMonth || "-"}</p>
                                                  </TableCell>
                                                  <TableCell>
                                                       <p className="font-medium">{invoice.apartment?.apartmentNumber || "-"}</p>
                                                       <p className="text-xs text-muted-foreground">{invoice.contract?.contractNumber || "-"}</p>
                                                  </TableCell>
                                                  <TableCell><StatusBadge status={invoice.status} /></TableCell>
                                                  <TableCell><BreakdownCell value={invoice.electricity} /></TableCell>
                                                  <TableCell><BreakdownCell value={invoice.water} /></TableCell>
                                                  <TableCell className="text-right font-semibold">{formatMoney(invoice.totalUtilityAmount)}</TableCell>
                                                  <TableCell>{invoice.paidAt ? formatDateTime(invoice.paidAt) : "Chưa thanh toán"}</TableCell>
                                             </TableRow>
                                        ))
                                   ) : (
                                        <TableRow>
                                             <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                  Không có hóa đơn điện/nước.
                                             </TableCell>
                                        </TableRow>
                                   )}
                              </TableBody>
                         </Table>

                         <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm text-muted-foreground">
                                   Hiển thị {invoices.length} / {totalItems.toLocaleString("vi-VN")} hóa đơn
                              </p>
                              <div className="flex items-center gap-2">
                                   <Button variant="outline" onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page <= 1 || isLoading}>
                                        Trang trước
                                   </Button>
                                   <Button
                                        variant="outline"
                                        onClick={() => setPage((prev) => Math.min(prev + 1, Math.max(totalPages, 1)))}
                                        disabled={page >= Math.max(totalPages, 1) || isLoading}
                                   >
                                        Trang sau
                                   </Button>
                              </div>
                         </div>
                    </CardContent>
               </Card>
          </div>
     )
}
