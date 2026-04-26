import type { paths } from "@/types/api"

export type ActivityLogListQuery =
     paths["/api/v1/activity-logs"]["get"]["parameters"]["query"]

export type ActivityLogListResponse =
     paths["/api/v1/activity-logs"]["get"]["responses"]["200"]["content"]["application/json"]

export type ActivityLogItem = NonNullable<ActivityLogListResponse["data"]>[number]
