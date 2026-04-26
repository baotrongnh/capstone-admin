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
import { useActivityLogs } from "@/hooks/query/useActivityLogs"
import { toEndOfDayIso, toInputDate, toStartOfDayIso } from "@/utils/date-utils"
import { formatDateTime } from "@/utils/format"

const ALL_VALUE = "__all__"

const STATUS_LABELS: Record<string, string> = {
     success: "Thành công",
     failed: "Thất bại",
     error: "Lỗi",
}

const getStatusBadgeClass = (status?: string | null) => {
     switch (status) {
          case "success":
               return "border-emerald-200 bg-emerald-100 text-emerald-700"
          case "failed":
          case "error":
               return "border-rose-200 bg-rose-100 text-rose-700"
          default:
               return "border-slate-200 bg-slate-100 text-slate-700"
     }
}

const getStatusLabel = (status?: string | null) => {
     if (!status) return "-"
     return STATUS_LABELS[status] || status
}

export default function AdminActivityLogsPage() {
     const now = new Date()
     const defaultFrom = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1))
     const defaultTo = toInputDate(now)

     const [actorType, setActorType] = useState(ALL_VALUE)
     const [actorId, setActorId] = useState("")
     const [fromDate, setFromDate] = useState(defaultFrom)
     const [toDate, setToDate] = useState(defaultTo)

     const query = useMemo(
          () => ({
               actorType: actorType === ALL_VALUE ? undefined : (actorType as "guest" | "user" | "staff" | "operator" | "admin" | "system"),
               actorId: actorId.trim() || undefined,
               startDate: fromDate ? toStartOfDayIso(fromDate) : undefined,
               endDate: toDate ? toEndOfDayIso(toDate) : undefined,
          }),
          [actorType, actorId, fromDate, toDate],
     )

     const { data, isLoading, isError, refetch } = useActivityLogs(query)
     const logs = data?.data ?? []

     const resetFilters = () => {
          setActorType(ALL_VALUE)
          setActorId("")
          setFromDate(defaultFrom)
          setToDate(defaultTo)
     }

     return (
          <div className="@container/main flex flex-1 flex-col gap-2">
               <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <div className="px-4 lg:px-6">
                         <div className="rounded-2xl border border-border/70 bg-linear-to-r from-slate-500/10 via-background to-sky-500/10 p-5">
                              <h1 className="text-xl font-semibold tracking-tight">Activity Logs</h1>
                              <p className="mt-1 text-sm text-muted-foreground">
                                   Theo dõi lịch sử thao tác của hệ thống, admin, operator, staff và người dùng.
                              </p>
                         </div>
                    </div>

                    <div className="px-4 lg:px-6">
                         <Card className="border-border/70">
                              <CardHeader className="px-4 py-3">
                                   <div className="flex flex-wrap items-center gap-2">
                                        <CardTitle className="mr-2 text-sm font-medium">Bộ lọc</CardTitle>
                                        <Select value={actorType} onValueChange={setActorType}>
                                             <SelectTrigger className="h-8 w-[140px] text-xs">
                                                  <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  <SelectItem value={ALL_VALUE}>Tất cả</SelectItem>
                                                  <SelectItem value="admin">Admin</SelectItem>
                                                  <SelectItem value="operator">Operator</SelectItem>
                                                  <SelectItem value="staff">Staff</SelectItem>
                                                  <SelectItem value="user">User</SelectItem>
                                                  <SelectItem value="guest">Guest</SelectItem>
                                                  <SelectItem value="system">System</SelectItem>
                                             </SelectContent>
                                        </Select>
                                        <Input className="h-8 w-[180px] text-xs" value={actorId} onChange={(event) => setActorId(event.target.value)} placeholder="Actor ID" />
                                        <Input className="h-8 w-[140px] text-xs" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} aria-label="Từ ngày" />
                                        <Input className="h-8 w-[140px] text-xs" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} aria-label="Đến ngày" />
                                        <div className="ml-auto flex gap-2">
                                             <Button className="h-8 px-3 text-xs" variant="outline" onClick={resetFilters}>Đặt lại</Button>
                                             <Button className="h-8 px-3 text-xs" onClick={() => refetch()}>Làm mới</Button>
                                        </div>
                                   </div>
                              </CardHeader>
                         </Card>
                    </div>

                    {isError ? (
                         <div className="mx-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
                              <AlertCircle className="h-4 w-4" />
                              Không thể tải activity logs. Vui lòng thử lại.
                         </div>
                    ) : null}

                    <div className="px-4 lg:px-6">
                         <Card className="border-border/70">
                              <CardHeader className="flex flex-row items-center justify-between">
                                   <CardTitle className="text-base">Danh sách hoạt động</CardTitle>
                                   <div className="text-sm text-muted-foreground">{logs.length} bản ghi</div>
                              </CardHeader>
                              <CardContent>
                                   <Table>
                                        <TableHeader>
                                             <TableRow>
                                                  <TableHead>Thời gian</TableHead>
                                                  <TableHead>Actor type</TableHead>
                                                  <TableHead>Actor ID</TableHead>
                                                  <TableHead>Action</TableHead>
                                                  <TableHead>Entity</TableHead>
                                                  <TableHead>Mô tả</TableHead>
                                                  <TableHead>Trạng thái</TableHead>
                                             </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                             {isLoading ? (
                                                  Array.from({ length: 8 }).map((_, index) => (
                                                       <TableRow key={index}>
                                                            <TableCell colSpan={7}>
                                                                 <Skeleton className="h-8 w-full" />
                                                            </TableCell>
                                                       </TableRow>
                                                  ))
                                             ) : logs.length > 0 ? (
                                                  logs.map((item) => (
                                                       <TableRow key={item.id}>
                                                            <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                                                            <TableCell>{item.actorType || "-"}</TableCell>
                                                            <TableCell className="max-w-48 truncate">{item.actorId || "-"}</TableCell>
                                                            <TableCell>{item.action || "-"}</TableCell>
                                                            <TableCell className="max-w-48 truncate">
                                                                 {item.entityType ? `${item.entityType}${item.entityId ? ` · ${item.entityId}` : ""}` : "-"}
                                                            </TableCell>
                                                            <TableCell className="max-w-96 whitespace-normal text-sm text-muted-foreground">
                                                                 {item.description || item.errorMessage || "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                 <Badge className={`${getStatusBadgeClass(item.status)} border`}>
                                                                      {getStatusLabel(item.status)}
                                                                 </Badge>
                                                            </TableCell>
                                                       </TableRow>
                                                  ))
                                             ) : (
                                                  <TableRow>
                                                       <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                                            Không có activity log phù hợp với bộ lọc hiện tại.
                                                       </TableCell>
                                                  </TableRow>
                                             )}
                                        </TableBody>
                                   </Table>
                              </CardContent>
                         </Card>
                    </div>
               </div>
          </div>
     )
}

