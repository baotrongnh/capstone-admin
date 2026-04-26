"use client"

import { useQuery } from "@tanstack/react-query"

import { activityLogService } from "@/lib/services/activity-log.service"
import type { ActivityLogListQuery, ActivityLogListResponse } from "@/types/activity-log"

export const useActivityLogs = (params?: ActivityLogListQuery) =>
     useQuery<ActivityLogListResponse>({
          queryKey: [
               "activity-logs",
               params?.actorType ?? null,
               params?.actorId ?? null,
               params?.entityType ?? null,
               params?.entityId ?? null,
               params?.action ?? null,
               params?.startDate ?? null,
               params?.endDate ?? null,
          ],
          queryFn: () => activityLogService.getList(params),
     })
