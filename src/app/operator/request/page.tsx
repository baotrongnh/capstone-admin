"use client";

import { useState } from "react";
import type { Request } from "./types";
import {
  Search,
  ChevronDown,
  Clock,
  ClipboardList,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModalApproveRequest } from "../../../components/modal/approve-request-operator-modal";
import { TableRequestOperator } from "../../../components/table/table-request-operator";

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    order: number;
  }
> = {
  submitted: {
    label: "Chờ duyệt",
    color: "bg-yellow-100 text-yellow-800",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    order: 1,
  },
  approved: {
    label: "Đã chấp nhận",
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    order: 2,
  },
  rejected: {
    label: "Từ chối",
    color: "bg-red-100 text-red-800",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    order: 3,
  },
};

const mockOperatorRequests: Request[] = [
  {
    id: "REQ-001",
    apartmentName: "Vinhome Grand Park - A101",
    partner: "ABC Real Estate",
    location: "Quận 9, TP.HCM",
    bedrooms: 2,
    area: "78 m²",
    price: "15,000,000",
    status: "submitted",
    submittedDate: "2026-03-16",
    staffUpdate: {
      exteriorCondition: "very_good",
      interiorCondition: "good",
      notes: "Căn hộ sạch, tường hơi trầy xước ở một vài chỗ",
      files: [],
      updatedDate: "2026-03-16",
    },
  },
  {
    id: "REQ-002",
    apartmentName: "The Global City - B205",
    partner: "XYZ Partners",
    location: "Quận 2, TP.HCM",
    bedrooms: 3,
    area: "95 m²",
    price: "22,500,000",
    status: "submitted",
    submittedDate: "2026-03-13",
    staffUpdate: {
      exteriorCondition: "good",
      interiorCondition: "excellent",
      notes: "Căn hộ như mới, sạch sẽ, full nội thất cao cấp",
      files: [],
      updatedDate: "2026-03-13",
    },
  },
  {
    id: "REQ-003",
    apartmentName: "Midtown - C502",
    partner: "Premier Property",
    location: "Quận 1, TP.HCM",
    bedrooms: 1,
    area: "52 m²",
    price: "8,500,000",
    status: "approved",
    submittedDate: "2026-03-11",
    staffUpdate: {
      exteriorCondition: "good",
      interiorCondition: "excellent",
      notes: "Căn hộ như mới, sạch sẽ, full nội thất cao cấp",
      files: [],
      updatedDate: "2026-03-11",
    },
  },
  {
    id: "REQ-004",
    apartmentName: "Sunwah Pearl - E1203",
    partner: "Global Partners",
    location: "Quận 1, TP.HCM",
    bedrooms: 2,
    area: "85 m²",
    price: "18,500,000",
    status: "rejected",
    submittedDate: "2026-03-09",
    staffUpdate: {
      exteriorCondition: "fair",
      interiorCondition: "good",
      notes: "Cần sơn lại một số bức tường, sàn sạch",
      files: [],
      updatedDate: "2026-03-09",
    },
  },
];

export default function RequestOperatorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const [requestStatuses, setRequestStatuses] = useState<Map<string, string>>(
    new Map(mockOperatorRequests.map((r) => [r.id, r.status])),
  );

  const handleOpenApproveModal = (request: Request) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      requestStatuses.set(selectedRequest.id, "approved");
      setRequestStatuses(new Map(requestStatuses));
      setApproveModalOpen(false);
      console.log("Request approved:", selectedRequest.id);
    }
  };

  const handleReject = () => {};

  const filteredRequests: Request[] = mockOperatorRequests
    .map((req) => ({
      ...req,
      status: (requestStatuses.get(req.id) || req.status) as
        | "submitted"
        | "approved"
        | "rejected",
    }))
    .filter((req) => {
      const matchSearch =
        req.apartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.partner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = !statusFilter || req.status === statusFilter;

      return matchSearch && matchStatus;
    });

  // Tạm thời map data tĩnh cho các trạng thái mới dựa theo thiết kế (bạn có thể thay đổi logic tính toán sau)
  const stats = {
    pending: filteredRequests.filter((r) => r.status === "submitted").length,
    surveying: 1, // Mock
    verifying: 1, // Mock
    sent: filteredRequests.filter((r) => r.status === "approved").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Duyệt Yêu cầu Căn hộ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý yêu cầu từ đối tác, khảo sát và gửi cho Operator
        </p>
      </div>

      {/* Stats Cards (Như ảnh thiết kế) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Chờ duyệt */}
        <div className="bg-white border rounded-2xl p-4 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[11px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">
              Chờ duyệt
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.pending}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Clock size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Khảo sát */}
        <div className="bg-white border rounded-2xl p-4 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[11px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">
              Khảo sát
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.surveying}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
            <ClipboardList size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Xác minh */}
        <div className="bg-white border rounded-2xl p-4 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[11px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">
              Xác minh
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.verifying}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <CheckCircle2 size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Đã gửi */}
        <div className="bg-white border rounded-2xl p-4 flex justify-between items-center shadow-sm">
          <div>
            <p className="text-[11px] text-gray-500 font-semibold mb-2 uppercase tracking-wide">
              Đã gửi
            </p>
            <p className="text-2xl font-semibold text-gray-900">{stats.sent}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <Send size={18} strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar (Như ảnh thiết kế) */}
      <div className="bg-white border rounded-2xl p-2 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto pl-2">
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Trạng thái:
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 min-w-40 justify-between h-9 bg-white border-gray-200 text-gray-700"
              >
                <span className="font-normal text-sm">
                  {statusFilter
                    ? statusConfig[statusFilter]?.label
                    : "Tất cả yêu cầu"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={() => setStatusFilter(null)}
                className={!statusFilter ? "bg-gray-100" : ""}
              >
                Tất cả yêu cầu
              </DropdownMenuItem>
              {Object.entries(statusConfig)
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([status, config]) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "bg-gray-100" : ""}
                  >
                    {config.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1"></div>

          <div className="relative flex-1 sm:min-w-75">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm căn hộ, đối tác..."
              className="pl-9 h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-sm text-gray-500 pr-4 whitespace-nowrap">
          Hiển thị{" "}
          <span className="font-bold text-gray-800">
            {filteredRequests.length}
          </span>{" "}
          / {mockOperatorRequests.length}
        </div>
      </div>

      {/* Table */}
      <TableRequestOperator
        filteredRequests={filteredRequests}
        statusConfig={statusConfig}
        onOpenApprove={handleOpenApproveModal}
      />

      {/* Modal */}
      <ModalApproveRequest
        open={approveModalOpen}
        request={selectedRequest}
        staffUpdate={selectedRequest?.staffUpdate}
        onClose={() => setApproveModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
