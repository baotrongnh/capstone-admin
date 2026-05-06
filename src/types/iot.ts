import type { components, paths } from "@/types/api"

export type IotBoardListResponse = paths["/api/v1/iot/boards"]["get"]["responses"]["200"]["content"]["application/json"]

export type IotBoardListQuery = NonNullable<paths["/api/v1/iot/boards"]["get"]["parameters"]["query"]>

export type IotBoardDetailResponse = paths["/api/v1/iot/boards/{boardId}"]["get"]["responses"]["200"]["content"]["application/json"]

export type IotBoardCreateRequest = paths["/api/v1/iot/boards"]["post"]["requestBody"]["content"]["application/json"]

export type IotBoardCreateLiteRequest = Omit<IotBoardCreateRequest, "devices"> & {
     devices: IotBoardDeviceCreateLiteRequest[]
}

export type IotBoardCreateResponse = paths["/api/v1/iot/boards"]["post"]["responses"]["201"]["content"]["application/json"]

export type IotBoardUpdateRequest = Omit<paths["/api/v1/iot/boards/{boardId}"]["patch"]["requestBody"]["content"]["application/json"], "apartmentId"> & { apartmentId?: string | null }

export type IotBoardUpdateResponse = paths["/api/v1/iot/boards/{boardId}"]["patch"]["responses"]["200"]["content"]["application/json"]

export type IotBoardUnlinkApartmentResponse = paths["/api/v1/iot/boards/{boardId}/unlink-apartment"]["patch"]["responses"]["200"]["content"]["application/json"]

export type IotApartmentBoardsUnlinkResponse = paths["/api/v1/iot/boards/unlink-apartment-by-apartment/{apartmentId}"]["patch"]["responses"]["200"]["content"]["application/json"]

export type IotBoardDeleteResponse = paths["/api/v1/iot/boards/{boardId}"]["delete"]["responses"]["200"]["content"]["application/json"]

export type IotBoardDeviceCreateRequest = paths["/api/v1/iot/boards/{boardId}/devices"]["post"]["requestBody"]["content"]["application/json"]

export type IotBoardDeviceCreateLiteRequest = Pick<
     IotBoardDeviceCreateRequest,
     "deviceId" | "deviceName" | "topic" | "state"
>

export type IotBoardDeviceCreateResponse = paths["/api/v1/iot/boards/{boardId}/devices"]["post"]["responses"]["201"]["content"]["application/json"]

export type IotBoardDeviceUpdateRequest = paths["/api/v1/iot/boards/{boardId}/devices/{deviceId}"]["patch"]["requestBody"]["content"]["application/json"]

export type IotBoardDeviceUpdateResponse = paths["/api/v1/iot/boards/{boardId}/devices/{deviceId}"]["patch"]["responses"]["200"]["content"]["application/json"]

export type IotBoardDeviceDeleteResponse = paths["/api/v1/iot/boards/{boardId}/devices/{deviceId}"]["delete"]["responses"]["200"]["content"]["application/json"]

export type IotDoorPinResetRequest = paths["/api/v1/iot/doors/{boardId}/{deviceId}/pin/reset"]["patch"]["requestBody"]["content"]["application/json"]

export type IotDoorPinResetResponse = paths["/api/v1/iot/doors/{boardId}/{deviceId}/pin/reset"]["patch"]["responses"]["200"]["content"]["application/json"]

export type IotHealthCheckResponse = paths["/api/v1/iot/devices/{espId}/check-health"]["get"]["responses"]["200"]["content"]["application/json"]

type ApiData<TData> = { data?: TData }

export type CurrentUtilityRatesQuery = paths["/api/v1/iot/utility-rates/current"]["get"]["parameters"]["query"]

export type CurrentUtilityRatesResponse = ApiData<components["schemas"]["IoTBoardMetersDto"]>

type GlobalUtilityRateItem = {
     unit?: string | null
     ratePerUnit?: string | number | null
     currency?: string | null
}

type GlobalUtilityRatesData = {
     key?: string
     electricity?: GlobalUtilityRateItem | null
     water?: GlobalUtilityRateItem | null
     notes?: string | null
     updatedAt?: string | null
}

export type GlobalUtilityRatesResponse = ApiData<GlobalUtilityRatesData>

export type UpdateGlobalUtilityRatesRequest = paths["/api/v1/iot/utility-rates/global"]["patch"]["requestBody"]["content"]["application/json"]

export type UpdateGlobalUtilityRatesResponse = GlobalUtilityRatesResponse

export type IotBoardItem = NonNullable<IotBoardListResponse["data"]>[number]

