"use client";

import { useState } from "react";
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

export default function ChatContainer() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const customers: Customer[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
      lastMessage: "Tôi muốn hỏi về căn hộ này",
      timestamp: "2 phút",
      unreadCount: 2,
      online: true,
    },
    {
      id: "2",
      name: "Trần Thị B",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      lastMessage: "Giá có thể thương lượng được không?",
      timestamp: "15 phút",
      unreadCount: 0,
      online: true,
    },
    {
      id: "3",
      name: "Lê Minh C",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
      lastMessage: "Cảm ơn bạn!",
      timestamp: "1 giờ",
      unreadCount: 0,
      online: false,
    },
    {
      id: "4",
      name: "Phạm Hương D",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
      lastMessage: "Khi nào có thể xem căn hộ?",
      timestamp: "3 giờ",
      unreadCount: 1,
      online: true,
    },
  ];

  const [conversations, setConversations] = useState<
    Record<string, ConversationData>
  >({
    "1": {
      messages: [
        {
          id: "1",
          role: "customer",
          content: "Xin chào! Tôi muốn hỏi về căn hộ số 501",
          timestamp: "10:30",
          avatar: customers[0].avatar,
        },
        {
          id: "2",
          role: "staff",
          content:
            "Xin chào! Rất vui được giúp đỡ bạn. Căn hộ 501 là một trong những căn đẹp nhất của chúng tôi.",
          timestamp: "10:31",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
        },
      ],
      notes: "Khách hàng quan tâm đến căn hộ 501, diện tích 85m²",
    },
    "2": {
      messages: [
        {
          id: "1",
          role: "customer",
          content: "Xin chào, tôi có một vài câu hỏi",
          timestamp: "09:15",
          avatar: customers[1].avatar,
        },
        {
          id: "2",
          role: "staff",
          content: "Tôi sẽ giúp bạn. Bạn muốn hỏi gì?",
          timestamp: "09:16",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
        },
        {
          id: "3",
          role: "customer",
          content: "Giá có thể thương lượng được không?",
          timestamp: "09:17",
          avatar: customers[1].avatar,
        },
      ],
      notes: "Nhu cầu thương lượng giá, cần liên hệ lại",
    },
    "3": {
      messages: [
        {
          id: "1",
          role: "customer",
          content: "Cảm ơn bạn!",
          timestamp: "14:20",
          avatar: customers[2].avatar,
        },
        {
          id: "2",
          role: "staff",
          content: "Không có gì. Hẹn gặp lại bạn!",
          timestamp: "14:21",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
        },
      ],
      notes: "Đã xem căn hộ, sẽ liên hệ lại để ký hợp đồng",
    },
    "4": {
      messages: [
        {
          id: "1",
          role: "customer",
          content: "Khi nào có thể xem căn hộ?",
          timestamp: "11:45",
          avatar: customers[3].avatar,
        },
        {
          id: "2",
          role: "staff",
          content:
            "Bạn có thể xem vào buổi chiều hôm nay hoặc sáng mai. Bạn muốn chọn lúc nào?",
          timestamp: "11:46",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
        },
      ],
      notes: "Muốn xem căn hộ, cần lên lịch",
    },
  });

  const handleSendMessage = (customerId: string, content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "staff",
      content,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
    };

    setConversations((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        messages: [...(prev[customerId]?.messages || []), newMessage],
      },
    }));
  };

  const handleSaveNotes = (customerId: string, notes: string) => {
    setConversations((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        notes,
      },
    }));
  };

  return (
    <div className="flex h-screen  bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <ChatSidebar
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelectCustomer={setSelectedCustomer}
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
