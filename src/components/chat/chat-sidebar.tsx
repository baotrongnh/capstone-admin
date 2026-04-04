"use client"

import { useChatConversations } from "@/hooks/query/useChat"
import { formatTimeFromString } from "@/utils/format"
import { Avatar } from "antd"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"

export default function ChatSidebar() {
     const router = useRouter()
     const pathname = usePathname()
     const searchParams = useSearchParams()

     const activeConversationId = searchParams.get("conversationId")

     const { data: conversations = [], isLoading } = useChatConversations()

     const openConversation = useCallback((conversationId: string) => {
          const params = new URLSearchParams(searchParams.toString())
          params.set("conversationId", conversationId)
          router.replace(`${pathname}?${params.toString()}`)
     }, [pathname, router, searchParams])

     useEffect(() => {
          if (activeConversationId || conversations.length === 0) return
          openConversation(conversations[0].id)
     }, [activeConversationId, conversations, openConversation])

     return (
          <aside className="flex h-full min-h-0 flex-col border-r border-gray-200">
               <div className="border-b border-gray-200 p-4">
                    <h1 className="text-lg font-semibold text-gray-900">Tin nhắn của khách hàng</h1>
                    <p className="mt-1 text-xs text-gray-500">Danh sách tin nhắn</p>
               </div>

               <div className="min-h-0 flex-1 overflow-y-auto">
                    {isLoading && (
                         <div className="space-y-3 p-4">
                              {[1, 2, 3, 4, 5].map((item) => (
                                   <div key={item} className="rounded-lg border border-gray-100 p-3">
                                        <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                                        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                                   </div>
                              ))}
                         </div>
                    )}

                    {!isLoading && conversations.length === 0 && (
                         <div className="p-4 text-sm text-gray-500">Chưa có tin nhắn</div>
                    )}

                    {conversations.map((conversation) => {
                         const isActive = conversation.id === activeConversationId

                         return (
                              <button
                                   key={conversation.id}
                                   type="button"
                                   onClick={() => openConversation(conversation.id)}
                                   className={
                                        `w-full border-b border-gray-100 px-4 py-3 text-left transition 
                                        ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`
                                   }
                              >
                                   <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0">
                                             <Avatar
                                                  src={conversation.user?.profileImageUrl}
                                                  alt={conversation.user?.fullName}
                                                  size={32}
                                             />
                                             <div className="flex flex-col min-w-0">
                                                  <p className="truncate text-sm font-medium text-gray-900">
                                                       {conversation.user?.fullName}
                                                  </p>
                                                  <p className="truncate text-xs text-gray-500">
                                                       {conversation.lastMessageText || "Đã gửi 1 file đính kèm"}
                                                  </p>
                                             </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-gray-400">
                                             {formatTimeFromString(conversation.lastMessageAt)}
                                        </span>
                                   </div>
                              </button>
                         )
                    })}
               </div>
          </aside>
     )
}
