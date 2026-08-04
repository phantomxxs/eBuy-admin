import { useMutation, useQueryClient } from "@tanstack/react-query"
import { markNotificationRead, markAllNotificationsRead } from "../requests/notifications"
import { GET_NOTIFICATIONS_KEY, GET_NOTIFICATION_UNREAD_COUNT_KEY } from "../query-keys"

export const useMarkNotificationRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_NOTIFICATIONS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_NOTIFICATION_UNREAD_COUNT_KEY] })
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_NOTIFICATIONS_KEY] })
      qc.invalidateQueries({ queryKey: [GET_NOTIFICATION_UNREAD_COUNT_KEY] })
    },
  })
}
