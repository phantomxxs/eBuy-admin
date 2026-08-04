import { MESSAGES, MESSAGE_METRICS } from "@/services/apis"
import { mockMessages, mockMessageMetrics } from "@/mock-data/messages"
import type { Message, MessageMetrics } from "@/types/messages"
import type { ApiResponse } from "@/types/utils"

export const getMessages = async (): Promise<ApiResponse<Message[]>> => {
  // const response = await instance.get(MESSAGES)
  // return response.data
  return {
    data: mockMessages,
    message: "Messages fetched successfully",
    status: 200,
    type: "success",
    url: MESSAGES,
  }
}

export const getMessageMetrics = async (): Promise<ApiResponse<MessageMetrics>> => {
  // const response = await instance.get(MESSAGE_METRICS)
  // return response.data
  return {
    data: mockMessageMetrics,
    message: "Message metrics fetched successfully",
    status: 200,
    type: "success",
    url: MESSAGE_METRICS,
  }
}
