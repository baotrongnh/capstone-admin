import { apiClient } from "@/lib/apis/client"
import { endpoints } from "@/lib/apis/endpoints"
import type {
     ChatConversation,
     ChatConversationDetail,
     ChatConversationListQuery,
     ChatConversationMessagesQuery,
     ChatCreateConversationRequest,
     ChatCreateConversationResponse,
     ChatMessage,
} from "@/types/chat"
import {
     CHAT_MAX_IMAGES,
     extractChatConversationDetail,
     extractChatConversationList,
     extractChatMessageList,
     extractUploadedImageUrls,
} from "@/types/chat"

const assertConversationResponse = (value: ChatConversationDetail | null): ChatCreateConversationResponse => {
     if (!value) {
          throw new Error("Invalid create conversation response")
     }

     return value
}

export const chatService = {
     getConversations: async (params?: ChatConversationListQuery): Promise<ChatConversation[]> => {
          const { data } = await apiClient.get<unknown>(`${endpoints.chat}/conversations`, {
               params,
          })

          return extractChatConversationList(data)
     },

     getConversationById: async (
          id: string,
     ): Promise<ChatConversationDetail | null> => {
          const { data } = await apiClient.get<unknown>(`${endpoints.chat}/conversations/${id}`)

          return extractChatConversationDetail(data)
     },

     getConversationMessages: async (
          id: string,
          params?: ChatConversationMessagesQuery,
     ): Promise<ChatMessage[]> => {
          const { data } = await apiClient.get<unknown>(
               `${endpoints.chat}/conversations/${id}/messages`,
               {
                    params,
               },
          )

          return extractChatMessageList(data)
     },

     createConversation: async (
          payload: ChatCreateConversationRequest,
     ): Promise<ChatCreateConversationResponse> => {
          const { data } = await apiClient.post<unknown>(`${endpoints.chat}/conversations`, payload)
          return assertConversationResponse(extractChatConversationDetail(data))
     },

     uploadImages: async (files: File[]): Promise<string[]> => {
          const formData = new FormData()
          files.slice(0, CHAT_MAX_IMAGES).forEach((file) => {
               formData.append("images", file)
          })

          const { data } = await apiClient.post<unknown>(
               `${endpoints.chat}/upload-images`,
               formData,
               {
                    headers: {
                         "Content-Type": "multipart/form-data",
                    },
               },
          )

          return extractUploadedImageUrls(data)
     },
}
