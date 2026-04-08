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
import { PlusIcon } from "lucide-react"
import type { BoardFormState, CreateDeviceRow } from "./iot-shared"
import { TOPIC_LABEL_MAP, TOPIC_OPTIONS } from "./iot-shared"

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
     onFieldChange: (field: "id" | "apartmentId", value: string) => void
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
                                   : "Tạo mạch và nhập thiết bị luôn từ form này."}
                         </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2.5 py-1 md:grid-cols-2">
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
                    </div>

                    <div className="space-y-2.5">
                         <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">
                                   {isEdit ? "Thiết bị trên mạch" : "Thiết bị khởi tạo"}
                              </h3>
                              <Button type="button" variant="outline" size="sm" onClick={onAddDevice}>
                                   <PlusIcon className="mr-1 size-4" />
                                   Thêm thiết bị
                              </Button>
                         </div>

                         <div className="rounded-lg border bg-muted/15 p-2 text-xs text-muted-foreground">
                              {isEdit
                                   ? "Bạn có thể thêm/xóa/chỉnh sửa danh sách thiết bị trực tiếp trong modal này."
                                   : "Nhập thiết bị ban đầu khi tạo mạch."}
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
                                             variant="destructive"
                                             onClick={() => onRemoveDevice(index)}
                                        >
                                             Xóa
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
