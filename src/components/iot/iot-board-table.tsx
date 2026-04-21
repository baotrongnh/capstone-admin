import { STATUS_LABEL_MAP, STATUS_STYLE_MAP } from "@/components/iot/iot-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { IotBoardItem } from "@/types/iot"
import { formatDateTime } from "@/utils/format"
import { MoreHorizontalIcon } from "lucide-react"

type IotBoardTableProps = {
     data: {
          boards: IotBoardItem[]
          isLoading: boolean
          isDeletingBoard: boolean
          onEditBoard: (board: IotBoardItem) => void
          onViewBoardDetails: (board: IotBoardItem) => void
          onDeleteBoard: (boardId: string, boardName: string) => void
     }
}

export const IotBoardTable = ({ data }: IotBoardTableProps) => {
     const { boards, isLoading, isDeletingBoard, onEditBoard, onViewBoardDetails, onDeleteBoard } = data

     return (
          <div className="relative overflow-x-auto rounded-xl border bg-white shadow-sm">
               <Table>
                    <TableHeader className="bg-muted/40">
                         <TableRow>
                              <TableHead className="min-w-52">Mạch IoT</TableHead>
                              <TableHead>Căn hộ</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead className="min-w-48">Thiết bị</TableHead>
                              <TableHead className="hidden xl:table-cell">Cập nhật</TableHead>
                              <TableHead className="sticky right-0 z-20 bg-muted/40 text-right">Thao tác</TableHead>
                         </TableRow>
                    </TableHeader>

                    <TableBody>
                         {isLoading ? (
                              <TableRow>
                                   <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        Đang tải danh sách mạch IoT...
                                   </TableCell>
                              </TableRow>
                         ) : boards.length === 0 ? (
                              <TableRow>
                                   <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                        Chưa có mạch IoT nào.
                                   </TableCell>
                              </TableRow>
                         ) : (
                              boards.map((board) => (
                                   <TableRow key={board.id}>
                                        <TableCell>
                                             <div className="min-w-0">
                                                  <p className="font-medium">{board.id}</p>
                                                  <p className="truncate text-xs text-muted-foreground">{board.name || "-"}</p>
                                             </div>
                                        </TableCell>
                                        <TableCell>{board.apartment?.apartmentNumber || "Chưa liên kết"}</TableCell>
                                        <TableCell>
                                             <Badge className={`border ${STATUS_STYLE_MAP[board.status]}`}>
                                                  {STATUS_LABEL_MAP[board.status]}
                                             </Badge>
                                        </TableCell>
                                        <TableCell>
                                             <div className="flex flex-wrap items-center gap-1.5">
                                                  {board.devices.length === 0 ? (
                                                       <span className="text-xs text-muted-foreground">Chưa có thiết bị</span>
                                                  ) : (
                                                       <>
                                                            {board.devices.slice(0, 3).map((device) => (
                                                                 <Badge key={device.id} variant="outline" className="max-w-36 truncate">
                                                                      {device.deviceName || `Thiết bị ${device.deviceId || "-"}`}
                                                                 </Badge>
                                                            ))}
                                                            {board.devices.length > 3 ? (
                                                                 <Badge variant="secondary">+{board.devices.length - 3}</Badge>
                                                            ) : null}
                                                       </>
                                                  )}
                                                  <span className="text-xs text-muted-foreground">({board.deviceCount} thiết bị)</span>
                                             </div>
                                        </TableCell>
                                        <TableCell className="hidden xl:table-cell whitespace-nowrap">
                                             {formatDateTime(board.updatedAt)}
                                        </TableCell>
                                        <TableCell className="sticky right-0 z-10 bg-white text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.18)]">
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
                                                            Chỉnh sửa
                                                       </DropdownMenuItem>
                                                       <DropdownMenuSeparator />
                                                       <DropdownMenuItem
                                                            variant="destructive"
                                                            disabled={isDeletingBoard || board.status !== 'active'}
                                                            onClick={() => onDeleteBoard(board.id, board.name || board.id)}
                                                       >
                                                            Vô hiệu hóa
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
