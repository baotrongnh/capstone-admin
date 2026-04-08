import { STATUS_LABEL_MAP, STATUS_STYLE_MAP, TOPIC_LABEL_MAP } from "@/components/iot/iot-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
} from "@/components/ui/dialog"
import type { IotBoardDeviceCreateRequest, IotBoardDeviceItem, IotBoardItem } from "@/types/iot"
import { formatDateTime } from "@/utils/format"

type IotBoardDetailModalProps = {
     open: boolean
     board: IotBoardItem | null
     isDeletingDevice: boolean
     onOpenChange: (open: boolean) => void
     onAddDevice: (boardId: string) => void
     onEditDevice: (boardId: string, device: IotBoardDeviceItem) => void
     onDeleteDevice: (boardId: string, deviceId: string, deviceName?: string | null) => void
}

export function IotBoardDetailModal({
     open,
     board,
     isDeletingDevice,
     onOpenChange,
     onAddDevice,
     onEditDevice,
     onDeleteDevice,
}: IotBoardDetailModalProps) {
     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                         <DialogTitle>Chi tiết mạch IoT</DialogTitle>
                         <DialogDescription>
                              Xem đầy đủ thiết bị và thao tác nhanh ngay tại modal này.
                         </DialogDescription>
                    </DialogHeader>

                    {board ? (
                         <div className="space-y-4">
                              <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-sm md:grid-cols-2">
                                   <p>
                                        <span className="text-muted-foreground">Mã mạch:</span> {board.id}
                                   </p>
                                   <p>
                                        <span className="text-muted-foreground">Tên mạch:</span> {board.name || "-"}
                                   </p>
                                   <p>
                                        <span className="text-muted-foreground">Căn hộ:</span> {board.apartment?.apartmentNumber || "Chưa liên kết"}
                                   </p>
                                   <p>
                                        <span className="text-muted-foreground">Cập nhật:</span> {formatDateTime(board.updatedAt)}
                                   </p>
                                   <div className="md:col-span-2">
                                        <Badge className={`border ${STATUS_STYLE_MAP[board.status]}`}>
                                             {STATUS_LABEL_MAP[board.status]}
                                        </Badge>
                                   </div>
                              </div>

                              <div className="flex items-center justify-between">
                                   <h3 className="text-sm font-medium">Danh sách thiết bị ({board.devices.length})</h3>
                                   <Button size="sm" onClick={() => onAddDevice(board.id)}>
                                        + Thêm thiết bị
                                   </Button>
                              </div>

                              {board.devices.length === 0 ? (
                                   <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                        Mạch này chưa có thiết bị nào.
                                   </div>
                              ) : (
                                   <div className="space-y-2">
                                        {board.devices.map((device) => (
                                             <div
                                                  key={device.id}
                                                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                             >
                                                  <div className="min-w-0">
                                                       <p className="truncate text-sm font-medium">
                                                            {device.deviceName || `Thiết bị ${device.mqttDeviceId || "-"}`}
                                                       </p>
                                                       <p className="truncate text-xs text-muted-foreground">
                                                            ID: {device.mqttDeviceId || "-"} | Topic: {device.mqttTopic ? TOPIC_LABEL_MAP[device.mqttTopic as IotBoardDeviceCreateRequest["topic"]] || device.mqttTopic : "-"}
                                                       </p>
                                                  </div>

                                                  <div className="flex items-center gap-1.5">
                                                       <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => onEditDevice(board.id, device)}
                                                       >
                                                            Sửa
                                                       </Button>
                                                       <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            disabled={isDeletingDevice}
                                                            onClick={() =>
                                                                 onDeleteDevice(
                                                                      board.id,
                                                                      device.id,
                                                                      device.deviceName,
                                                                 )
                                                            }
                                                       >
                                                            Xóa
                                                       </Button>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </div>
                    ) : (
                         <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                              Không tìm thấy dữ liệu mạch.
                         </div>
                    )}
               </DialogContent>
          </Dialog>
     )
}
