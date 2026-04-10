import {
     DetailItem,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/ui/section-primitives"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select as AntdSelect } from "antd"
import { Cpu } from "lucide-react"

export type IotConnectedDevice = {
     id: string
     deviceName: string
     deviceType: string
     boardId: string
     boardName: string
}

export type BoardOption = {
     id: string
     label: string
     deviceCount: number
}

export type ApartmentIotSectionModel = {
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

export type ApartmentIotSectionActions = {
     onSelectedBoardsChange: (boardIds: string[]) => void
     onUnlinkLinkedBoard?: (boardId: string) => void
     onBulkUnlinkBoards?: () => void
}

type ApartmentIotSectionProps = {
     model: ApartmentIotSectionModel
     actions: ApartmentIotSectionActions
}

const groupDevicesByBoard = (devices: IotConnectedDevice[]) => {
     const groups: Record<string, IotConnectedDevice[]> = {}

     for (const device of devices) {
          if (!groups[device.boardId]) {
               groups[device.boardId] = []
          }

          groups[device.boardId].push(device)
     }

     return groups
}

const createBoardLabelMap = (boards: BoardOption[]) => {
     const map: Record<string, string> = {}

     for (const board of boards) {
          map[board.id] = board.label
     }

     return map
}

function DeviceBadges({ devices }: { devices: IotConnectedDevice[] }) {
     return (
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
     )
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

     const boardDeviceGroups = groupDevicesByBoard(boardDevices)
     const linkedBoardLabelMap = createBoardLabelMap(linkedBoards)
     const groupedBoardDevices = Object.entries(boardDeviceGroups)
     const hasLinkedBoards = linkedBoards.length > 0

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
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-600"
                                        size="sm"
                                        disabled={!canBulkUnlinkBoards || isBulkUnlinkingBoards}
                                        onClick={onBulkUnlinkBoards}
                                   >
                                        {isBulkUnlinkingBoards ? "Đang gỡ toàn bộ..." : "Hủy tất cả liên kết"}
                                   </Button>
                              </div>

                              {hasLinkedBoards ? (
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
                                                                 className="text-red-600 hover:text-red-600"
                                                                 size="sm"
                                                                 disabled={isBulkUnlinkingBoards || unlinkingBoardId === board.id}
                                                                 onClick={() => onUnlinkLinkedBoard?.(board.id)}
                                                            >
                                                                 {unlinkingBoardId === board.id ? "Đang hủy..." : "Hủy liên kết"}
                                                            </Button>
                                                       </div>

                                                       {devices.length > 0 ? (
                                                            <DeviceBadges devices={devices} />
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

                         {hasLinkedBoards ? (
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

                         {groupedBoardDevices.length > 0 ? (
                              <div className="space-y-2">
                                   {groupedBoardDevices.map(([boardId, devices]) => (
                                        <div key={boardId} className="rounded-md border p-2">
                                             <p className="mb-1 text-xs font-medium text-foreground">
                                                  {(linkedBoardLabelMap[boardId] || boardId)} ({devices.length} thiết bị)
                                             </p>
                                             <DeviceBadges devices={devices} />
                                        </div>
                                   ))}
                              </div>
                         ) : null}
                    </div>
               )}
          </SectionCard>
     )
}
