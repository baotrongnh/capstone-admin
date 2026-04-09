import {
     DetailItem,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/ui/section-primitives"
import { Badge } from "@/components/ui/badge"
import { Select as AntdSelect } from "antd"
import { Cpu } from "lucide-react"

export type IotConnectedDevice = {
     id: string
     deviceName: string
     deviceType: string
}

type BoardOption = {
     id: string
     label: string
}

type ApartmentIotSectionProps = {
     editMode: boolean
     selectedBoardId?: string
     selectedBoardLabel?: string
     boardOptions: BoardOption[]
     boardsLoading?: boolean
     boardDevices: IotConnectedDevice[]
     iotDeviceCount: number
     onBoardChange: (boardId?: string) => void
}

export function ApartmentIotSection({
     editMode,
     selectedBoardId,
     selectedBoardLabel,
     boardOptions,
     boardsLoading = false,
     boardDevices,
     iotDeviceCount,
     onBoardChange,
}: ApartmentIotSectionProps) {

     return (
          <SectionCard>
               <SectionTitle
                    title="IoT - Mạch và thiết bị"
                    description="Chọn 1 mạch ESP32, danh sách thiết bị sẽ hiển thị tự động"
                    icon={Cpu}
               />

               {editMode ? (
                    <div className="space-y-3">
                         <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Mạch IoT</p>
                              <AntdSelect
                                   showSearch
                                   allowClear
                                   loading={boardsLoading}
                                   value={selectedBoardId}
                                   onChange={(value) => onBoardChange(value || undefined)}
                                   optionFilterProp="label"
                                   placeholder="Tìm và chọn mạch IoT"
                                   options={boardOptions.map((item) => ({ label: item.label, value: item.id }))}
                                   className="w-full"
                              />
                         </div>

                         <div className="space-y-2">
                              <p className="text-xs text-muted-foreground">Thiết bị kết nối theo mạch</p>
                              {selectedBoardId ? (
                                   boardDevices.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                             {boardDevices.map((device) => (
                                                  <Badge key={device.id} variant="outline" className="gap-1">
                                                       {device.deviceName}
                                                       <span className="text-[10px] text-muted-foreground">({device.deviceType})</span>
                                                  </Badge>
                                             ))}
                                        </div>
                                   ) : (
                                        <p className="text-xs text-muted-foreground">Mạch này chưa có thiết bị kết nối.</p>
                                   )
                              ) : (
                                   <p className="text-xs text-muted-foreground">Chọn mạch để xem thiết bị kết nối.</p>
                              )}
                         </div>
                    </div>
               ) : (
                    <div className="space-y-3">
                         <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <DetailItem label="Mạch IoT đã chọn" value={selectedBoardLabel || "-"} icon={Cpu} />
                              <DetailItem label="Số thiết bị IoT từ BE" value={iotDeviceCount} icon={Cpu} />
                         </div>

                         {boardDevices.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                   {boardDevices.map((device) => (
                                        <Badge key={device.id} variant="outline" className="gap-1">
                                             {device.deviceName}
                                             <span className="text-[10px] text-muted-foreground">({device.deviceType})</span>
                                        </Badge>
                                   ))}
                              </div>
                         ) : null}
                    </div>
               )}
          </SectionCard>
     )
}
