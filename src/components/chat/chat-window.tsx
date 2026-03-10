"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Phone,
  Video,
  Info,
  Send,
  Smile,
  Paperclip,
  Eye,
  Menu,
  X,
} from "lucide-react";
import type { Customer, ConversationData } from "./chat-container";

interface ChatWindowProps {
  selectedCustomer: Customer | null;
  conversations: Record<string, ConversationData>;
  onSendMessage: (customerId: string, content: string) => void;
  onSaveNotes: (customerId: string, notes: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatWindow({
  selectedCustomer,
  conversations,
  onSendMessage,
  onSaveNotes,
  sidebarOpen,
  onToggleSidebar,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [noteText, setNoteText] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const currentConversation =
    selectedCustomer && conversations[selectedCustomer.id]
      ? conversations[selectedCustomer.id]
      : { messages: [], notes: "" };

  const handleSendMessage = () => {
    if (selectedCustomer && newMessage.trim()) {
      onSendMessage(selectedCustomer.id, newMessage);
      setNewMessage("");
    }
  };

  const handleSaveNotes = () => {
    if (selectedCustomer) {
      onSaveNotes(selectedCustomer.id, noteText);
    }
  };

  useEffect(() => {
    if (selectedCustomer) {
      setNoteText(currentConversation.notes || "");
    }
  }, [selectedCustomer?.id, currentConversation.notes]);

  if (!selectedCustomer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <h2 className="text-xl font-medium text-gray-500">
          Chọn một khách hàng để bắt đầu
        </h2>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen max-h-[calc(114vh-120px)] overflow-hidden bg-white border-l border-gray-200">
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white shrink-0 h-17.5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
          <Avatar className="w-10 h-10 border border-gray-100">
            <AvatarImage src={selectedCustomer.avatar} />
            <AvatarFallback>
              {selectedCustomer.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              {selectedCustomer.name}
            </h2>
            <p className="text-[11px] text-green-500 flex items-center gap-1 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
              Đang hoạt động
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* <Button variant="ghost" size="icon" className="text-gray-500">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Video className="w-4 h-4" />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotes(!showNotes)}
            className={showNotes ? "text-blue-600 bg-blue-50" : "text-gray-500"}
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentConversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "staff" ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="w-8 h-8 shrink-0 mt-1">
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col gap-1 ${message.role === "staff" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2 rounded-2xl shadow-sm ${message.role === "staff" ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-900 rounded-bl-none border border-gray-100"}`}
                  >
                    <p className="text-[13px] leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-100 shrink-0 ">
            {" "}
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-3 py-2 border border-gray-200 focus-within:border-blue-300 transition-all shadow-inner">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-blue-500 shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 text-[13px]"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-orange-500 shrink-0"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-9 w-9 p-0 flex items-center justify-center shrink-0 shadow-md disabled:bg-gray-300 transition-colors"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {showNotes && (
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden shadow-xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b font-bold flex items-center justify-between text-gray-800 shrink-0 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" /> Ghi chú
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotes(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-[13px] text-gray-700 leading-relaxed">
                <p className="mb-1">
                  <strong> Tên:</strong> {selectedCustomer.name}
                </p>
                <p className="mb-1">
                  <strong> SĐT:</strong> 0912345678
                </p>
                <p>
                  <strong> Email:</strong> customer@example.com
                </p>
              </div>
              <Card className="flex flex-col bg-white overflow-hidden border-gray-200 h-75 shadow-sm">
                <textarea
                  className="flex-1 p-4 text-[13px] border-0 resize-none focus:ring-0 bg-transparent"
                  value={noteText || currentConversation.notes}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Viết ghi chú quan trọng vào đây..."
                />
                <div className="p-3 border-t bg-gray-50">
                  <Button
                    onClick={handleSaveNotes}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold h-9"
                  >
                    CẬP NHẬT GHI CHÚ
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
