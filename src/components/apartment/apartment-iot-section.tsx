import {
     DetailItem,
     SectionCard,
     SectionTitle,
} from "@/components/apartment/apartment-shared/section-primitives"
import { Badge } from "@/components/ui/badge"
import { Select as AntdSelect } from "antd"
import { Cpu } from "lucide-react"

export type IotConnectedDevice = {
     id: string
     deviceName: string
     deviceType: string
}

export type IotBoard = {
     id: string
     boardName: string
     boardType: string
     devices: IotConnectedDevice[]
}

// TODO: Replace this mock source with API data from BE when endpoint is ready.
// Expected shape per board: { id, boardName, boardType, devices[] }
export const MOCK_IOT_BOARDS: IotBoard[] = [
     {
          id: "esp32-a-001",
          boardName: "ESP32 - A101",
          boardType: "ESP32",
          devices: [
               { id: "flame-01", deviceName: "Cảm biến nhiệt độ", deviceType: "sensor" },
               { id: "light-01", deviceName: "Đèn 1", deviceType: "switch" },
               { id: "light-02", deviceName: "Đèn 2", deviceType: "switch" },
               { id: "curtain-01", deviceName: "Rèm 1", deviceType: "switch" },
               { id: "door-01", deviceName: "Cửa chính 1", deviceType: "switch" },
          ],
     },
     {
          id: "esp32-b-002",
          boardName: "ESP32 - A102",
          boardType: "ESP32",
          devices: [
               { id: "dev-door-01", deviceName: "Cảm biến cửa", deviceType: "sensor" },
               { id: "dev-motion-01", deviceName: "Cảm biến chuyển động", deviceType: "sensor" },
          ],
     },
     {
          id: "esp32-c-003",
          boardName: "ESP32 - A103",
          boardType: "ESP32",
          devices: [],
     },
]

type BoardOption = {
     id: string
     label: string
}

type ApartmentIotSectionProps = {
     editMode: boolean
     selectedBoardId?: string
     selectedBoardLabel?: string
     boardOptions: BoardOption[]
     boardDevices: IotConnectedDevice[]
     iotDeviceCount: number
     onBoardChange: (boardId?: string) => void
}

export function ApartmentIotSection({
     editMode,
     selectedBoardId,
     selectedBoardLabel,
     boardOptions,
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

export { ApartmentIotSection as ApartmentIotBoardSection }
