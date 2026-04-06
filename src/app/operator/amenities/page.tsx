"use client"

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
     DropdownMenuSeparator,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
     useAmenities,
     useCreateAmenity,
     useDeactivateAmenity,
     useUpdateAmenity,
} from "@/hooks/query/useAmenities"
import { AmenityCreateRequestBody, AmenityItem } from "@/types/amenity"
import { formatDateTime } from "@/utils/format"
import { Badge, Modal, message } from "antd"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"
import { useMemo, useState } from "react"

type AmenityFormState = {
     code: string
     name: string
     description: string
     icon: string
     isActive: boolean
}

const DEFAULT_FORM: AmenityFormState = {
     code: "",
     name: "",
     description: "",
     icon: "",
     isActive: true,
}

const toAmenityForm = (item: AmenityItem): AmenityFormState => ({
     code: item.code || "",
     name: item.name || "",
     description: item.description || "",
     icon: item.icon || "",
     isActive: item.isActive,
})

const toAmenityPayload = (form: AmenityFormState): AmenityCreateRequestBody => {
     const payload: AmenityCreateRequestBody = {
          code: form.code.trim(),
          name: form.name.trim(),
          isActive: form.isActive,
     }

     const description = form.description.trim()
     const icon = form.icon.trim()

     if (description) payload.description = description
     if (icon) payload.icon = icon

     return payload
}

