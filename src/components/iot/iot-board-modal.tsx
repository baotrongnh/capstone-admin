import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontalIcon, AlertTriangleIcon, PlusIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { BoardFormState, CreateDeviceRow } from "./iot-shared"
import { STATUS_LABEL_MAP, STATUS_STYLE_MAP, TOPIC_LABEL_MAP, TOPIC_OPTIONS } from "./iot-shared"

type ApartmentOption = {
     id: string
     apartmentNumber?: string | null
     buildingName?: string | null
}

type IotBoardModalProps = {
     data: {
          open: boolean
          isEdit: boolean
          isSaving: boolean
          form: BoardFormState
          apartmentOptions: ApartmentOption[]
          apartmentSelectDisabled?: boolean
          showUnlinkCurrentApartment?: boolean
          isUnlinkingCurrentApartment?: boolean
          onOpenChange: (open: boolean) => void
          onCancel: () => void
          onSubmit: () => void
          onFieldChange: (field: "id" | "apartmentId" | "status", value: string) => void
          onUnlinkCurrentApartment?: () => void
          onAddDevice: () => void
          onRemoveDevice: (index: number) => void
          onDeviceChange: (index: number, field: "deviceId" | "deviceName" | "topic", value: string) => void
     }
}

type DeviceCardProps = {
     device: CreateDeviceRow
     index: number
     onRemoveDevice: (index: number) => void
     onDeviceChange: (index: number, field: "deviceId" | "deviceName" | "topic", value: string) => void
}

const MODAL_COPY = {
     create: {
          title: "Tạo mạch",
          description: "Tạo mạch mới và thêm thiết bị ngay trong một lần thao tác.",
          deviceTitle: "Thiết bị khởi tạo",
          deviceDescription: "Có thể để trống danh sách thiết bị và thêm sau nếu chưa cấu hình xong.",
     },
     edit: {
          title: "Cập nhật mạch",
          description: "Chỉnh sửa thông tin mạch và quản lý thiết bị trên mạch hiện có.",
          deviceTitle: "Thiết bị trên mạch",
          deviceDescription: "Thiết bị hiện có có thể cập nhật trực tiếp. Thiết bị mới sẽ được thêm vào mạch khi lưu.",
     },
} as const

const getDeviceStatusLabel = (status?: string) => {
     if (!status) {
          return "OFF"
     }

     return STATUS_LABEL_MAP[status as keyof typeof STATUS_LABEL_MAP] || status
}

const getDeviceBadgeClassName = (status?: string, isMarkedDeleted?: boolean) => {
     if (isMarkedDeleted) {
          return "border-destructive/30 bg-destructive/10 text-destructive"
     }

     if (!status) {
          return "border-border bg-muted text-muted-foreground"
     }

     return STATUS_STYLE_MAP[status as keyof typeof STATUS_STYLE_MAP] || "border-border bg-muted text-foreground"
}

const getApartmentLabel = (item: ApartmentOption) =>
     `${item.apartmentNumber || "-"} - ${item.buildingName || "Không rõ tòa nhà"}`

const getDeviceViewModel = (device: CreateDeviceRow, index: number) => {
     const isMarkedDeleted = Boolean(device.id && device.isMarkedDeleted)
     const isInactive = Boolean(device.status && device.status !== "active")
     const isDisabled = isMarkedDeleted || isInactive

     return {
          isMarkedDeleted,
          isInactive,
          isDisabled,
          title: device.deviceName?.trim() || `Thiết bị ${index + 1}`,
          topicLabel: TOPIC_LABEL_MAP[device.topic],
          statusLabel: isMarkedDeleted ? "Đã đánh dấu xóa" : getDeviceStatusLabel(device.status),
          actionLabel: isMarkedDeleted ? "Hoàn tác xóa" : "Xóa thiết bị",
          actionDisabled: isInactive && !isMarkedDeleted,
          actionHint: isInactive && !isMarkedDeleted ? "Thiết bị không hoạt động, không thể chỉnh sửa." : null,
          cardClassName: isMarkedDeleted
               ? "border-destructive/30 bg-destructive/5"
               : isInactive
                    ? "border-amber-300/60 bg-amber-50/30"
                    : "border-border bg-background shadow-sm",
     }
}

