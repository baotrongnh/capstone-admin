import type { IotBoardDeviceCreateRequest, IotBoardListQuery } from "@/types/iot"

export type CreateDeviceRow = {
     id?: string
     deviceId: string
     deviceName: string
     topic: IotBoardDeviceCreateRequest["topic"]
     status?: string // 'active' | 'inactive' | ...
     isMarkedDeleted?: boolean
}

export type BoardFormState = {
     id: string
     apartmentId: string
     status: NonNullable<IotBoardListQuery["status"]>
     devices: CreateDeviceRow[]
}

export type DeviceFormState = {
     deviceId: string
     deviceName: string
     topic: IotBoardDeviceCreateRequest["topic"]
     state: "ON" | "OFF"
}

export const TOPIC_OPTIONS: Array<IotBoardDeviceCreateRequest["topic"]> = [
     "light",
     "alarm",
     "door",
     "curtain",
]

export const EMPTY_DEVICE_ROW: CreateDeviceRow = {
     deviceId: "",
     deviceName: "",
     topic: "light",
}

export const normalizeTopic = (topic?: string | null): IotBoardDeviceCreateRequest["topic"] | undefined => {
     if (!topic) {
          return undefined
     }

     return TOPIC_OPTIONS.includes(topic as IotBoardDeviceCreateRequest["topic"])
          ? (topic as IotBoardDeviceCreateRequest["topic"])
          : undefined
}

export const STATUS_STYLE_MAP: Record<NonNullable<IotBoardListQuery["status"]>, string> = {
     active: "bg-emerald-100 text-emerald-700 border-emerald-200",
     inactive: "bg-slate-100 text-slate-700 border-slate-200",
     maintenance: "bg-amber-100 text-amber-700 border-amber-200",
     error: "bg-rose-100 text-rose-700 border-rose-200",
}

export const STATUS_LABEL_MAP: Record<NonNullable<IotBoardListQuery["status"]>, string> = {
     active: "Hoạt động",
     inactive: "Không hoạt động",
     maintenance: "Bảo trì",
     error: "Lỗi",
}

export const TOPIC_LABEL_MAP: Record<IotBoardDeviceCreateRequest["topic"], string> = {
     light: "Đèn",
     alarm: "Báo động",
     door: "Cửa",
     curtain: "Rèm",
}

export const createDefaultBoardForm = (): BoardFormState => ({
     id: "",
     apartmentId: "",
     status: "active",
     devices: [{ ...EMPTY_DEVICE_ROW }],
})

export const createDefaultDeviceForm = (): DeviceFormState => ({
     deviceId: "",
     deviceName: "",
     topic: "light",
     state: "OFF",
})
