import type { Message, MessageMetrics } from "@/types/messages"
import raw from "./messages.json"

export const mockMessages: Message[] = raw.data as Message[]
export const mockMessageMetrics: MessageMetrics = raw.metrics
