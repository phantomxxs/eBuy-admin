import instance from "@/services/axios-instance"
import { ACTIVITY_LOGS, ACTIVITY_LOGS_EXPORT } from "@/services/apis"
import type { ActivityLog, ActivityLogsQueryParams } from "@/types/activity-logs"
import type { PaginatedApiResponse } from "@/types/utils"

export const getActivityLogs = async (
  params: ActivityLogsQueryParams,
): PaginatedApiResponse<ActivityLog> => {
  const response = await instance.get(ACTIVITY_LOGS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params?.pageSize && { pageSize: params.pageSize }),
      ...(params?.currentPage && { currentPage: params.currentPage }),
      ...(params?.targetType && { targetType: params.targetType }),
      ...(params?.targetId && { targetId: params.targetId }),
    },
  })
  return response.data
}

export const exportActivityLogsCSV = async (): Promise<{
  download_url: string
  filename: string
}> => {
  const response = await instance.get(ACTIVITY_LOGS_EXPORT)
  return response.data
}
