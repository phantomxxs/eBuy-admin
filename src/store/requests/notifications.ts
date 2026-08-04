import instance from "@/services/axios-instance"
import {
  NOTIFICATIONS,
  NOTIFICATIONS_UNREAD_COUNT,
  NOTIFICATION_MARK_READ,
  NOTIFICATIONS_MARK_ALL_READ,
} from "@/services/apis"
import type {
  RawNotification,
  RawNotificationPage,
  RawUnreadCount,
  Notification,
  NotificationPage,
} from "@/types/notifications"

// ── Normalizer ─────────────────────────────────────────────────────────────────

function normalizeType(raw: string): Notification["type"] {
  // Handle dot-namespaced types like "inventory.out_of_stock" → "out_of_stock"
  const key = raw.includes(".") ? raw.split(".").pop()! : raw
  const map: Record<string, Notification["type"]> = {
    order: "order",
    low_stock: "low_stock",
    out_of_stock: "out_of_stock",
    payment: "payment",
    customer: "customer",
  }
  return map[key] ?? "order"
}

function normalizeGroup(createdAt: string): Notification["group"] {
  const now = new Date()
  const date = new Date(createdAt)
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  return "earlier"
}

function formatTimestamp(createdAt: string): string {
  const now = new Date()
  const date = new Date(createdAt)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function normalizeNotification(raw: RawNotification): Notification {
  const actions: Notification["actions"] = []
  if (raw.action_primary_label) {
    actions.push({ label: raw.action_primary_label, primary: true })
  }
  if (raw.action_secondary_label) {
    actions.push({ label: raw.action_secondary_label, primary: false })
  }
  return {
    id: String(raw.notification_id),
    type: normalizeType(raw.type),
    title: raw.title,
    body: raw.body,
    timestamp: formatTimestamp(raw.created_at),
    read: raw.is_read,
    group: normalizeGroup(raw.created_at),
    actions,
  }
}

// ── Requests ───────────────────────────────────────────────────────────────────

export const getNotifications = async (
  params: { status?: string; pageSize?: number; currentPage?: number } = {},
): Promise<NotificationPage> => {
  const response = await instance.get<RawNotificationPage>(NOTIFICATIONS, {
    params: {
      status: params.status ?? "all",
      pageSize: params.pageSize ?? 20,
      currentPage: params.currentPage ?? 1,
    },
  })
  const raw = response.data
  return {
    items: (raw.items ?? []).map(normalizeNotification),
    totalCount: raw.total_count ?? 0,
    pageSize: raw.page_size ?? 20,
    currentPage: raw.current_page ?? 1,
  }
}

export const getNotificationUnreadCount = async (): Promise<number> => {
  const response = await instance.get<RawUnreadCount>(NOTIFICATIONS_UNREAD_COUNT)
  return response.data.unread_count ?? 0
}

export const markNotificationRead = async (id: string): Promise<void> => {
  await instance.post(NOTIFICATION_MARK_READ(id))
}

export const markAllNotificationsRead = async (): Promise<void> => {
  await instance.post(NOTIFICATIONS_MARK_ALL_READ)
}
