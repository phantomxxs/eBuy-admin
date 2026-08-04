import { useQuery } from "@tanstack/react-query"
import { getActivityLogs } from "../requests/activity-logs"
import { GET_ACTIVITY_LOGS_KEY } from "../query-keys"
import type { ActivityLogsQueryParams } from "@/types/activity-logs"

export const useGetActivityLogs = (params: ActivityLogsQueryParams) =>
  useQuery({ queryKey: [GET_ACTIVITY_LOGS_KEY, params], queryFn: () => getActivityLogs(params) })
