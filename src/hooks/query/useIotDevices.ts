"use client"

import { iotService } from "@/lib/services/iot.service"
import { IotDeviceListQuery } from "@/types/iot"
import { useQuery } from "@tanstack/react-query"

export const useIotDevices = (params?: IotDeviceListQuery) =>
     useQuery({
          queryKey: ["iot-devices", params],
          queryFn: () => iotService.getDevices(params),
     })
