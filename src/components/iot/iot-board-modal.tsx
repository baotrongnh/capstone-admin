import { Button } from "@/components/ui/button"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { PlusIcon, Trash2Icon } from "lucide-react"
import type { BoardFormState, CreateDeviceRow } from "./iot-shared"
import { STATUS_LABEL_MAP, TOPIC_LABEL_MAP, TOPIC_OPTIONS } from "./iot-shared"

type ApartmentOption = {
     id: string
     apartmentNumber?: string | null
     buildingName?: string | null
}

type IotBoardModalProps = {
     open: boolean
     isEdit: boolean
     isSaving: boolean
     form: BoardFormState
     apartmentOptions: ApartmentOption[]
     onOpenChange: (open: boolean) => void
     onCancel: () => void
     onSubmit: () => void
     onFieldChange: (field: "id" | "apartmentId" | "status", value: string) => void
     onAddDevice: () => void
     onRemoveDevice: (index: number) => void
     onDeviceChange: (index: number, field: keyof CreateDeviceRow, value: string) => void
}

export function IotBoardModal({
     open,
     isEdit,
     isSaving,
     form,
     apartmentOptions,
     onOpenChange,
     onCancel,
     onSubmit,
     onFieldChange,
     onAddDevice,
     onRemoveDevice,
     onDeviceChange,
}: IotBoardModalProps) {
     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                         <DialogTitle>{isEdit ? "Cập nhật mạch" : "Tạo mạch"}</DialogTitle>
                         <DialogDescription>
                              {isEdit
                                   ? "Chỉnh sửa thông tin mạch."
                                   : "Tạo mạch và nhập thiết bị."}
                         </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2.5 py-1 md:grid-cols-2 lg:grid-cols-3">
                         <div className="space-y-1.5">
                              <p className="text-xs text-muted-foreground">Mã mạch</p>
                              <Input
                                   value={form.id || ""}
                                   placeholder="VD: ESP_A101"
                                   onChange={(event) => onFieldChange("id", event.target.value)}
                              />
                         </div>

                         <div className="space-y-1.5">
                              <p className="text-xs text-muted-foreground">Căn hộ liên kết</p>
                              <Select
                                   value={form.apartmentId || "__none__"}
                                   onValueChange={(value) =>
                                        onFieldChange("apartmentId", value === "__none__" ? "" : value)
                                   }
                              >
                                   <SelectTrigger>
                                        <SelectValue placeholder="Không liên kết căn hộ" />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="__none__">Không liên kết</SelectItem>
                                        {apartmentOptions.map((item) => (
                                             <SelectItem key={item.id} value={item.id}>
                                                  {item.apartmentNumber || "-"} - {item.buildingName || "Không rõ tòa nhà"}
                                             </SelectItem>
                                        ))}
                                   </SelectContent>
                              </Select>
                         </div>

                         <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                              <p className="text-xs text-muted-foreground">Trạng thái mạch</p>
                              <Select
                                   value={form.status}
                                   onValueChange={(value) => onFieldChange("status", value)}
                                   disabled={!isEdit}
                              >
                                   <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="active">{STATUS_LABEL_MAP.active}</SelectItem>
                                        <SelectItem value="inactive">{STATUS_LABEL_MAP.inactive}</SelectItem>
                                        <SelectItem value="maintenance">{STATUS_LABEL_MAP.maintenance}</SelectItem>
                                        <SelectItem value="error">{STATUS_LABEL_MAP.error}</SelectItem>
                                   </SelectContent>
                              </Select>
                         </div>
                    </div>

                    <div className="space-y-2.5">
                         <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">
                                   {isEdit ? "Thiết bị trên mạch" : "Thiết bị khởi tạo"}
                              </h3>
                              <Button
                                   type="button"
                                   variant="outline"
                                   size="icon"
                                   className="size-8"
                                   title="Thêm thiết bị"
                                   onClick={onAddDevice}
                              >
                                   <PlusIcon className="size-4" />
                              </Button>
                         </div>

                         <div className="rounded-lg border bg-muted/15 p-2 text-xs text-muted-foreground">
                              {isEdit
                                   ? "Bạn có thể thêm/xóa/chỉnh sửa danh sách thiết bị trực tiếp trong modal này."
                                   : "Thiết bị là tùy chọn khi tạo mạch. Có thể để trống và thêm sau."}
                         </div>

                         {form.devices.map((device, index) => (
                              <div key={index} className="grid gap-2 rounded-lg border p-2.5 md:grid-cols-4">
                                   <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground">Device ID</p>
                                        <Input
                                             value={device.deviceId || ""}
                                             placeholder="VD: 1"
                                             onChange={(event) =>
                                                  onDeviceChange(index, "deviceId", event.target.value)
                                             }
                                        />
                                   </div>

                                   <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground">Tên thiết bị</p>
                                        <Input
                                             value={device.deviceName || ""}
                                             placeholder="VD: Đèn phòng khách"
                                             onChange={(event) =>
                                                  onDeviceChange(index, "deviceName", event.target.value)
                                             }
                                        />
                                   </div>

                                   <div className="space-y-1.5">
                                        <p className="text-xs text-muted-foreground">Topic</p>
                                        <Select
                                             value={device.topic}
                                             onValueChange={(value) =>
                                                  onDeviceChange(index, "topic", value)
                                             }
                                        >
                                             <SelectTrigger>
                                                  <SelectValue placeholder="Chọn topic" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  {TOPIC_OPTIONS.map((topic) => (
                                                       <SelectItem key={topic} value={topic}>
                                                            {TOPIC_LABEL_MAP[topic]}
                                                       </SelectItem>
                                                  ))}
                                             </SelectContent>
                                        </Select>
                                   </div>

                                   <div className="flex items-end gap-2">
                                        <div className="flex-1 space-y-1.5">
                                             <p className="text-xs text-muted-foreground">Trạng thái</p>
                                             <Input value="OFF" disabled />
                                        </div>
                                        <Button
                                             type="button"
                                             size="icon"
                                             variant="ghost"
                                             className="size-9 text-destructive hover:text-destructive"
                                             title="Xóa thiết bị"
                                             onClick={() => onRemoveDevice(index)}
                                        >
                                             <Trash2Icon className="size-4" />
                                        </Button>
                                   </div>
                              </div>
                         ))}
                    </div>

                    <DialogFooter>
                         <Button variant="outline" disabled={isSaving} onClick={onCancel}>
                              Hủy
                         </Button>
                         <Button onClick={onSubmit} disabled={isSaving}>
                              {isSaving ? "Đang lưu..." : "Lưu"}
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     )
}
