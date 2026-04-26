"use client"

import { useMemo, useState } from "react"
import { message } from "antd"
import { KeyRoundIcon, RefreshCcwIcon, SearchIcon, WifiIcon } from "lucide-react"

import { STATUS_LABEL_MAP, STATUS_STYLE_MAP, TOPIC_LABEL_MAP } from "@/components/iot/iot-shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCheckIotBoardHealth, useIotBoards, useResetIotDoorPin } from "@/hooks/query/useIotDevices"
import type { IotBoardItem, IotBoardListQuery } from "@/types/iot"
import { formatDateTime } from "@/utils/format"

const ALL_STATUS = "__all__"

type StatusFilterValue = typeof ALL_STATUS | NonNullable<IotBoardListQuery["status"]>

type DoorPinDialogState = {
     open: boolean
     boardId: string
     boardName: string
     deviceId: number
     deviceName: string
     newPin: string
}

const EMPTY_DOOR_DIALOG: DoorPinDialogState = {
     open: false,
     boardId: "",
     boardName: "",
     deviceId: 0,
     deviceName: "",
     newPin: "",
}

const getDoorDevices = (board: IotBoardItem) =>
     board.devices.filter((device) => device.topic === "door" && Number(device.deviceId) > 0)

export default function AdminIotManagerPage() {
     const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(ALL_STATUS)
     const [searchText, setSearchText] = useState("")
     const [selectedBoard, setSelectedBoard] = useState<IotBoardItem | null>(null)
     const [doorPinDialog, setDoorPinDialog] = useState<DoorPinDialogState>(EMPTY_DOOR_DIALOG)

     const boardQuery = statusFilter === ALL_STATUS ? undefined : { status: statusFilter }
     const { data: boardsResponse, isLoading, isFetching, refetch } = useIotBoards(boardQuery)
     const checkBoardHealth = useCheckIotBoardHealth()
     const resetDoorPin = useResetIotDoorPin()

     const boards = useMemo(() => boardsResponse?.data ?? [], [boardsResponse?.data])

     const filteredBoards = useMemo(() => {
          const keyword = searchText.trim().toLowerCase()
          if (!keyword) return boards

          return boards.filter((board) => {
               const doorDevices = getDoorDevices(board)
               const searchable = [
                    board.id,
                    board.name,
                    board.apartment?.apartmentNumber,
                    board.apartment?.address,
                    ...doorDevices.map((device) => device.deviceName),
               ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()

               return searchable.includes(keyword)
          })
     }, [boards, searchText])

     const openDoorManager = (board: IotBoardItem) => {
          const doorDevices = getDoorDevices(board)
          if (doorDevices.length === 0) {
               message.info("Mạch này không có thiết bị cửa để đổi mật khẩu.")
               return
          }
          setSelectedBoard(board)
     }

     const openResetDoorPinDialog = (board: IotBoardItem, device: IotBoardItem["devices"][number]) => {
          setDoorPinDialog({
               open: true,
               boardId: board.id,
               boardName: board.name || board.id,
               deviceId: Number(device.deviceId),
               deviceName: device.deviceName || `Thiết bị ${device.deviceId || "-"}`,
               newPin: "",
          })
     }

     const closeResetDoorPinDialog = () => {
          if (resetDoorPin.isPending) return
          setDoorPinDialog(EMPTY_DOOR_DIALOG)
     }

     const handleCheckBoardHealth = async (board: IotBoardItem) => {
          try {
               const response = await checkBoardHealth.mutateAsync(board.id)
               const health = response?.data
               if (!health) {
                    message.info("Không nhận được dữ liệu trạng thái từ mạch.")
                    return
               }

               message.info(
                    health.online
                         ? `Mạch ${health.espId} đang online${health.lastSeenAt ? `, cập nhật lần cuối ${new Date(health.lastSeenAt).toLocaleString("vi-VN")}` : ""}.`
                         : `Mạch ${health.espId} đang offline${health.lastSeenAt ? `, lần cuối ghi nhận ${new Date(health.lastSeenAt).toLocaleString("vi-VN")}` : ""}.`,
               )
          } catch {
               // handled in mutation
          }
     }

     const handleSubmitDoorPinReset = async () => {
          const newPin = doorPinDialog.newPin.trim()
          if (!/^\d{6}$/.test(newPin)) {
               message.error("Mật khẩu cửa mới phải gồm đúng 6 chữ số.")
               return
          }

          try {
               await resetDoorPin.mutateAsync({
                    boardId: doorPinDialog.boardId,
                    deviceId: doorPinDialog.deviceId,
                    payload: { newPin },
               })
               closeResetDoorPinDialog()
          } catch {
               // handled in mutation
          }
     }

     return (
          <div className="space-y-4 p-4">
               <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold text-foreground">Quản lý mật khẩu cửa IoT</h1>
                         <p className="mt-1 text-sm text-muted-foreground">
                              Trang này chỉ dành cho admin để kiểm tra trạng thái mạch và đổi mật khẩu cho thiết bị cửa.
                         </p>
                    </div>
               </div>

               <Card className="border-border/70">
                    <CardHeader>
                         <CardTitle className="text-base">Bộ lọc mạch IoT</CardTitle>
                         <CardDescription>
                              Tìm nhanh mạch đang có thiết bị cửa để thực hiện đổi mật khẩu.
                         </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="grid gap-2 md:grid-cols-[1fr_220px_auto]">
                              <div className="relative">
                                   <SearchIcon className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                   <Input
                                        value={searchText}
                                        placeholder="Tìm theo mã mạch, tên mạch, căn hộ..."
                                        onChange={(event) => setSearchText(event.target.value)}
                                        className="pl-9"
                                   />
                              </div>

                              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilterValue)}>
                                   <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Lọc theo trạng thái" />
                                   </SelectTrigger>
                                   <SelectContent>
                                        <SelectItem value={ALL_STATUS}>Tất cả trạng thái</SelectItem>
                                        <SelectItem value="active">Hoạt động</SelectItem>
                                        <SelectItem value="inactive">Không hoạt động</SelectItem>
                                        <SelectItem value="maintenance">Bảo trì</SelectItem>
                                        <SelectItem value="error">Lỗi</SelectItem>
                                   </SelectContent>
                              </Select>

                              <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
                                   <RefreshCcwIcon className={`mr-1 size-4 ${isFetching ? "animate-spin" : ""}`} />
                                   {isFetching ? "Đang làm mới..." : "Làm mới"}
                              </Button>
                         </div>

                         <p className="mt-2 text-xs text-muted-foreground">
                              Hiển thị {filteredBoards.length}/{boards.length} mạch
                         </p>
                    </CardContent>
               </Card>

               <Card className="border-border/70">
                    <CardHeader>
                         <CardTitle className="text-base">Danh sách mạch có thể quản lý mật khẩu cửa</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Table>
                              <TableHeader>
                                   <TableRow>
                                        <TableHead>Mạch IoT</TableHead>
                                        <TableHead>Căn hộ</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Thiết bị cửa</TableHead>
                                        <TableHead>Cập nhật</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                   </TableRow>
                              </TableHeader>
                              <TableBody>
                                   {isLoading ? (
                                        <TableRow>
                                             <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                  Đang tải danh sách mạch IoT...
                                             </TableCell>
                                        </TableRow>
                                   ) : filteredBoards.length === 0 ? (
                                        <TableRow>
                                             <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                                                  Không có mạch nào phù hợp.
                                             </TableCell>
                                        </TableRow>
                                   ) : (
                                        filteredBoards.map((board) => {
                                             const doorDevices = getDoorDevices(board)

                                             return (
                                                  <TableRow key={board.id}>
                                                       <TableCell>
                                                            <div className="space-y-1">
                                                                 <p className="font-medium">{board.id}</p>
                                                                 <p className="text-xs text-muted-foreground">{board.name || "-"}</p>
                                                            </div>
                                                       </TableCell>
                                                       <TableCell>
                                                            <div className="space-y-1">
                                                                 <p className="font-medium">{board.apartment?.apartmentNumber || "Chưa liên kết"}</p>
                                                                 <p className="text-xs text-muted-foreground">{board.apartment?.address || "-"}</p>
                                                            </div>
                                                       </TableCell>
                                                       <TableCell>
                                                            <Badge className={`border ${STATUS_STYLE_MAP[board.status]}`}>
                                                                 {STATUS_LABEL_MAP[board.status]}
                                                            </Badge>
                                                       </TableCell>
                                                       <TableCell>
                                                            {doorDevices.length > 0 ? (
                                                                 <div className="flex flex-wrap gap-1.5">
                                                                      {doorDevices.map((device) => (
                                                                           <Badge key={device.id} variant="outline">
                                                                                {device.deviceName || `Cửa ${device.deviceId || "-"}`}
                                                                           </Badge>
                                                                      ))}
                                                                 </div>
                                                            ) : (
                                                                 <span className="text-xs text-muted-foreground">Không có thiết bị cửa</span>
                                                            )}
                                                       </TableCell>
                                                       <TableCell>{formatDateTime(board.updatedAt)}</TableCell>
                                                       <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                 <Button
                                                                      size="sm"
                                                                      variant="outline"
                                                                      onClick={() => handleCheckBoardHealth(board)}
                                                                      disabled={checkBoardHealth.isPending}
                                                                 >
                                                                      <WifiIcon className="mr-1 size-4" />
                                                                      Kiểm tra online
                                                                 </Button>
                                                                 <Button
                                                                      size="sm"
                                                                      onClick={() => openDoorManager(board)}
                                                                      disabled={doorDevices.length === 0}
                                                                 >
                                                                      <KeyRoundIcon className="mr-1 size-4" />
                                                                      Đổi mật khẩu cửa
                                                                 </Button>
                                                            </div>
                                                       </TableCell>
                                                  </TableRow>
                                             )
                                        })
                                   )}
                              </TableBody>
                         </Table>
                    </CardContent>
               </Card>

               <Dialog open={Boolean(selectedBoard)} onOpenChange={(open) => !open && setSelectedBoard(null)}>
                    <DialogContent className="sm:max-w-3xl">
                         <DialogHeader>
                              <DialogTitle>Quản lý mật khẩu cửa</DialogTitle>
                              <DialogDescription>
                                   Chọn thiết bị cửa thuộc mạch {selectedBoard?.name || selectedBoard?.id || "-"} để đặt lại mật khẩu.
                              </DialogDescription>
                         </DialogHeader>

                         <div className="space-y-3">
                              {selectedBoard && getDoorDevices(selectedBoard).length > 0 ? (
                                   getDoorDevices(selectedBoard).map((device) => (
                                        <div key={device.id} className="flex items-center justify-between rounded-lg border p-3">
                                             <div>
                                                  <p className="font-medium">{device.deviceName || `Thiết bị cửa ${device.deviceId || "-"}`}</p>
                                                  <p className="text-xs text-muted-foreground">
                                                       Device ID: {device.deviceId || "-"} · Topic: {TOPIC_LABEL_MAP.door}
                                                  </p>
                                             </div>
                                             <Button onClick={() => openResetDoorPinDialog(selectedBoard, device)}>
                                                  <KeyRoundIcon className="mr-1 size-4" />
                                                  Đặt lại mật khẩu
                                             </Button>
                                        </div>
                                   ))
                              ) : (
                                   <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                        Mạch này không có thiết bị cửa để đổi mật khẩu.
                                   </div>
                              )}
                         </div>
                    </DialogContent>
               </Dialog>

               <Dialog open={doorPinDialog.open} onOpenChange={(open) => !open && closeResetDoorPinDialog()}>
                    <DialogContent className="sm:max-w-md">
                         <DialogHeader>
                              <DialogTitle>Đặt lại mật khẩu cửa</DialogTitle>
                              <DialogDescription>
                                   Nhập mật khẩu mới cho {doorPinDialog.deviceName}. Mật khẩu phải gồm đúng 6 chữ số.
                              </DialogDescription>
                         </DialogHeader>

                         <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Mạch: {doorPinDialog.boardName}</p>
                              <Input
                                   inputMode="numeric"
                                   maxLength={6}
                                   value={doorPinDialog.newPin}
                                   onChange={(event) =>
                                        setDoorPinDialog((prev) => ({
                                             ...prev,
                                             newPin: event.target.value.replace(/\D/g, "").slice(0, 6),
                                        }))
                                   }
                                   placeholder="Nhập mật khẩu mới"
                              />
                         </div>

                         <DialogFooter>
                              <Button variant="outline" onClick={closeResetDoorPinDialog} disabled={resetDoorPin.isPending}>
                                   Hủy
                              </Button>
                              <Button onClick={handleSubmitDoorPinReset} disabled={resetDoorPin.isPending}>
                                   {resetDoorPin.isPending ? "Đang cập nhật..." : "Lưu mật khẩu"}
                              </Button>
                         </DialogFooter>
                    </DialogContent>
               </Dialog>
          </div>
     )
}
