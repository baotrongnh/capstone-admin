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
import type { IotBoardItem } from "@/types/iot"
import { formatDateTime } from "@/utils/format"
import { PencilIcon, PlusIcon } from "lucide-react"
import { memo } from "react"

type IotBoardDetailModalProps = {
     data: {
          open: boolean
          board: IotBoardItem | null
          onOpenChange: (open: boolean) => void
          onEditBoard: (board: IotBoardItem) => void
          onAddDevice: (boardId: string) => void
     }
}

const getTopicLabel = (topic?: string | null) => {
     if (!topic) {
          return "-"
     }

     return TOPIC_LABEL_MAP[topic as keyof typeof TOPIC_LABEL_MAP] || topic
}

export const IotBoardDetailModal = memo(function IotBoardDetailModal({ data }: IotBoardDetailModalProps) {
     const {
          open,
          board,
          onOpenChange,
          onEditBoard,
          onAddDevice,
     } = data

     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                         <DialogTitle>Chi tiết mạch IoT</DialogTitle>
                         <DialogDescription>
                              Xem đầy đủ thiết bị.
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
                                        <span className="text-muted-foreground">Địa chỉ căn hộ:</span> {board.apartment?.address || "-"}
                                   </p>
                                   <p>
                                        <span className="text-muted-foreground">ID căn hộ:</span> {board.apartment?.id || "-"}
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
                                   <div className="flex items-center gap-1.5">
                                        <Button
                                             type="button"
                                             size="icon"
                                             variant="ghost"
                                             className="size-8"
                                             title="Sửa mạch"
                                             onClick={() => onEditBoard(board)}
                                        >
                                             <PencilIcon className="size-4" />
                                        </Button>
                                        <Button
                                             type="button"
                                             size="icon"
                                             variant="ghost"
                                             className="size-8"
                                             title="Thêm thiết bị"
                                             onClick={() => onAddDevice(board.id)}
                                        >
                                             <PlusIcon className="size-4" />
                                        </Button>
                                   </div>
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
                                                            {device.deviceName || `Thiết bị ${device.deviceId || "-"}`}
                                                       </p>
                                                       <p className="truncate text-xs text-muted-foreground">
                                                            ID: {device.deviceId || "-"} | Topic: {getTopicLabel(device.topic)}
                                                       </p>
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
})