function FieldBlock({
     label,
     required = false,
     children,
}: {
     label: string
     required?: boolean
     children: ReactNode
}) {
     return (
          <div className="space-y-1.5">
               <p className="text-xs font-medium text-muted-foreground">
                    {label}
                    {required ? <span className="text-destructive"> *</span> : null}
               </p>
               {children}
          </div>
     )
}

function DeviceCard({ device, index, onRemoveDevice, onDeviceChange }: DeviceCardProps) {
     const view = getDeviceViewModel(device, index)

     return (
          <div className={`space-y-3 rounded-xl border p-3 ${view.cardClassName}`}>
               <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                         <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium">{view.title}</p>
                              <Badge className={`border ${getDeviceBadgeClassName(device.status, view.isMarkedDeleted)}`}>
                                   {view.statusLabel}
                              </Badge>
                         </div>

                         <p className="truncate text-xs text-muted-foreground">
                              ID: {device.deviceId || "-"} | Topic: {view.topicLabel}
                         </p>

                         {view.actionHint ? (
                              <p className="text-xs text-amber-700">{view.actionHint}</p>
                         ) : null}
                    </div>

                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                              <Button
                                   type="button"
                                   size="icon"
                                   variant="ghost"
                                   className="size-8 shrink-0"
                                   aria-label="Mở thao tác thiết bị"
                              >
                                   <MoreHorizontalIcon className="size-4" />
                              </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                   variant={view.isMarkedDeleted ? "default" : "destructive"}
                                   disabled={view.actionDisabled}
                                   onClick={() => onRemoveDevice(index)}
                              >
                                   {view.actionLabel}
                              </DropdownMenuItem>
                         </DropdownMenuContent>
                    </DropdownMenu>
               </div>

               <div className="grid gap-3 md:grid-cols-3">
                    <FieldBlock label="Device ID" required>
                         <Input
                              value={device.deviceId || ""}
                              placeholder="VD: 1"
                              disabled={view.isDisabled}
                              onChange={(event) => onDeviceChange(index, "deviceId", event.target.value)}
                         />
                    </FieldBlock>

                    <FieldBlock label="Tên thiết bị" required>
                         <Input
                              value={device.deviceName || ""}
                              placeholder="VD: Đèn phòng khách"
                              disabled={view.isDisabled}
                              onChange={(event) => onDeviceChange(index, "deviceName", event.target.value)}
                         />
                    </FieldBlock>

                    <FieldBlock label="Topic">
                         <Select
                              value={device.topic}
                              disabled={view.isDisabled}
                              onValueChange={(value) => onDeviceChange(index, "topic", value)}
                         >
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
                    </FieldBlock>
               </div>
          </div>
     )
}

