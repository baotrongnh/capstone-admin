"use client"

import { chatService } from "@/lib/services/chat.service"
import type { ChatConversationListQuery, ChatConversationMessagesQuery } from "@/types/chat"
import { useQuery } from "@tanstack/react-query"

export const chatQueryKeys = {
     all: ["chat"] as const,
     conversations: (params?: ChatConversationListQuery) => ["chat", "conversations", params ?? null] as const,
     conversationsPrefix: ["chat", "conversations"] as const,
     conversation: (conversationId: string | null) => ["chat", "conversation", conversationId] as const,
     messages: (conversationId: string | null, params?: ChatConversationMessagesQuery) =>
          ["chat", "messages", conversationId, params ?? null] as const,
     messagesPrefix: (conversationId: string) => ["chat", "messages", conversationId] as const,
}

export const useChatConversations = (params?: ChatConversationListQuery) => {
     return useQuery({
          queryKey: chatQueryKeys.conversations(params),
          queryFn: () => chatService.getConversations(params),
     })
}

export const useChatConversation = (conversationId: string | null) => {
     return useQuery({
          queryKey: chatQueryKeys.conversation(conversationId),
          queryFn: () => chatService.getConversationById(conversationId as string),
          enabled: Boolean(conversationId),
     })
}

export const useChatConversationMessages = (
     conversationId: string | null,
     params?: ChatConversationMessagesQuery,
) => {
     return useQuery({
          queryKey: chatQueryKeys.messages(conversationId, params),
          queryFn: () =>
               chatService.getConversationMessages(conversationId as string, params),
          enabled: Boolean(conversationId),
     })
}
