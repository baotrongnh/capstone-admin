"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ChatSidebar } from "./chat-sidebar";
import { ChatWindow } from "./chat-window";

export interface Message {
  id: string;
  role: "staff" | "customer";
  content: string;
  timestamp: string;
  avatar: string;
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  online?: boolean;
}

export interface ConversationData {
  messages: Message[];
  notes: string;
}

// Hàm helper để format thời gian
const formatTime = (dateString: string | Date) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatContainer() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [conversations, setConversations] = useState<
    Record<string, ConversationData>
  >({});

  const socketRef = useRef<Socket | null>(null);

  // URL backend của bạn (thay đổi nếu cấu hình env khác)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

  useEffect(() => {
    // 1. Lấy token của Staff đang đăng nhập (từ localStorage hoặc AuthContext)
    const token = localStorage.getItem("accessToken") || ""; // THAY BẰNG TOKEN THẬT

    // 2. Fetch danh sách conversation lúc ban đầu qua REST API
    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Map data trả về sang interface Customer của Sidebar
        if (data && Array.isArray(data.data)) {
          const formattedCustomers: Customer[] = data.data.map((conv: any) => ({
            id: conv.id,
            name: conv.user?.fullName || conv.guestName || "Khách chưa rõ tên",
            avatar:
              conv.user?.profileImageUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.id}`,
            lastMessage: conv.lastMessageText || "Bắt đầu cuộc trò chuyện",
            timestamp: conv.lastMessageAt ? formatTime(conv.lastMessageAt) : "",
            unreadCount: 0,
            online: true, // Nếu server trả về status online, thay vào đây
          }));
          setCustomers(formattedCustomers);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách chat:", error);
      }
    };
    fetchConversations();

    // 3. Khởi tạo kết nối Socket cho Staff
    const socket = io(`${API_URL}/chat`, {
      auth: { token },
    });
    socketRef.current = socket;

    // --- LẮNG NGHE CÁC SỰ KIỆN TỪ SERVER ---

    // A. Bắt lỗi kết nối
    socket.on("chat:error", ({ message }) => {
      console.error("Socket Error:", message);
    });

    // B. Khi có đoạn chat mới hoàn toàn
    socket.on("chat:new_conversation", (conv: any) => {
      const newCustomer: Customer = {
        id: conv.id,
        name: conv.user?.fullName || conv.guestName || "Khách chưa rõ tên",
        avatar:
          conv.user?.profileImageUrl ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.id}`,
        lastMessage: conv.lastMessageText || "",
        timestamp: formatTime(conv.createdAt),
        unreadCount: 1,
        online: true,
      };
      // Đẩy hội thoại mới lên đầu danh sách Sidebar
      setCustomers((prev) => [newCustomer, ...prev]);
    });

    // C. Khi load dữ liệu 1 conversation thành công (sau khi gọi event join)
    socket.on("chat:conversation_data", (data: any) => {
      const { conversation, messages } = data;

      const uiMessages: Message[] = messages.data.reverse().map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.sender === "support" ? "staff" : "customer",
        content: msg.content,
        timestamp: formatTime(msg.timestamp),
        avatar:
          msg.sender === "support"
            ? "https://api.dicebear.com/7.x/avataaars/svg?seed=staff"
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.id}`,
      }));

      setConversations((prev) => ({
        ...prev,
        [conversation.id]: {
          messages: uiMessages,
          notes: conversation.metadata?.notes || "", // Nếu metadata có notes
        },
      }));
    });

    // D. Khi có tin nhắn mới trong phòng đã join (hoặc tin nhắn từ room tổng)
    // Cần đảm bảo server trả kèm conversationId trong message payload
    socket.on("chat:new_message", (msg: any) => {
      // Vì API Document của bạn không ghi `conversationId` trong Message object trả về,
      // Nhưng theo logic Socket, bạn sẽ cần server gửi kèm id của conversation để biết nó thuộc về ai
      const convId = msg.conversationId || msg.apartmentId; // Bạn cần check lại trường này bên server
      if (!convId) return;

      const uiMessage: Message = {
        id: msg.id.toString(),
        role: msg.sender === "support" ? "staff" : "customer",
        content: msg.content,
        timestamp: formatTime(msg.timestamp),
        avatar:
          msg.sender === "support"
            ? "https://api.dicebear.com/7.x/avataaars/svg?seed=staff"
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${convId}`,
      };

      // Cập nhật mảng tin nhắn trong ô ChatWindow
      setConversations((prev) => {
        const currentConv = prev[convId] || { messages: [], notes: "" };
        return {
          ...prev,
          [convId]: {
            ...currentConv,
            messages: [...currentConv.messages, uiMessage],
          },
        };
      });

      // Cập nhật lastMessage ở thanh Sidebar
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, lastMessage: msg.content, timestamp: uiMessage.timestamp }
            : c,
        ),
      );
    });

    // Heartbeat để giữ online
    const heartbeatInterval = setInterval(() => {
      socket.emit("chat:heartbeat");
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
    };
  }, []);

  // --- XỬ LÝ HÀNH ĐỘNG CỦA USER ---

  // Khi click vào 1 người trong danh sách
  const handleSelectCustomer = (customer: Customer) => {
    // 1. Rời conversation cũ để ngừng nhận realtime tin nhắn không cần thiết
    if (selectedCustomer) {
      socketRef.current?.emit("chat:leave_conversation", {
        conversationId: selectedCustomer.id,
      });
    }

    // 2. Cập nhật state UI
    setSelectedCustomer(customer);

    // 3. Join conversation mới để lấy API History `chat:conversation_data`
    socketRef.current?.emit("chat:join_conversation", {
      conversationId: customer.id,
    });

    // 4. Mark Read tin nhắn
    socketRef.current?.emit("chat:mark_read", { conversationId: customer.id });
  };

  // Khi bấm gửi tin nhắn
  const handleSendMessage = (customerId: string, content: string) => {
    if (!content.trim()) return;

    // Server sẽ emit ngược lại `chat:new_message` cho phòng, lúc đó UI sẽ tự cập nhật,
    // hoặc bạn có thể tự update UI luôn (Optimistic Update)
    socketRef.current?.emit("chat:send_message", {
      conversationId: customerId,
      content: content,
      messageType: "text",
    });
  };

  const handleSaveNotes = (customerId: string, notes: string) => {
    // UI Cập nhật trước
    setConversations((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        notes,
      },
    }));

    // TODO: Bắn API PATCH cập nhật ghi chú (nếu Backend bạn có hỗ trợ API này)
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <ChatSidebar
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={handleSelectCustomer} // Dùng hàm mới bọc lại
        />
      )}
      <ChatWindow
        selectedCustomer={selectedCustomer}
        conversations={conversations}
        onSendMessage={handleSendMessage}
        onSaveNotes={handleSaveNotes}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
}
