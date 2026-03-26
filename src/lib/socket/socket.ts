import { io, Socket } from 'socket.io-client'
import {
     ChatConversation,
     ChatConversationDataPayload,
     ChatCreateConversationPayload,
     ChatMessageDto,
     ChatSendMessagePayload,
} from '@/types/chat'

interface ServerToClientEvents {
     'chat:conversation_created': (payload: ChatConversation) => void
     'chat:new_conversation': (payload: ChatConversation) => void
     'chat:new_message': (payload: ChatMessageDto) => void
     'chat:conversation_updated': (payload: {
          conversationId: string
          lastMessageAt?: string
          lastMessageText?: string
          senderName?: string
          senderType?: string
     }) => void
     'chat:conversation_data': (payload: ChatConversationDataPayload) => void
     'chat:staff_joined': (payload: {
          conversationId: string
          staffName: string
          actorType: string
     }) => void
     'chat:user_typing': (payload: {
          conversationId: string
          actorType: string
          actorId: string
          fullName?: string
     }) => void
     'chat:user_stop_typing': (payload: {
          conversationId: string
          actorType: string
          actorId: string
     }) => void
     'chat:messages_read': (payload: {
          conversationId: string
          readerType: string
          readerName?: string
          markedCount: number
     }) => void
     'chat:online_status': (payload: {
          actorType: string
          actorId: string
          isOnline: boolean
     }) => void
     'chat:error': (payload: { message: string }) => void
}

interface ClientToServerEvents {
     'chat:create_conversation': (payload: ChatCreateConversationPayload) => void
     'chat:send_message': (payload: ChatSendMessagePayload) => void
     'chat:join_conversation': (payload: { conversationId: string }) => void
     'chat:leave_conversation': (payload: { conversationId: string }) => void
     'chat:typing': (payload: { conversationId: string }) => void
     'chat:stop_typing': (payload: { conversationId: string }) => void
     'chat:mark_read': (payload: { conversationId: string }) => void
     'chat:heartbeat': () => void
}

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const CHAT_NAMESPACE = '/chat'

const buildSocketUrl = () => {
     if (!BASE_API_URL) {
          return CHAT_NAMESPACE
     }

     return `${BASE_API_URL.replace(/\/$/, '')}${CHAT_NAMESPACE}`
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(buildSocketUrl(), {
     autoConnect: false,
})

export const setSocketAuthToken = (token?: string | null) => {
     socket.auth = token ? { token } : {}
}

export const clearSocketAuthToken = () => {
     socket.auth = {}
}

