import { useState } from "react"
import { Bell, ShoppingCart, AlertTriangle, Ban, CreditCard, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Popover from "@/components/ui/popover"
import { useGetNotifications, useGetNotificationUnreadCount } from "@/store/queries/notifications"
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/store/mutations/notifications"
import type { Notification, NotificationType } from "@/types/notifications"

// ── Icon config per notification type ──────────────────────────────────────────

const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: React.ElementType; iconBg: string; iconColor: string }
> = {
  order: {
    Icon: ShoppingCart,
    iconBg: "bg-[#fdf3f8]",
    iconColor: "text-primary",
  },
  low_stock: {
    Icon: AlertTriangle,
    iconBg: "bg-[#fbfaee]",
    iconColor: "text-yellow-500",
  },
  out_of_stock: {
    Icon: Ban,
    iconBg: "bg-[#fef2f2]",
    iconColor: "text-danger",
  },
  payment: {
    Icon: CreditCard,
    iconBg: "bg-[#f0f7ff]",
    iconColor: "text-blue-500",
  },
  customer: {
    Icon: User,
    iconBg: "bg-[#f3fdf5]",
    iconColor: "text-green-600",
  },
}

const GROUP_LABELS: Record<string, string> = {
  today: "TODAY",
  yesterday: "YESTERDAY",
  earlier: "EARLIER",
}

// ── Main component ──────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const [open, setOpen] = useState(false)

  const { data } = useGetNotifications()
  const { data: unreadCount = 0 } = useGetNotificationUnreadCount()
  const markAllRead = useMarkAllNotificationsRead()
  const markRead = useMarkNotificationRead()

  const items = data?.items ?? []

  // Group notifications
  const groups = (["today", "yesterday", "earlier"] as const).reduce<
    Record<string, Notification[]>
  >((acc, g) => {
    const grouped = items.filter((n) => n.group === g)
    if (grouped.length) acc[g] = grouped
    return acc
  }, {})

  const trigger = (
    <button
      className="bg-borderSubtle hover:bg-borderStrong relative flex h-10 w-10 items-center justify-center rounded-full transition-colors"
      aria-label="Notifications"
    >
      <Bell size={16} className="text-brand" />
      {unreadCount > 0 && (
        <span className="bg-secondary text-xxs absolute top-1.5 right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.75 font-semibold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  )

  return (
    <Popover
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      align="end"
      sideOffset={10}
      contentClassName="w-[380px]"
    >
      <div className="border-line flex max-h-130 flex-col overflow-hidden rounded-xl border bg-white shadow-[0px_10px_10px_0px_rgba(0,0,0,0.05),0px_23px_14px_0px_rgba(0,0,0,0.03),0px_41px_17px_0px_rgba(0,0,0,0.01)]">
        {/* Header */}
        <div className="border-borderSubtle flex shrink-0 items-center justify-between border-b px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="bg-secondary text-xxs flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="font-jakarta text-secondary text-xs font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Body — scrollable */}
        <div className="no-scrollbar flex-1 overflow-y-auto">
          {Object.entries(groups).length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12">
              <Bell size={24} className="text-brand/20 mb-2" />
              <p className="font-jakarta text-brand/40 text-sm">No notifications</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 py-5">
              {Object.entries(groups).map(([group, groupItems], gi) => (
                <div key={group} className="flex flex-col gap-3">
                  {/* Divider between groups */}
                  {gi > 0 && <div className="border-borderSubtle mx-0 border-t" />}
                  <p className="font-jakarta text-brand/60 px-5 text-xs font-bold tracking-[-0.03em]">
                    {GROUP_LABELS[group] ?? group.toUpperCase()}
                  </p>
                  <div className="flex flex-col gap-3 px-5">
                    {groupItems.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        notification={notif}
                        onMarkRead={() => markRead.mutate(notif.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Popover>
  )
}

// ── Notification item ───────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: Notification
  onMarkRead: () => void
}

const NotificationItem = ({ notification: n, onMarkRead }: NotificationItemProps) => {
  const cfg = TYPE_CONFIG[n.type]
  const Icon = cfg.Icon

  return (
    <div
      className={cn(
        "hover:border-secondary flex gap-4 rounded-lg bg-white py-3.5 shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] hover:border-l-2",
        !n.read && "cursor-pointer",
      )}
      onClick={() => {
        if (!n.read) onMarkRead()
      }}
    >
      {/* Icon */}
      <div
        className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cfg.iconBg)}
      >
        <Icon size={14} className={cfg.iconColor} />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Title row */}
        <div className="flex items-center gap-1">
          <span className="font-jakarta text-brand truncate text-sm font-semibold tracking-[-0.03em]">
            {n.title}
          </span>
          {!n.read && <span className="bg-secondary h-1.5 w-1.5 shrink-0 rounded-full" />}
        </div>

        {/* Body */}
        <p className="font-jakarta text-brand/60 line-clamp-2 text-xs leading-relaxed font-medium tracking-[-0.02em]">
          {n.body}
        </p>
      </div>

      {/* Timestamp */}
      <span className="font-jakarta text-brand/60 w-12 shrink-0 text-right text-xs font-medium">
        {n.timestamp}
      </span>
    </div>
  )
}
