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
import { useApartments } from "@/hooks/query/useApartments"
import { formatVND } from "@/utils/format"
import { message } from "antd"
import { MoreHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { ApartmentDetailModal } from "./ApartmentDetailModal"

type DetailMode = "view" | "edit"

const STATUS_LABELS: Record<string, string> = {
     available: "Còn trống",
     occupied: "Đang thuê",
     maintenance: "Bảo trì",
     reserved: "Đã giữ chỗ",
     inactive: "Ngừng hoạt động",
}

const formatStatus = (status?: string | null) => {
     if (!status) return "-"
     return STATUS_LABELS[status] || status
}

export default function OperatorApartmentsPage() {
     const { data: apartmentListResponse, isLoading: isListLoading } = useApartments()
     const apartments = apartmentListResponse?.data || []

     const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null)
     const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
     const [detailMode, setDetailMode] = useState<DetailMode>("view")

     const handleOpenDetail = (id: string) => {
          setSelectedApartmentId(id)
          setDetailMode("view")
          setIsDetailModalOpen(true)
     }

     const handleEdit = (id: string) => {
          setSelectedApartmentId(id)
          setDetailMode("edit")
          setIsDetailModalOpen(true)
     }

     const handleDelete = (id: string) => {
          message.info(`Sẽ mở xác nhận xóa căn hộ: ${id}`)
     }

     const handleCloseDetail = (open: boolean) => {
          setIsDetailModalOpen(open)
          if (!open) {
               setSelectedApartmentId(null)
               setDetailMode("view")
          }
     }

     return (
          <>
               <Table>
                    <TableHeader>
                         <TableRow>
                              <TableHead>Mã căn hộ</TableHead>
                              <TableHead>Ảnh</TableHead>
                              <TableHead>Tên tòa nhà</TableHead>
                              <TableHead>Phòng ngủ</TableHead>
                              <TableHead>Diện tích</TableHead>
                              <TableHead>Giá thuê</TableHead>
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
                                   <TableCell>{apt.numberOfBedrooms}</TableCell>
                                   <TableCell>{apt.totalArea} m²</TableCell>
                                   <TableCell>{formatVND(apt.baseRentPrice, true)}</TableCell>
                                   <TableCell>
                                        <Badge variant="secondary">{formatStatus(apt.status)}</Badge>
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
                                                       onClick={() => handleDelete(apt.id)}
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

               <ApartmentDetailModal
                    open={isDetailModalOpen}
                    apartmentId={selectedApartmentId}
                    mode={detailMode}
                    onOpenChange={handleCloseDetail}
               />
          </>
     )
}