export function IotBoardModal({ data }: IotBoardModalProps) {
     const {
          open,
          isEdit,
          isSaving,
          form,
          apartmentOptions,
          apartmentSelectDisabled = false,
          showUnlinkCurrentApartment = false,
          isUnlinkingCurrentApartment = false,
          onOpenChange,
          onCancel,
          onSubmit,
          onFieldChange,
          onUnlinkCurrentApartment,
          onAddDevice,
          onRemoveDevice,
          onDeviceChange,
     } = data

     const copy = isEdit ? MODAL_COPY.edit : MODAL_COPY.create

     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <DialogHeader>
                         <DialogTitle>{copy.title}</DialogTitle>
                         <DialogDescription>{copy.description}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-1">
                         <section className="space-y-3 rounded-xl border bg-muted/10 p-4">
                              <div className="space-y-1">
                                   <h3 className="text-sm font-semibold">Thông tin mạch</h3>
                                   <p className="text-xs text-muted-foreground">Điền thông tin chính trước, sau đó quản lý danh sách thiết bị bên dưới.</p>
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                   <FieldBlock label="Mã mạch">
                                        <Input
                                             id="iot-board-id"
                                             value={form.id || ""}
                                             placeholder="VD: ESP_A101"
                                             onChange={(event) => onFieldChange("id", event.target.value)}
                                        />
                                   </FieldBlock>

                                   <FieldBlock label="Trạng thái mạch">
                                        <Select
                                             value={form.status}
                                             onValueChange={(value) => onFieldChange("status", value)}
                                             disabled={!isEdit}
                                        >
                                             <SelectTrigger id="iot-board-status" className="w-full min-w-0">
                                                  <SelectValue placeholder="Chọn trạng thái" />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  <SelectItem value="active">{STATUS_LABEL_MAP.active}</SelectItem>
                                                  <SelectItem value="inactive">{STATUS_LABEL_MAP.inactive}</SelectItem>
                                             </SelectContent>
                                        </Select>
                                   </FieldBlock>

                                   <div className="min-w-0 md:col-span-2">
                                        <FieldBlock label="Căn hộ liên kết">
                                             <Select
                                                  value={isEdit ? form.apartmentId || undefined : form.apartmentId || "__none__"}
                                                  onValueChange={(value) =>
                                                       onFieldChange("apartmentId", !isEdit && value === "__none__" ? "" : value)
                                                  }
                                                  disabled={isEdit && apartmentSelectDisabled}
                                             >
                                                  <SelectTrigger id="iot-board-apartment" className="w-full min-w-0">
                                                       <SelectValue placeholder="Chọn căn hộ để liên kết" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                       {!isEdit ? <SelectItem value="__none__">Không liên kết</SelectItem> : null}
                                                       {apartmentOptions.map((item) => {
                                                            const apartmentLabel = getApartmentLabel(item)
                                                            return (
                                                                 <SelectItem key={item.id} value={item.id}>
                                                                      <span className="block max-w-64 truncate" title={apartmentLabel}>
                                                                           {apartmentLabel}
                                                                      </span>
                                                                 </SelectItem>
                                                            )
                                                       })}
                                                  </SelectContent>
                                             </Select>
                                        </FieldBlock>

                                        {isEdit && showUnlinkCurrentApartment ? (
                                             <div className="mt-3 rounded-xl border border-amber-300/70 bg-amber-50/70 p-3 dark:border-amber-500/40 dark:bg-amber-900/10">
                                                  <div className="flex items-start gap-2">
                                                       <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-600" />
                                                       <div className="min-w-0 flex-1 space-y-2">
                                                            <p className="text-xs leading-5 text-amber-900 dark:text-amber-200">
                                                                 Cần hủy liên kết căn hộ hiện tại trước khi chọn căn hộ mới.
                                                            </p>
                                                            <Button
                                                                 type="button"
                                                                 variant="destructive"
                                                                 size="sm"
                                                                 className="h-8"
                                                                 disabled={isSaving || isUnlinkingCurrentApartment}
                                                                 onClick={onUnlinkCurrentApartment}
                                                            >
                                                                 {isUnlinkingCurrentApartment ? "Đang hủy liên kết..." : "Hủy liên kết hiện tại"}
                                                            </Button>
                                                       </div>
                                                  </div>
                                             </div>
                                        ) : null}
                                   </div>
                              </div>
                         </section>

                         <section className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                   <div className="space-y-1">
                                        <h3 className="text-sm font-semibold">
                                             {copy.deviceTitle} ({form.devices.length})
                                        </h3>
                                        <p className="text-xs text-muted-foreground">{copy.deviceDescription}</p>
                                   </div>

                                   <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="size-9 shrink-0 rounded-full"
                                        title="Thêm thiết bị"
                                        aria-label="Thêm thiết bị"
                                        onClick={onAddDevice}
                                   >
                                        <PlusIcon className="size-4" />
                                   </Button>
                              </div>

                              {form.devices.length === 0 ? (
                                   <div className="rounded-xl border border-dashed bg-muted/10 p-5 text-sm text-muted-foreground">
                                        Chưa có thiết bị nào. Nhấn nút thêm để tạo thiết bị đầu tiên.
                                   </div>
                              ) : (
                                   <div className="space-y-3">
                                        {form.devices.map((device, index) => (
                                             <DeviceCard
                                                  key={`${device.id || "new"}-${index}`}
                                                  device={device}
                                                  index={index}
                                                  onRemoveDevice={onRemoveDevice}
                                                  onDeviceChange={onDeviceChange}
                                             />
                                        ))}
                                   </div>
                              )}
                         </section>
                    </div>

                    <DialogFooter>
                         <Button variant="outline" disabled={isSaving} onClick={onCancel}>
                              Hủy
                         </Button>
                         <Button onClick={onSubmit} disabled={isSaving}>
                              {isSaving ? "Đang lưu..." : "Lưu"}
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     )
}
