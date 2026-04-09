import {
     DetailItem,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/ui/section-primitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select as AntdSelect } from "antd"
import { Cpu } from "lucide-react"
import { useMemo } from "react"

export type IotConnectedDevice = {
     id: string
     deviceName: string
     deviceType: string
     boardId: string
     boardName: string
}

type BoardOption = {
     id: string
     label: string
     deviceCount: number
}

type ApartmentIotViewModel = {
     editMode: boolean
     selectedBoardIds: string[]
     boardOptions: BoardOption[]
     linkedBoards: BoardOption[]
     boardsLoading?: boolean
     boardDevices: IotConnectedDevice[]
     totalDeviceCount: number
     canBulkUnlinkBoards?: boolean
     isBulkUnlinkingBoards?: boolean
     unlinkingBoardId?: string | null
}

type ApartmentIotActions = {
     onSelectedBoardsChange: (boardIds: string[]) => void
     onUnlinkLinkedBoard?: (boardId: string) => void
     onBulkUnlinkBoards?: () => void
}

type ApartmentIotSectionProps = {
     model: ApartmentIotViewModel
     actions: ApartmentIotActions
}

export function ApartmentIotSection({ model, actions }: ApartmentIotSectionProps) {
     const {
          editMode,
          selectedBoardIds,
          boardOptions,
          linkedBoards,
          boardsLoading = false,
          boardDevices,
          totalDeviceCount,
          canBulkUnlinkBoards = false,
          isBulkUnlinkingBoards = false,
          unlinkingBoardId,
     } = model

     const {
          onSelectedBoardsChange,
          onUnlinkLinkedBoard,
          onBulkUnlinkBoards,
     } = actions

     const boardDeviceGroups = useMemo(() => {
          return boardDevices.reduce(
               (groups, device) => {
                    const existing = groups[device.boardId]
                    if (existing) {
                         existing.push(device)
                         return groups
                    }

                    groups[device.boardId] = [device]
                    return groups
               },
               {} as Record<string, IotConnectedDevice[]>,
          )
     }, [boardDevices])

     const linkedBoardLabelMap = useMemo(
          () =>
               linkedBoards.reduce(
                    (map, board) => {
                         map[board.id] = board.label
                         return map
                    },
                    {} as Record<string, string>,
               ),
          [linkedBoards],
     )

     return (
          <SectionCard>
               <SectionTitle
                    title="IoT - Mạch và thiết bị"
                    description="Một căn hộ có thể liên kết nhiều mạch, danh sách thiết bị cập nhật theo mạch được chọn"
                    icon={Cpu}
               />

               {editMode ? (
                    <div className="space-y-3">
                         <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                   <p className="text-xs font-medium text-foreground">Mạch đang liên kết</p>
                                   <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        disabled={!canBulkUnlinkBoards || isBulkUnlinkingBoards}
                                        onClick={onBulkUnlinkBoards}
                                   >
                                        {isBulkUnlinkingBoards ? "Đang gỡ toàn bộ..." : "Hủy toàn bộ mạch liên kết"}
                                   </Button>
                              </div>

                              {linkedBoards.length > 0 ? (
                                   <div className="space-y-2">
                                        {linkedBoards.map((board) => {
                                             const devices = boardDeviceGroups[board.id] || []

                                             return (
                                                  <div key={board.id} className="rounded-md border p-3">
                                                       <div className="mb-2 flex items-center justify-between gap-2">
                                                            <div>
                                                                 <p className="text-sm font-medium text-foreground">{board.label}</p>
                                                                 <p className="text-xs text-muted-foreground">{board.deviceCount} thiết bị</p>
                                                            </div>
                                                            <Button
                                                                 type="button"
                                                                 variant="outline"
                                                                 size="sm"
                                                                 disabled={isBulkUnlinkingBoards || unlinkingBoardId === board.id}
                                                                 onClick={() => onUnlinkLinkedBoard?.(board.id)}
                                                            >
                                                                 {unlinkingBoardId === board.id ? "Đang hủy..." : "Hủy liên kết mạch"}
                                                            </Button>
                                                       </div>

                                                       {devices.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                 {devices.map((device) => (
                                                                      <Badge key={device.id} variant="outline" className="gap-1">
                                                                           {device.deviceName}
                                                                           <span className="text-[10px] text-muted-foreground">
                                                                                ({device.deviceType})
                                                                           </span>
                                                                      </Badge>
                                                                 ))}
                                                            </div>
                                                       ) : (
                                                            <p className="text-xs text-muted-foreground">Mạch này chưa có thiết bị kết nối.</p>
                                                       )}
                                                  </div>
                                             )
                                        })}
                                   </div>
                              ) : (
                                   <p className="text-xs text-muted-foreground">Căn hộ hiện chưa có mạch IoT liên kết.</p>
                              )}
                         </div>

                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Liên kết thêm mạch (áp dụng khi lưu)</p>
                              <AntdSelect
                                   mode="multiple"
                                   showSearch
                                   allowClear
                                   loading={boardsLoading}
                                   value={selectedBoardIds}
                                   onChange={(value) => onSelectedBoardsChange(value || [])}
                                   optionFilterProp="label"
                                   placeholder="Tìm và chọn một hoặc nhiều mạch IoT"
                                   options={boardOptions.map((item) => ({ label: item.label, value: item.id }))}
                                   className="w-full"
                              />

                              <p className="text-xs text-muted-foreground">
                                   Danh sách này là trạng thái mạch của căn hộ sau khi bạn bấm Lưu thay đổi.
                              </p>
                         </div>
                    </div>
               ) : (
                    <div className="space-y-3">
                         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <DetailItem label="Số mạch IoT liên kết" value={linkedBoards.length} icon={Cpu} />
                              <DetailItem label="Tổng thiết bị IoT" value={totalDeviceCount} icon={Cpu} />
                         </div>

                         {linkedBoards.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                   {linkedBoards.map((board) => (
                                        <Badge key={board.id} variant="secondary">
                                             {board.label} ({board.deviceCount} thiết bị)
                                        </Badge>
                                   ))}
                              </div>
                         ) : (
                              <p className="text-xs text-muted-foreground">Căn hộ chưa liên kết mạch IoT nào.</p>
                         )}

                         {boardDevices.length > 0 ? (
                              <div className="space-y-2">
                                   {Object.entries(boardDeviceGroups).map(([boardId, devices]) => (
                                        <div key={boardId} className="rounded-md border p-2">
                                             <p className="mb-1 text-xs font-medium text-foreground">
                                                  {(linkedBoardLabelMap[boardId] || boardId)} ({devices.length} thiết bị)
                                             </p>
                                             <div className="flex flex-wrap gap-2">
                                                  {devices.map((device) => (
                                                       <Badge key={device.id} variant="outline" className="gap-1">
                                                            {device.deviceName}
                                                            <span className="text-[10px] text-muted-foreground">
                                                                 ({device.deviceType})
                                                            </span>
                                                       </Badge>
                                                  ))}
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         ) : null}
                    </div>
               )}
          </SectionCard>
     )
}
