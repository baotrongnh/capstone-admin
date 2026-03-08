"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle } from "lucide-react";
import type { Customer } from "./chat-container";

interface ChatSidebarProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
}

export function ChatSidebar({
  customers,
  selectedCustomer,
  onSelectCustomer,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden\">
      <div className="p-4 border-b border-gray-200 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-8 h-8 text-blue-600" />
          Tin nhắn
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 border-0 rounded-full focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => onSelectCustomer(customer)}
              className={`p-3 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                selectedCustomer?.id === customer.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={customer.avatar} alt={customer.name} />
                    <AvatarFallback>
                      {customer.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {customer.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {customer.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {customer.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {customer.lastMessage}
                  </p>
                </div>
                {customer.unreadCount && customer.unreadCount > 0 && (
                  <Badge className="bg-red-500 hover:bg-red-600 rounded-full ml-2">
                    {customer.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>Không tìm thấy khách hàng</p>
          </div>
        )}
      </div>
    </div>
  );
}