export default function OperatorAmenitiesPage() {
     const { data: amenitiesResponse, isLoading } = useAmenities()
     const createAmenity = useCreateAmenity()
     const updateAmenity = useUpdateAmenity()
     const deactivateAmenity = useDeactivateAmenity()

     const amenities = amenitiesResponse?.data || []

     const [isDialogOpen, setIsDialogOpen] = useState(false)
     const [editingAmenity, setEditingAmenity] = useState<AmenityItem | null>(null)
     const [form, setForm] = useState<AmenityFormState>(DEFAULT_FORM)

     const isSaving = createAmenity.isPending || updateAmenity.isPending

     const dialogTitle = useMemo(
          () => (editingAmenity ? "Cập nhật tiện ích" : "Tạo tiện ích"),
          [editingAmenity],
     )

     const openCreateDialog = () => {
          setEditingAmenity(null)
          setForm(DEFAULT_FORM)
          setIsDialogOpen(true)
     }

     const openEditDialog = (item: AmenityItem) => {
          setEditingAmenity(item)
          setForm(toAmenityForm(item))
          setIsDialogOpen(true)
     }

     const closeDialog = () => {
          if (isSaving) return
          setIsDialogOpen(false)
     }

     const handleSaveAmenity = async () => {
          const code = form.code.trim()
          const name = form.name.trim()

          if (!code) {
               message.error("Vui lòng nhập mã tiện ích")
               return
          }

          if (!name) {
               message.error("Vui lòng nhập tên tiện ích")
               return
          }

          const payload = toAmenityPayload(form)

          try {
               if (editingAmenity) {
                    await updateAmenity.mutateAsync({ id: editingAmenity.id, payload })
               } else {
                    await createAmenity.mutateAsync(payload)
               }

               setIsDialogOpen(false)
          } catch {
               // Error toast is already handled in mutation hooks.
          }
     }

     const handleDeactivate = (item: AmenityItem) => {
          if (!item.isActive) {
               return
          }

          Modal.confirm({
               title: "Xác nhận vô hiệu hóa tiện ích",
               content: `Bạn có chắc chắn muốn vô hiệu hóa tiện ích ${item.name}?`,
               okText: "Vô hiệu hóa",
               okType: "danger",
               cancelText: "Hủy",
               async onOk() {
                    try {
                         await deactivateAmenity.mutateAsync(item.id)
                    } catch {
                         // Error toast is already handled in mutation hooks.
                    }
               },
          })
     }

     return (
          <div className="space-y-4">
               <div className="flex items-center justify-between">
                    <div>
                         <h1 className="text-xl font-semibold">Quản lý tiện ích</h1>
                         <p className="text-sm text-muted-foreground">
                              Danh sách tiện ích dùng cho form tạo/chỉnh sửa căn hộ.
                         </p>
                    </div>

                    <Button onClick={openCreateDialog}>
                         <PlusIcon className="mr-1 size-4" />
                         Tạo tiện ích
                    </Button>
               </div>

               <div className="rounded-xl border bg-background">
                    <Table>
                         <TableHeader>
                              <TableRow>
                                   <TableHead>Mã</TableHead>
                                   <TableHead>Tên tiện ích</TableHead>
                                   <TableHead>Mô tả</TableHead>
                                   <TableHead>Liên kết căn hộ</TableHead>
                                   <TableHead>Trạng thái</TableHead>
                                   <TableHead>Ngày tạo</TableHead>
                                   <TableHead className="text-right">Thao tác</TableHead>
                              </TableRow>
                         </TableHeader>

                         <TableBody>
                              {isLoading && (
                                   <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                             Đang tải danh sách tiện ích...
                                        </TableCell>
                                   </TableRow>
                              )}

                              {!isLoading && amenities.length === 0 && (
                                   <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                             Chưa có tiện ích nào.
                                        </TableCell>
                                   </TableRow>
                              )}

                              {amenities.map((item) => (
                                   <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.code}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="max-w-[320px] truncate">{item.description || "-"}</TableCell>
                                        <TableCell>{item.linkedApartments}</TableCell>
                                        <TableCell>
                                             <Badge color={item.isActive ? "green" : "default"}>
                                                  {item.isActive ? "Hoạt động" : "Đã vô hiệu hóa"}
                                             </Badge>
                                        </TableCell>
                                        <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                       <Button variant="ghost" size="icon" className="size-8">
                                                            <MoreHorizontalIcon className="size-4" />
                                                            <span className="sr-only">Mở menu thao tác</span>
                                                       </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                       <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                                            Chỉnh sửa
                                                       </DropdownMenuItem>
                                                       <DropdownMenuSeparator />
                                                       <DropdownMenuItem
                                                            variant="destructive"
                                                            disabled={!item.isActive || deactivateAmenity.isPending}
                                                            onClick={() => handleDeactivate(item)}
                                                       >
                                                            Vô hiệu hóa
                                                       </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                             </DropdownMenu>
                                        </TableCell>
                                   </TableRow>
                              ))}
                         </TableBody>
                    </Table>
               </div>

               <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                    <DialogContent className="sm:max-w-140">
                         <DialogHeader>
                              <DialogTitle>{dialogTitle}</DialogTitle>
                              <DialogDescription>
                                   Cập nhật metadata tiện ích theo chuẩn API hiện tại.
                              </DialogDescription>
                         </DialogHeader>

                         <div className="grid gap-4 py-2">
                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Mã tiện ích</p>
                                   <Input
                                        value={form.code}
                                        placeholder="VD: gym"
                                        onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
                                   />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tên tiện ích</p>
                                   <Input
                                        value={form.name}
                                        placeholder="VD: Phòng gym"
                                        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                                   />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Icon</p>
                                   <Input
                                        value={form.icon}
                                        placeholder="VD: dumbbell"
                                        onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
                                   />
                              </div>

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Mô tả</p>
                                   <Textarea
                                        value={form.description}
                                        placeholder="Mô tả ngắn về tiện ích"
                                        onChange={(event) =>
                                             setForm((prev) => ({ ...prev, description: event.target.value }))
                                        }
                                   />
                              </div>

                              <label className="flex items-center gap-2 text-sm">
                                   <Checkbox
                                        checked={form.isActive}
                                        onCheckedChange={(checked) =>
                                             setForm((prev) => ({ ...prev, isActive: checked === true }))
                                        }
                                   />
                                   Trạng thái hoạt động
                              </label>
                         </div>

                         <DialogFooter>
                              <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
                                   Hủy
                              </Button>
                              <Button onClick={handleSaveAmenity} disabled={isSaving}>
                                   {isSaving ? "Đang lưu..." : "Lưu"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}
