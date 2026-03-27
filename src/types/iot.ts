import type { paths } from "@/types/api"

export type IotDeviceListResponse =
     paths["/api/v1/iot/devices"]["get"]["responses"]["200"]["content"]["application/json"]

export type IotDeviceListQuery = NonNullable<
     paths["/api/v1/iot/devices"]["get"]["parameters"]["query"]
>

export type IotDeviceItem = NonNullable<IotDeviceListResponse["data"]>[number]
