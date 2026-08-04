export type NotificationType = "order" | "low_stock" | "out_of_stock" | "payment" | "customer"

export type NotificationGroup = "today" | "yesterday" | "earlier"

export interface NotificationAction {
  label: string
  primary?: boolean
}

// ── Raw API shape ──────────────────────────────────────────────────────────────

export interface RawNotification {
  notification_id: number
  type: string
  severity?: string
  title: string
  body: string
  is_read: boolean
  created_at: string
  target_type?: string
  target_id?: number
  action_primary_label?: string
  action_primary_url?: string
  action_secondary_label?: string
  action_secondary_url?: string
  context?: string
}

export interface RawNotificationPage {
  items: RawNotification[]
  total_count: number
  unread_count: number
  page_size: number
  current_page?: number
}

export interface RawUnreadCount {
  unread_count: number
}

// ── Normalized domain types ────────────────────────────────────────────────────

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string
  read: boolean
  group: NotificationGroup
  actions: NotificationAction[]
}

export interface NotificationPage {
  items: Notification[]
  totalCount: number
  pageSize: number
  currentPage: number
}

export interface NotificationMetrics {
  total: number
  unread: number
}
