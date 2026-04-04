import { IotDeviceListQuery, IotDeviceListResponse } from "@/types/iot"
import { apiClient } from "../apis/client"
import { endpoints } from "../apis/endpoints"

export const iotService = {
     getDevices: async (params?: IotDeviceListQuery): Promise<IotDeviceListResponse> => {
          const { data } = await apiClient.get(`${endpoints.iot}/devices`, { params })
          return data
     },
}
