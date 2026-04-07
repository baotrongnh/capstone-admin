'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "@/components/ui/table"
import { useApartments, useDeleteApartment } from "@/hooks/query/useApartments"
import type { ApartmentQueryParams } from "@/types/apartment"
import { formatStatus, formatVND } from "@/utils/format"
import { Modal, Pagination } from "antd"
import { MoreHorizontalIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMemo, useState } from "react"

export default function OperatorApartmentsPage() {
     const [currentPage, setCurrentPage] = useState(1)
     const pageSize = 10

     const params = useMemo<ApartmentQueryParams>(
          () => ({
               page: currentPage,
               limit: pageSize,
          }),
          [currentPage],
     )

     const { data: apartmentListResponse, isLoading: isListLoading } = useApartments(params)
     const deleteApartment = useDeleteApartment()
     const apartments = apartmentListResponse?.data || []
     const paginationMeta = apartmentListResponse?.meta
     const totalItems = paginationMeta?.total || 0
     const currentApiPage = paginationMeta?.page || currentPage
     const currentApiLimit = paginationMeta?.limit || pageSize
     const router = useRouter()

     const handleOpenDetail = (id: string) => {
          router.push(`/operator/apartments/${id}`)
     }

     const handleEdit = (id: string) => {
          router.push(`/operator/apartments/${id}?mode=edit`)
     }

     const getStatusBadge = (status?: string | null) => {
          const statusClassMap: Record<string, string> = {
               available: "bg-green-100 text-green-700 border-green-200",
               occupied: "bg-yellow-100 text-yellow-700 border-yellow-200",
               maintenance: "bg-amber-100 text-amber-700 border-amber-200",
               reserved: "bg-purple-100 text-purple-700 border-purple-200",
               inactive: "bg-red-100 text-red-700 border-red-200",
          }

          const className = status ? statusClassMap[status] : undefined
          return (
               <Badge className={`border ${className || "bg-muted text-muted-foreground"}`}>
                    {formatStatus(status)}
               </Badge>
          )
     }

     const handleDelete = (id: string, apartmentNumber: string) => {
          Modal.confirm({
               title: "Xác nhận xóa căn hộ",
               content: `Bạn có chắc chắn muốn xóa căn hộ ${apartmentNumber}?`,
               okText: "Xóa",
               okType: "danger",
               cancelText: "Hủy",
               async onOk() {
                    try {
                         await deleteApartment.mutateAsync(id)
                    } catch {
                         // Error toast is handled in useDeleteApartment
                    }
               },
          })
     }

     return (
          <>
               <div className="mb-4 flex justify-end">
                    <Button asChild>
                         <Link href="/operator/apartments/create">Tạo căn hộ</Link>
                    </Button>
               </div>

               <Table>
                    <TableHeader>
                         <TableRow>
                              <TableHead>Mã căn hộ</TableHead>
                              <TableHead>Ảnh</TableHead>
                              <TableHead>Tên tòa nhà</TableHead>
                              <TableHead>Diện tích</TableHead>
                              <TableHead>Giá thuê (/tháng)</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                         </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isListLoading && (
                              <TableRow>
                                   <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        Đang tải danh sách căn hộ...
                                   </TableCell>
                              </TableRow>
                         )}

                         {!isListLoading && apartments.length === 0 && (
                              <TableRow>
                                   <TableCell colSpan={8} className="text-center text-muted-foreground">
                                        Chưa có căn hộ nào.
                                   </TableCell>
                              </TableRow>
                         )}

                         {apartments.map((apt) => (
                              <TableRow key={apt.id}>
                                   <TableCell className="font-medium">{apt.apartmentNumber}</TableCell>
                                   <TableCell>
                                        {apt.images?.[0] ? (
                                             <img
                                                  src={apt.images[0]}
                                                  alt={apt.apartmentNumber}
                                                  className="h-12 w-16 rounded-md object-cover border"
                                             />
                                        ) : (
                                             <div className="h-12 w-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                                  No image
                                             </div>
                                        )}
                                   </TableCell>
                                   <TableCell>{apt.buildingName || "-"}</TableCell>
                                   <TableCell>{apt.totalArea} m²</TableCell>
                                   <TableCell>{formatVND(apt.baseRentPrice, true)}</TableCell>
                                   <TableCell>
                                        {getStatusBadge(apt.status)}
                                   </TableCell>
                                   <TableCell className="text-right">
                                        <DropdownMenu>
                                             <DropdownMenuTrigger asChild>
                                                  <Button variant="ghost" size="icon" className="size-8">
                                                       <MoreHorizontalIcon className="size-4" />
                                                       <span className="sr-only">Mở menu thao tác</span>
                                                  </Button>
                                             </DropdownMenuTrigger>
                                             <DropdownMenuContent align="end">
                                                  <DropdownMenuItem onClick={() => handleOpenDetail(apt.id)}>
                                                       Xem chi tiết
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={() => handleEdit(apt.id)}>
                                                       Chỉnh sửa
                                                  </DropdownMenuItem>
                                                  <DropdownMenuSeparator />
                                                  <DropdownMenuItem
                                                       variant="destructive"
                                                       disabled={deleteApartment.isPending}
                                                       onClick={() => handleDelete(apt.id, apt.apartmentNumber)}
                                                  >
                                                       Xóa
                                                  </DropdownMenuItem>
                                             </DropdownMenuContent>
                                        </DropdownMenu>
                                   </TableCell>
                              </TableRow>
                         ))}
                    </TableBody>
               </Table>

               {totalItems > currentApiLimit ? (
                    <div className="mt-4 flex justify-center">
                         <Pagination
                              current={currentApiPage}
                              pageSize={currentApiLimit}
                              total={totalItems}
                              showSizeChanger={false}
                              onChange={(page) => setCurrentPage(page)}
                         />
                    </div>
               ) : null}
          </>
     )
}
