import { io, Socket } from 'socket.io-client'
import {
     ChatConversation,
     ChatConversationDataPayload,
     ChatConversationRoomPayload,
     ChatConversationUpdatedPayload,
     ChatCreateConversationRequest,
     ChatServerErrorPayload,
     ChatSocketMessage,
     ChatSendMessagePayload,
} from '@/types/chat'

interface ServerToClientEvents {
     'chat:conversation_created': (payload: ChatConversation) => void
     'chat:new_conversation': (payload: ChatConversation) => void
     'chat:new_message': (payload: ChatSocketMessage) => void
     'chat:conversation_updated': (payload: ChatConversationUpdatedPayload) => void
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
     'chat:error': (payload: ChatServerErrorPayload) => void
     'staff:inbox': (payload: { message: string }) => void
}

interface ClientToServerEvents {
     'chat:create_conversation': (payload: ChatCreateConversationRequest) => void
     'chat:send_message': (payload: ChatSendMessagePayload) => void
     'chat:join_conversation': (payload: ChatConversationRoomPayload) => void
     'chat:leave_conversation': (payload: ChatConversationRoomPayload) => void
     'chat:typing': (payload: ChatConversationRoomPayload) => void
     'chat:stop_typing': (payload: ChatConversationRoomPayload) => void
     'chat:mark_read': (payload: ChatConversationRoomPayload) => void
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

