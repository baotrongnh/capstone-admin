"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Modal } from "antd"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useApartments } from "@/hooks/query/useApartments"
import { useApartmentPolicies, useDeleteApartmentPolicy } from "@/hooks/query/useSystemConfig"
import type { ApartmentItem } from "@/types/apartment"
import type { components } from "@/types/api"
import { formatDateTime } from "@/utils/format"

const ALL = "__all__"
const LOADING_ROWS = Array.from({ length: 6 })

type ApartmentPolicyItem = components["schemas"]["ApartmentPolicyListItemDto"]

const apartmentLabel = (apartment?: ApartmentItem) =>
     apartment ? `${apartment.apartmentNumber}${apartment.buildingName ? ` - ${apartment.buildingName}` : ""}` : "-"

const requiredClass = (required?: boolean) =>
     required ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700"

export function ApartmentPolicyTable({ dialog }: { dialog: { create: () => void; edit: (id: string) => void } }) {
     const [apartmentFilter, setApartmentFilter] = useState(ALL)
     const [requiredFilter, setRequiredFilter] = useState(ALL)
     const [policyIdFilter, setPolicyIdFilter] = useState("")

     const apartmentQuery = useApartments({ page: 1, limit: 100 })
     const apartments = apartmentQuery.data?.data ?? []
     const apartmentMap = new Map(apartments.map((apartment) => [apartment.id, apartment]))

     const policyQuery = useApartmentPolicies({
          apartmentId: apartmentFilter === ALL ? undefined : apartmentFilter,
          policyId: policyIdFilter.trim() || undefined,
          isRequired: requiredFilter === ALL ? undefined : requiredFilter === "true",
     })
     const policies = policyQuery.data?.data ?? []
     const deletePolicy = useDeleteApartmentPolicy()
     const isLoading = apartmentQuery.isLoading || policyQuery.isLoading

     const reset = () => {
          setApartmentFilter(ALL)
          setRequiredFilter(ALL)
          setPolicyIdFilter("")
     }

     const confirmDelete = (policy: ApartmentPolicyItem) => {
          Modal.confirm({
               title: "Xác nhận xóa policy",
               content: `Xóa policy "${policy.policyId}" khỏi căn hộ "${apartmentLabel(apartmentMap.get(policy.apartmentId))}"?`,
               okText: "Xóa",
               cancelText: "Hủy",
               okButtonProps: { danger: true },
               onOk: () => deletePolicy.mutateAsync(policy.id),
          })
     }

     return (
          <Card className="border-border/70">
               <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base">Policy căn hộ</CardTitle>
                    <Button onClick={dialog.create}>Thêm policy</Button>
               </CardHeader>

               <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-4">
                         <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                   <SelectItem value={ALL}>Tất cả căn hộ</SelectItem>
                                   {apartments.map((apartment) => (
                                        <SelectItem key={apartment.id} value={apartment.id}>{apartmentLabel(apartment)}</SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>

                         <Input value={policyIdFilter} onChange={(event) => setPolicyIdFilter(event.target.value)} placeholder="Policy ID" />

                         <Select value={requiredFilter} onValueChange={setRequiredFilter}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                   <SelectItem value={ALL}>Tất cả mức áp dụng</SelectItem>
                                   <SelectItem value="true">Bắt buộc</SelectItem>
                                   <SelectItem value="false">Tùy chọn</SelectItem>
                              </SelectContent>
                         </Select>

                         <div className="flex gap-2">
                              <Button className="flex-1" variant="outline" onClick={reset}>Đặt lại</Button>
                              <Button className="flex-1" variant="outline" onClick={() => policyQuery.refetch()}>Làm mới</Button>
                         </div>
                    </div>

                    {policyQuery.isError ? (
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
                                   <TableHead>Hiệu lực</TableHead>
                                   <TableHead>Tạo lúc</TableHead>
                                   <TableHead className="text-right">Thao tác</TableHead>
                              </TableRow>
                         </TableHeader>
                         <TableBody>
                              {isLoading ? (
                                   LOADING_ROWS.map((_, index) => (
                                        <TableRow key={index}>
                                             <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                        </TableRow>
                                   ))
                              ) : policies.length > 0 ? (
                                   policies.map((policy) => {
                                        const apartment = apartmentMap.get(policy.apartmentId)

                                        return (
                                             <TableRow key={policy.id}>
                                                  <TableCell>
                                                       <p className="font-medium">{apartment?.apartmentNumber || "-"}</p>
                                                       <p className="text-xs text-muted-foreground">{apartment?.buildingName || policy.apartmentId}</p>
                                                  </TableCell>
                                                  <TableCell className="font-mono text-xs">{policy.policyId}</TableCell>
                                                  <TableCell>
                                                       <Badge className={requiredClass(policy.isRequired)}>{policy.isRequired ? "Bắt buộc" : "Tùy chọn"}</Badge>
                                                  </TableCell>
                                                  <TableCell>
                                                       <p>{formatDateTime(policy.effectiveDate)}</p>
                                                       <p className="text-xs text-muted-foreground">Đến: {policy.expiryDate ? formatDateTime(policy.expiryDate) : "Không giới hạn"}</p>
                                                  </TableCell>
                                                  <TableCell>{formatDateTime(policy.createdAt)}</TableCell>
                                                  <TableCell className="text-right">
                                                       <div className="flex justify-end gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => dialog.edit(policy.id)}>Sửa</Button>
                                                            <Button variant="outline" size="sm" onClick={() => confirmDelete(policy)}>Xóa</Button>
                                                       </div>
                                                  </TableCell>
                                             </TableRow>
                                        )
                                   })
                              ) : (
                                   <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Không có dữ liệu.</TableCell>
                                   </TableRow>
                              )}
                         </TableBody>
                    </Table>
               </CardContent>
          </Card>
     )
}