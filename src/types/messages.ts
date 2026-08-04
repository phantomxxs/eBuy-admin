export type MessageChannel = "Email" | "SMS" | "Push" | "In-app"
export type MessageStatus = "sent" | "scheduled" | "draft" | "failed"
export type MessageType = "Announcement" | "SMS" | "Promotional" | "Transactional"

export interface Message {
  id: string
  title: string
  sentTo: string
  channels: MessageChannel[]
  delivered: number
  opens: number
  rate: string
  status: MessageStatus
  type: MessageType
  sentAt: string
}

export interface MessageMetrics {
  total: number
  sent: number
  scheduled: number
  draft: number
  failed: number
}
