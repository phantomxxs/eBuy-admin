import { useQuery } from "@tanstack/react-query"
import { getNotifications, getNotificationUnreadCount } from "../requests/notifications"
import { GET_NOTIFICATIONS_KEY, GET_NOTIFICATION_UNREAD_COUNT_KEY } from "../query-keys"
import { useUserStore } from "@/store/user"
import { PERMISSIONS } from "@/utils/permissions"

export const useGetNotifications = (
  params: { status?: string; pageSize?: number; currentPage?: number } = {},
) => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.NOTIFICATIONS_VIEW))
  return useQuery({
    queryKey: [GET_NOTIFICATIONS_KEY, params],
    queryFn: () => getNotifications(params),
    enabled: canView,
  })
}

export const useGetNotificationUnreadCount = () => {
  const canView = useUserStore((s) => s.hasPermission(PERMISSIONS.NOTIFICATIONS_VIEW))
  return useQuery({
    queryKey: [GET_NOTIFICATION_UNREAD_COUNT_KEY],
    queryFn: getNotificationUnreadCount,
    refetchInterval: 60_000,
    enabled: canView,
  })
}
