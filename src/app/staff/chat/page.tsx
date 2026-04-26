"use client"

import {
  chatQueryKeys,
  useChatConversation,
  useChatConversationMessages,
} from "@/hooks/query/useChat"
import { ApartmentCardMessage } from "@/components/chat/apartment-card-message"
import {
  ChatImageGrid,
  ChatImageLightbox,
  ChatImagePreviewStrip,
} from "@/components/chat/chat-image"
import { chatService } from "@/lib/services/chat.service"
import { socket } from "@/lib/socket/socket"
import {
  CHAT_MAX_IMAGES,
  normalizeChatMessage,
  type ChatConversationRoomPayload,
  type ChatConversationUpdatedPayload,
  type ChatSendMessagePayload,
  type ChatServerErrorPayload,
  type ChatSocketMessage,
} from "@/types/chat"
import { formatTimeFromString } from "@/utils/format"
import { useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import type { ChangeEvent, ClipboardEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const mergeFiles = (current: File[], incoming: File[]) => {
  if (incoming.length === 0) {
    return current
  }

  return [...current, ...incoming].slice(0, CHAT_MAX_IMAGES)
}

const getPastedImages = (event: ClipboardEvent<HTMLInputElement>) => {
  const items = Array.from(event.clipboardData?.items ?? [])

  return items
    .filter((item) => item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file))
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const messageListRef = useRef<HTMLDivElement | null>(null)
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const activeConversationId = searchParams.get("conversationId")

  const [messageInput, setMessageInput] = useState("")
  const [socketError, setSocketError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const { data: conversation } = useChatConversation(activeConversationId)
  const { data: messages = [], isLoading: isLoadingMessages } = useChatConversationMessages(activeConversationId)
  const lastMessageKey = messages.at(-1)?.id ?? null

  const hasSelectedImages = selectedImages.length > 0
  const canSendMessage = Boolean(activeConversationId) && !isUploadingImages && (Boolean(messageInput.trim()) || hasSelectedImages)

  const invalidateConversationList = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversationsPrefix })
  }, [queryClient])

  const invalidateConversationMessages = useCallback((conversationId: string) => {
    queryClient.invalidateQueries({ queryKey: chatQueryKeys.messagesPrefix(conversationId) })
  }, [queryClient])

  const selectedImagePreviews = useMemo(
    () => selectedImages.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    })),
    [selectedImages],
  )

  const scrollToBottom = useCallback(() => {
    const listElement = messageListRef.current
    if (!listElement) {
      return
    }

    listElement.scrollTop = listElement.scrollHeight
    messageEndRef.current?.scrollIntoView({ block: "end" })
  }, [])

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [selectedImagePreviews])

  useEffect(() => {
    if (!activeConversationId) {
      return
    }

    const payload: ChatConversationRoomPayload = { conversationId: activeConversationId }
    socket.emit("chat:join_conversation", payload)
    socket.emit("chat:mark_read", payload)

    return () => {
      socket.emit("chat:leave_conversation", payload)
    }
  }, [activeConversationId])

  useEffect(() => {
    const handleConversationRefresh = () => {
      invalidateConversationList()
    }

    const handleConversationUpdated = (payload: ChatConversationUpdatedPayload) => {
      if (!payload.conversationId) {
        return
      }

      invalidateConversationList()

      if (payload.conversationId === activeConversationId) {
        invalidateConversationMessages(payload.conversationId)
      }
    }

    const handleNewMessage = (payload: ChatSocketMessage) => {
      const message = normalizeChatMessage(payload)
      if (!message) {
        return
      }

      const targetConversationId = message.conversationId || activeConversationId
      invalidateConversationList()

      if (!targetConversationId || targetConversationId !== activeConversationId) {
        return
      }

      invalidateConversationMessages(targetConversationId)
      socket.emit("chat:mark_read", { conversationId: targetConversationId })
    }

    const handleChatError = (payload: ChatServerErrorPayload) => {
      setSocketError(payload.message || "Chat server error")
      console.error("[chat] server error", payload)
    }

    socket.on("chat:new_conversation", handleConversationRefresh)
    socket.on("chat:conversation_created", handleConversationRefresh)
    socket.on("chat:conversation_updated", handleConversationUpdated)
    socket.on("chat:new_message", handleNewMessage)
    socket.on("chat:error", handleChatError)

    return () => {
      socket.off("chat:new_conversation", handleConversationRefresh)
      socket.off("chat:conversation_created", handleConversationRefresh)
      socket.off("chat:conversation_updated", handleConversationUpdated)
      socket.off("chat:new_message", handleNewMessage)
      socket.off("chat:error", handleChatError)
    }
  }, [activeConversationId, invalidateConversationList, invalidateConversationMessages])

  useEffect(() => {
    if (!activeConversationId || isLoadingMessages) {
      return
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [activeConversationId, isLoadingMessages, lastMessageKey, scrollToBottom])

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) {
      return
    }

    setSelectedImages((prev) => mergeFiles(prev, files))
    event.target.value = ""
  }

  const handlePasteImages = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedImages = getPastedImages(event)
    if (pastedImages.length === 0) {
      return
    }

    event.preventDefault()
    setSelectedImages((prev) => mergeFiles(prev, pastedImages))
  }

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }

  const uploadSelectedImages = async (): Promise<string[] | null> => {
    if (selectedImages.length === 0) {
      return []
    }

    try {
      setIsUploadingImages(true)
      return await chatService.uploadImages(selectedImages)
    } catch (error) {
      console.error("[chat] upload images failed", error)
      setSocketError("Tải ảnh thất bại, vui lòng thử lại")
      return null
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleSendMessage = async () => {
    const content = messageInput.trim()
    if (!activeConversationId || (!content && !hasSelectedImages) || isUploadingImages) {
      return
    }

    const uploadedImages = await uploadSelectedImages()
    if (uploadedImages === null) {
      return
    }

    const messagePayload: ChatSendMessagePayload = {
      conversationId: activeConversationId,
      content,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      messageType: uploadedImages.length > 0 ? "image" : "text",
    }

    socket.emit("chat:send_message", messagePayload)

    setMessageInput("")
    setSelectedImages([])
    setSocketError(null)
  }

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {!activeConversationId ? (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          Chọn tin nhắn để bắt đầu.
        </div>
      ) : (
        <>
          <header className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {conversation?.user?.fullName}
              </p>
              <p className="text-xs text-gray-500">
                Hoạt động
              </p>
            </div>
            {isLoadingMessages && (
              <span className="text-xs text-gray-400">Đang đồng bộ...</span>
            )}
          </header>

          {socketError && (
            <div className="border-b border-red-200 bg-red-50 px-5 py-2 text-xs text-red-600">
              {socketError}
            </div>
          )}

          <div
            ref={messageListRef}
            className="min-h-0 flex-1 overflow-y-auto bg-gray-50 px-5 py-4"
          >
            {isLoadingMessages && (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className={`flex ${item % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className="h-16 w-56 animate-pulse rounded-2xl bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {!isLoadingMessages && messages.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có tin nhắn</p>
            )}

            {!isLoadingMessages && (
              <div className="space-y-3">
                {messages.map((message) => {
                  const isSupport = message.sender === "support"

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSupport ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[78%]">
                        {message.content && (
                          <div
                            className={[
                              "rounded-2xl px-3 py-2 text-sm shadow-sm",
                              isSupport
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md border border-gray-200 bg-white text-gray-900",
                            ].join(" ")}
                          >
                            <p>{message.content}</p>
                          </div>
                        )}
                        <ChatImageGrid images={message.images ?? []} onPreview={setPreviewImage} />
                        {message.apartmentId && (
                          <ApartmentCardMessage apartmentId={message.apartmentId} />
                        )}
                        <p className={`mt-1 px-1 text-[11px] ${isSupport ? "text-right text-gray-400" : "text-gray-400"}`}>
                          {formatTimeFromString(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>

          <footer className="border-t border-gray-200 p-3">
            <div className="mb-2">
              <ChatImagePreviewStrip
                images={selectedImagePreviews.map((preview) => ({
                  key: preview.url,
                  src: preview.url,
                  alt: preview.name,
                }))}
                onRemove={handleRemoveSelectedImage}
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="chat-image-upload"
                className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
              >
                Ảnh
              </label>
              <input
                id="chat-image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectImages}
                disabled={isUploadingImages}
                className="hidden"
              />
              <input
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                onPaste={handlePasteImages}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !isUploadingImages) {
                    event.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="h-10 flex-1 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!canSendMessage}
                className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isUploadingImages ? "Đang tải..." : "Gửi"}
              </button>
            </div>
          </footer>
          <ChatImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} />
        </>
      )}
    </section>
  )
}
