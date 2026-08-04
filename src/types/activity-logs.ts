import type { PaginatedQueryParams } from "./utils"

export interface ActivityLog {
  log_id: string
  date: string
  activity: string
  page_module: string
  by: string
  byInitials: string
  action: string
}

export interface ActivityLogsQueryParams extends PaginatedQueryParams {
  targetType?: string
  targetId?: string
}
