import { useQuery } from "@tanstack/react-query"
import { getMessages, getMessageMetrics } from "../requests/messages"
import { GET_MESSAGES_KEY, GET_MESSAGE_METRICS_KEY } from "../query-keys"

export const useGetMessages = () =>
  useQuery({ queryKey: [GET_MESSAGES_KEY], queryFn: getMessages })

export const useGetMessageMetrics = () =>
  useQuery({ queryKey: [GET_MESSAGE_METRICS_KEY], queryFn: getMessageMetrics })
