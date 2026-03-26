export type ChatMode = 'support' | 'ai' | null
export type ChatSender = 'user' | 'support'
export type ChatMessageType = 'text' | 'image' | 'file'

export const CHAT_MODE_STORAGE_KEY = 'chat_mode'

export interface ChatMessage {
     id: string | number
     content: string
     images?: string[]
     apartmentId?: string
     sender: ChatSender
     timestamp: Date
}

export interface ChatMessageDto {
     id: number
     content: string
     images?: string[]
     apartmentId?: string
     sender: ChatSender
     timestamp: string | Date
}

export interface ChatConversation {
     id: string
     title?: string | null
     userId?: string | null
     guestSessionId?: string | null
     guestName?: string | null
     guestEmail?: string | null
     status: 'active' | 'closed' | 'archived'
     lastMessageAt?: string | null
     lastMessageText?: string | null
     metadata?: Record<string, unknown> | null
     createdAt: string
     updatedAt: string
}

export interface ChatSendMessagePayload {
     conversationId: string
     content: string
     images?: string[]
     apartmentId?: string
     messageType?: ChatMessageType
     attachments?: Array<{
          url: string
          filename: string
          mimeType?: string
          size?: number
     }>
}

export interface ChatCreateConversationPayload {
     title?: string
     metadata?: Record<string, unknown>
}

export interface ChatConversationDataPayload {
     conversation: ChatConversation
     messages: {
          data: ChatMessageDto[]
          meta?: Record<string, unknown>
     }
}

export interface ChatApartmentRef {
     id: string | number
     buildingName?: string | null
     apartmentNumber: string
}
