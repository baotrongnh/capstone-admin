"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeftIcon, RefreshCcwIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ROUTE_ADMIN } from "@/constant/routes"
import { useApartments } from "@/hooks/query/useApartments"
import { useCurrentUtilityRatesByApartments } from "@/hooks/query/useIotDevices"
import type { ApartmentItem } from "@/types/apartment"
import type { components } from "@/types/api"
import { formatVND } from "@/utils/format"

type UtilityMeter = components["schemas"]["IoTUtilityMeterItemDto"]
type CurrentRates = components["schemas"]["IoTBoardMetersDto"] & { electricity?: UtilityMeter | null }

const DEFAULT_LIMIT = "20"
const LOADING_ROWS = Array.from({ length: 6 })

const formatApartmentAddress = (apartment: ApartmentItem) =>
     apartment.buildingName || apartment.streetAddress || apartment.fullAddress || "-"

const formatRate = (rate?: string | number | null) => (rate ? formatVND(rate, true) : "-")

const getElectricMeter = (rates?: CurrentRates | null) => rates?.electric ?? rates?.electricity

const RateCell = ({ meter, unit, isError }: { meter?: UtilityMeter | null; unit: string; isError?: boolean }) => {
     if (isError) return <span className="text-red-600">Lỗi tải</span>
     if (!meter) return <span className="text-muted-foreground">Chưa có</span>

     return (
          <div className="min-w-40 space-y-1 text-sm">
               <p className="font-medium">{formatRate(meter.ratePerUnit)} / {meter.unitOfMeasurement || unit}</p>
               <p className="text-xs text-muted-foreground">Đồng hồ: {meter.meterNumber || "-"}</p>
          </div>
     )
}

export default function AdminApartmentUtilityRatesPage() {
     const [keyword, setKeyword] = useState("")
     const [appliedKeyword, setAppliedKeyword] = useState("")
     const [page, setPage] = useState(1)
     const [limit, setLimit] = useState(DEFAULT_LIMIT)

     const apartmentsQuery = useApartments({ page, limit: Number(limit), keyword: appliedKeyword.trim() || undefined })
     const apartments = apartmentsQuery.data?.data ?? []
     const ratesQuery = useCurrentUtilityRatesByApartments(apartments.map((apartment) => apartment.id))
     const ratesByApartment = new Map(ratesQuery.data?.map((item) => [item.apartmentId, item]) ?? [])
     const totalPages = apartmentsQuery.data?.meta?.totalPages ?? 1
     const totalItems = apartmentsQuery.data?.meta?.total ?? apartments.length
     const isLoading = apartmentsQuery.isLoading || ratesQuery.isLoading
     const isFetching = apartmentsQuery.isFetching || ratesQuery.isFetching

     const search = () => {
          setAppliedKeyword(keyword)
          setPage(1)
     }

     const reset = () => {
          setKeyword("")
          setAppliedKeyword("")
          setLimit(DEFAULT_LIMIT)
          setPage(1)
     }

     const refresh = () => {
          void apartmentsQuery.refetch()
          void ratesQuery.refetch()
     }

     return (
          <div className="space-y-4 p-4">
               <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold text-foreground">Giá điện/nước từng căn hộ</h1>
                         <p className="mt-1 text-sm text-muted-foreground">Xem giá hiện tại của từng căn hộ.</p>
                    </div>
                    <Button variant="outline" asChild>
                         <Link href={ROUTE_ADMIN.UTILITY_RATES}>
                              <ArrowLeftIcon className="mr-1 size-4" />
                              Quay lại
                         </Link>
                    </Button>
               </div>

               <Card className="border-border/70">
                    <CardHeader className="space-y-3">
                         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <CardTitle className="text-base">Danh sách giá hiện tại</CardTitle>
                              <p className="text-sm text-muted-foreground">Trang {page}/{Math.max(totalPages, 1)}</p>
                         </div>

                         <div className="flex flex-wrap items-center gap-2">
                              <div className="relative min-w-64 flex-1">
                                   <SearchIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                   <Input
                                        value={keyword}
                                        onChange={(event) => setKeyword(event.target.value)}
                                        onKeyDown={(event) => event.key === "Enter" && search()}
                                        placeholder="Tìm căn hộ, tòa nhà, địa chỉ..."
                                        className="pl-9"
                                   />
                              </div>
                              <Select
                                   value={limit}
                                   onValueChange={(value) => {
                                        setLimit(value)
                                        setPage(1)
                                   }}
                              >
                                   <SelectTrigger className="w-32.5">
                                        <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="10">10 dòng</SelectItem>
                                        <SelectItem value="20">20 dòng</SelectItem>
                                        <SelectItem value="50">50 dòng</SelectItem>
                                   </SelectContent>
                              </Select>
                              <Button variant="outline" onClick={search}>Tìm</Button>
                              <Button variant="outline" onClick={reset}>Đặt lại</Button>
                              <Button className="ml-auto" variant="outline" onClick={refresh} disabled={isFetching}>
                                   <RefreshCcwIcon className={`mr-1 size-4 ${isFetching ? "animate-spin" : ""}`} />
                                   {isFetching ? "Đang tải..." : "Làm mới"}
                              </Button>
                         </div>
                    </CardHeader>

                    <CardContent>
                         <Table>
                              <TableHeader>
                                   <TableRow>
                                        <TableHead>Căn hộ</TableHead>
                                        <TableHead>Điện</TableHead>
                                        <TableHead>Nước</TableHead>
                                   </TableRow>
                              </TableHeader>
                              <TableBody>
                                   {isLoading ? (
                                        LOADING_ROWS.map((_, index) => (
                                             <TableRow key={index}>
                                                  <TableCell colSpan={3}>
                                                       <Skeleton className="h-8 w-full" />
                                                  </TableCell>
                                             </TableRow>
                                        ))
                                   ) : apartments.length > 0 ? (
                                        apartments.map((apartment) => {
                                             const rates = ratesByApartment.get(apartment.id)

                                             return (
                                                  <TableRow key={apartment.id}>
                                                       <TableCell>
                                                            <p className="font-medium">{apartment.apartmentNumber}</p>
                                                            <p className="text-xs text-muted-foreground">{formatApartmentAddress(apartment)}</p>
                                                       </TableCell>
                                                       <TableCell>
                                                            <RateCell meter={getElectricMeter(rates?.rates)} unit="kWh" isError={rates?.isError} />
                                                       </TableCell>
                                                       <TableCell>
                                                            <RateCell meter={rates?.rates?.water} unit="m3" isError={rates?.isError} />
                                                       </TableCell>
                                                  </TableRow>
                                             )
                                        })
                                   ) : (
                                        <TableRow>
                                             <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                                                  Không có căn hộ phù hợp.
                                             </TableCell>
                                        </TableRow>
                                   )}
                              </TableBody>
                         </Table>

                         <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm text-muted-foreground">
                                   Hiển thị {apartments.length} / {totalItems.toLocaleString("vi-VN")} căn hộ
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