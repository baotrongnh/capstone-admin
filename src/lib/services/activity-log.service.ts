import { apiClient } from "@/lib/apis/client"
import { endpoints } from "@/lib/apis/endpoints"
import type { ActivityLogListQuery, ActivityLogListResponse } from "@/types/activity-log"

export const activityLogService = {
     getList: async (params?: ActivityLogListQuery): Promise<ActivityLogListResponse> => {
          const { data } = await apiClient.get(endpoints.activityLogs, { params })
          return data
     },
}
