import type { paths } from "@/types/api";

export type ChatMode = "support" | "ai" | null;
export type ChatSender = "user" | "support";
export type ChatMessageType = "text" | "image" | "file";

export const CHAT_MODE_STORAGE_KEY = "chat_mode";
export const CHAT_MAX_IMAGES = 5;

export type ChatConversationListQuery = NonNullable<
     paths["/api/v1/chat/conversations"]["get"]["parameters"]["query"]
>;

export type ChatConversationMessagesQuery = NonNullable<
     paths["/api/v1/chat/conversations/{id}/messages"]["get"]["parameters"]["query"]
>;

export type ChatConversationListResponse =
     paths["/api/v1/chat/conversations"]["get"]["responses"]["200"]["content"]["application/json"];

export type ChatConversationDetailResponse =
     paths["/api/v1/chat/conversations/{id}"]["get"]["responses"]["200"]["content"]["application/json"];

export type ChatConversationMessagesResponse =
     paths["/api/v1/chat/conversations/{id}/messages"]["get"]["responses"]["200"]["content"]["application/json"];

export type ChatUploadImagesResponse =
     paths["/api/v1/chat/upload-images"]["post"]["responses"]["201"]["content"]["application/json"];

export type ChatConversation = ChatConversationListResponse["data"][number];
export type ChatConversationDetail = ChatConversationDetailResponse;
export type ChatConversationMessageFromApi = ChatConversationMessagesResponse["data"][number];

export interface ChatMessage {
     id: string | number;
     content: string;
     images?: string[];
     apartmentId?: string;
     sender: ChatSender;
     timestamp: string;
     conversationId?: string;
}

export type ChatSocketMessage = ChatMessage;

export type ChatCreateConversationRequest =
     paths["/api/v1/chat/conversations"]["post"]["requestBody"]["content"]["application/json"];

export type ChatCreateConversationResponse =
     paths["/api/v1/chat/conversations"]["post"]["responses"]["201"]["content"]["application/json"];

export interface ChatSendMessagePayload {
     conversationId: string;
     content: string;
     images?: string[];
     apartmentId?: string;
     messageType?: ChatMessageType;
     attachments?: Array<{
          url: string;
          filename: string;
          mimeType?: string;
          size?: number;
     }>;
}

export interface ChatConversationDataPayload {
     conversation: ChatConversationDetail;
     messages: {
          data: ChatMessage[];
          meta?: Record<string, unknown>;
     };
}

export interface ChatConversationUpdatedPayload {
     conversationId: string;
     lastMessageAt?: string;
     lastMessageText?: string;
     senderName?: string;
     senderType?: string;
}

export interface ChatConversationRoomPayload {
     conversationId: string;
}

export interface ChatServerErrorPayload {
     message?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
     return typeof value === "object" && value !== null;
};

const readResponseData = (value: unknown): unknown => {
     if (!isRecord(value)) {
          return value;
     }

     return value.data ?? value;
};

export const unwrapArrayResponse = <T>(value: unknown): T[] => {
     const payload = readResponseData(value);

     if (Array.isArray(payload)) {
          return payload as T[];
     }

     if (!isRecord(payload)) {
          return [];
     }

     const nestedData = payload.data;
     if (Array.isArray(nestedData)) {
          return nestedData as T[];
     }

     return [];
};

export const unwrapObjectResponse = <T extends Record<string, unknown>>(
     value: unknown,
): T | null => {
     const payload = readResponseData(value);
     return isRecord(payload) ? (payload as T) : null;
};

export const extractChatConversationList = (value: unknown): ChatConversation[] => {
     return unwrapArrayResponse<ChatConversation>(value);
};

export const extractChatConversationDetail = (
     value: unknown,
): ChatConversationDetail | null => {
     return unwrapObjectResponse<ChatConversationDetail>(value);
};

const getSafeMessageId = (value: unknown) => {
     if (typeof value === "string" || typeof value === "number") {
          return value;
     }

     return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getSafeImageUrls = (value: unknown): string[] | undefined => {
     if (!Array.isArray(value)) {
          return undefined;
     }

     const imageUrls = value.filter((image): image is string => typeof image === "string");
     return imageUrls.length > 0 ? imageUrls : undefined;
};

export const normalizeChatMessage = (raw: unknown): ChatMessage | null => {
     if (!isRecord(raw)) {
          return null;
     }

     const content =
          typeof raw.content === "string"
               ? raw.content
               : typeof raw.message === "string"
                    ? raw.message
                    : "";

     const apartmentId = typeof raw.apartmentId === "string" ? raw.apartmentId : undefined;
     const images = getSafeImageUrls(raw.images);

     if (!content.trim() && !apartmentId && !images) {
          return null;
     }

     return {
          id: getSafeMessageId(raw.id),
          content,
          images,
          apartmentId,
          sender: raw.sender === "support" ? "support" : "user",
          timestamp: typeof raw.timestamp === "string" ? raw.timestamp : new Date().toISOString(),
          conversationId: typeof raw.conversationId === "string" ? raw.conversationId : undefined,
     };
};

export const extractChatMessageList = (value: unknown): ChatMessage[] => {
     return unwrapArrayResponse<unknown>(value)
          .map((rawMessage) => normalizeChatMessage(rawMessage))
          .filter((message): message is ChatMessage => Boolean(message));
};

export const extractUploadedImageUrls = (value: unknown): string[] => {
     const payload = readResponseData(value);
     if (!isRecord(payload)) {
          return [];
     }

     const images = payload.images;
     if (!Array.isArray(images)) {
          return [];
     }

     return images.filter((image): image is string => typeof image === "string");
};
