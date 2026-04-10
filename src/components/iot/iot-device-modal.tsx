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
import type { DeviceFormState } from "./iot-shared"
import { TOPIC_LABEL_MAP, TOPIC_OPTIONS } from "./iot-shared"

type IotDeviceModalProps = {
     open: boolean
     isEdit: boolean
     isSaving: boolean
     boardId: string
     form: DeviceFormState
     onOpenChange: (open: boolean) => void
     onCancel: () => void
     onStartCreate: () => void
     onSubmit: () => void
     onFieldChange: (field: keyof DeviceFormState, value: string) => void
}

export function IotDeviceModal({
     open,
     isEdit,
     isSaving,
     boardId,
     form,
     onOpenChange,
     onCancel,
     onStartCreate,
     onSubmit,
     onFieldChange,
}: IotDeviceModalProps) {
     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                         <DialogTitle>{isEdit ? "Cập nhật thiết bị" : "Thêm thiết bị"}</DialogTitle>
                         <DialogDescription>
                              {isEdit
                                   ? `Cập nhật thiết bị thuộc mạch ${boardId}.`
                                   : `Thêm thiết bị mới cho mạch ${boardId}.`}
                         </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-2 md:grid-cols-4">
                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Device ID</p>
                              <Input
                                   value={form.deviceId || ""}
                                   placeholder="VD: 1"
                                   onChange={(event) => onFieldChange("deviceId", event.target.value)}
                              />
                         </div>

                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Tên thiết bị</p>
                              <Input
                                   value={form.deviceName || ""}
                                   placeholder="VD: Đèn phòng khách"
                                   onChange={(event) => onFieldChange("deviceName", event.target.value)}
                              />
                         </div>

                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Topic</p>
                              <Select value={form.topic} onValueChange={(value) => onFieldChange("topic", value)}>
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

                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Trạng thái</p>
                              <Select
                                   value={form.state}
                                   onValueChange={(value) => onFieldChange("state", value)}
                                   disabled={!isEdit}
                              >
                                   <SelectTrigger>
                                        <SelectValue placeholder="Chọn trạng thái" />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value="OFF">OFF</SelectItem>
                                        <SelectItem value="ON">ON</SelectItem>
                                   </SelectContent>
                              </Select>
                         </div>
                    </div>

                    <DialogFooter>
                         {isEdit ? (
                              <Button variant="outline" disabled={isSaving} onClick={onStartCreate}>
                                   + Thêm thiết bị mới
                              </Button>
                         ) : null}
                         <Button variant="outline" disabled={isSaving} onClick={onCancel}>
                              Hủy
                         </Button>
                         <Button onClick={onSubmit} disabled={isSaving}>
                              {isSaving ? "Đang lưu..." : "Lưu thiết bị"}
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     )
}
