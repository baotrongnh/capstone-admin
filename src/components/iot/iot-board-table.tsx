import { STATUS_LABEL_MAP, STATUS_STYLE_MAP } from "@/components/iot/iot-shared"
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
import type { IotBoardItem } from "@/types/iot"
import { formatDateTime } from "@/utils/format"
import { MoreHorizontalIcon } from "lucide-react"

type IotBoardTableProps = {
     boards: IotBoardItem[]
     isLoading: boolean
     isDeletingBoard: boolean
     onEditBoard: (board: IotBoardItem) => void
     onViewBoardDetails: (board: IotBoardItem) => void
     onCreateDevice: (boardId: string) => void
     onDeleteBoard: (boardId: string, boardName: string) => void
}

export function IotBoardTable({
     boards,
     isLoading,
     isDeletingBoard,
     onEditBoard,
     onViewBoardDetails,
     onCreateDevice,
     onDeleteBoard,
}: IotBoardTableProps) {
     return (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
               <Table>
                    <TableHeader className="bg-muted/40">
                         <TableRow>
                              <TableHead>Mã mạch</TableHead>
                              <TableHead>Tên mạch</TableHead>
                              <TableHead>Căn hộ</TableHead>
                              <TableHead>Số thiết bị</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead>Cập nhật</TableHead>
                              <TableHead className="min-w-[360px]">Thiết bị</TableHead>
                              <TableHead className="text-right">Thao tác</TableHead>
                         </TableRow>
                    </TableHeader>

                    <TableBody>
                         {isLoading ? (
                              <TableRow>
                                   <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                        Đang tải danh sách mạch IoT...
                                   </TableCell>
                              </TableRow>
                         ) : boards.length === 0 ? (
                              <TableRow>
                                   <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                        Chưa có mạch IoT nào.
                                   </TableCell>
                              </TableRow>
                         ) : (
                              boards.map((board) => (
                                   <TableRow key={board.id}>
                                        <TableCell className="font-medium">{board.id}</TableCell>
                                        <TableCell>{board.name || "-"}</TableCell>
                                        <TableCell>{board.apartment?.apartmentNumber || "Chưa liên kết"}</TableCell>
                                        <TableCell>{board.deviceCount}</TableCell>
                                        <TableCell>
                                             <Badge className={`border ${STATUS_STYLE_MAP[board.status]}`}>
                                                  {STATUS_LABEL_MAP[board.status]}
                                             </Badge>
                                        </TableCell>
                                        <TableCell>{formatDateTime(board.updatedAt)}</TableCell>
                                        <TableCell>
                                             <div className="flex flex-wrap gap-1.5">
                                                  {board.devices.length === 0 ? (
                                                       <span className="text-xs text-muted-foreground">Chưa có thiết bị</span>
                                                  ) : (
                                                       <>
                                                            {board.devices.slice(0, 3).map((device) => (
                                                                 <Badge key={device.id} variant="outline" className="max-w-[180px] truncate">
                                                                      {device.deviceName || `Thiết bị ${device.mqttDeviceId || "-"}`}
                                                                 </Badge>
                                                            ))}
                                                            {board.devices.length > 3 ? (
                                                                 <Badge variant="secondary">+{board.devices.length - 3}</Badge>
                                                            ) : null}
                                                       </>
                                                  )}
                                             </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                       <Button variant="ghost" size="icon" className="size-8">
                                                            <MoreHorizontalIcon className="size-4" />
                                                            <span className="sr-only">Mở menu thao tác</span>
                                                       </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end" className="w-44">
                                                       <DropdownMenuItem onClick={() => onViewBoardDetails(board)}>
                                                            Xem chi tiết
                                                       </DropdownMenuItem>
                                                       <DropdownMenuItem onClick={() => onEditBoard(board)}>
                                                            Sửa mạch
                                                       </DropdownMenuItem>
                                                       <DropdownMenuItem onClick={() => onCreateDevice(board.id)}>
                                                            Thêm thiết bị
                                                       </DropdownMenuItem>
                                                       <DropdownMenuSeparator />
                                                       <DropdownMenuItem
                                                            variant="destructive"
                                                            disabled={isDeletingBoard}
                                                            onClick={() => onDeleteBoard(board.id, board.name || board.id)}
                                                       >
                                                            Xóa mạch
                                                       </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                             </DropdownMenu>
                                        </TableCell>
                                   </TableRow>
                              ))
                         )}
                    </TableBody>
               </Table>
          </div>
     )
}
