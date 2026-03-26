"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Search,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";

import { RequestDetailModal } from "./components/modals/moda-detail-request";
import { StaffUpdateModal } from "./components/modals/modal-staff-update";
import { TableRequest } from "./components/table-request";
import { ApartmentItem, ApartmentQueryParams } from "@/types/apartment";
import { useApartments } from "@/hooks/query/useApartments";
import { useRouter } from "next/navigation";

const mockRequests = [
  {
    id: "REQ-001",
    apartmentName: "Vinhome Grand Park - A101",
    partner: "ABC Real Estate",
    location: "Quận 9, TP.HCM",
    bedrooms: 2,
    area: "78 m²",
    price: "15,000,000",
    status: "verifying" as const,
    submittedDate: "2026-03-15",
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
    status: "inspecting" as const,
    submittedDate: "2026-03-12",
    staffUpdate: null,
  },
  {
    id: "REQ-003",
    apartmentName: "Midtown - C502",
    partner: "Premier Property",
    location: "Quận 1, TP.HCM",
    bedrooms: 1,
    area: "52 m²",
    price: "8,500,000",
    status: "submitted" as const,
    submittedDate: "2026-03-10",
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
    apartmentName: "Landmark 81 - D1001",
    partner: "Elite Realty",
    location: "Bình Thạnh, TP.HCM",
    bedrooms: 4,
    area: "180 m²",
    price: "45,000,000",
    status: "pending" as const,
    submittedDate: "2026-03-18",
    staffUpdate: null,
  },
  {
    id: "REQ-005",
    apartmentName: "Sunwah Pearl - E1203",
    partner: "Global Partners",
    location: "Quận 1, TP.HCM",
    bedrooms: 2,
    area: "85 m²",
    price: "18,500,000",
    status: "submitted" as const,
    submittedDate: "2026-03-08",
    staffUpdate: {
      exteriorCondition: "fair",
      interiorCondition: "good",
      notes: "Cần sơn lại một số bức tường, sàn sạch",
      files: [],
      updatedDate: "2026-03-09",
    },
  },
];

export default function RequestStaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApartmentItem | null>(
    null,
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [staffUpdateModalOpen, setStaffUpdateModalOpen] = useState(false);

  const [requestsWithUpdates, setRequestsWithUpdates] = useState<
    Map<string, any>
  >(
    new Map(
      mockRequests
        .filter((r) => r.staffUpdate)
        .map((r) => [r.id, r.staffUpdate]),
    ),
  );

  const [requestStatuses, setRequestStatuses] = useState<Map<string, string>>(
    new Map(mockRequests.map((r) => [r.id, r.status])),
  );

  const handleOpenDetail = (request: ApartmentItem) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const handleOpenStaffUpdate = (request: ApartmentItem) => {
    setSelectedRequest(request);
    setStaffUpdateModalOpen(true);
  };

  const handleStaffUpdateSubmit = (success: boolean) => {
    setStaffUpdateModalOpen(success);
  };

  // Get unique dates from mockRequests
  const uniqueDates = Array.from(
    new Set(mockRequests.map((req) => req.submittedDate)),
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const filteredRequests = mockRequests
    .map((req) => ({
      ...req,
      status: requestStatuses.get(req.id) || req.status,
      staffUpdate: requestsWithUpdates.get(req.id) || req.staffUpdate,
    }))
    .filter((req) => {
      const matchSearch =
        req.apartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.partner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = !statusFilter || req.status === statusFilter;

      const matchDate = !selectedDate || req.submittedDate === selectedDate;

      return matchSearch && matchStatus && matchDate;
    });

  const stats = {
    pending: filteredRequests.filter((r) => r.status === "pending").length,
    inspecting: filteredRequests.filter((r) => r.status === "inspecting")
      .length,
    verifying: filteredRequests.filter((r) => r.status === "verifying").length,
    submitted: filteredRequests.filter((r) => r.status === "submitted").length,
  };

  const toggleFilter = (status: string) => {
    setStatusFilter(statusFilter === status ? null : status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Duyệt Yêu cầu Căn hộ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý yêu cầu từ đối tác, khảo sát và gửi cho Operator
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className={`border rounded-2xl p-4 flex items-center justify-between bg-white cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "pending"
              ? "ring-2 ring-orange-400 border-transparent"
              : "border-gray-200"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Chờ duyệt
            </span>
            <span className="text-2xl font-semibold text-gray-900">
              {stats.pending}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 flex items-center justify-between bg-white cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "inspecting"
              ? "ring-2 ring-yellow-400 border-transparent"
              : "border-gray-200"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Khảo sát
            </span>
            <span className="text-2xl font-semibold text-gray-900">
              {stats.inspecting}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 flex items-center justify-between bg-white cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "verifying"
              ? "ring-2 ring-blue-400 border-transparent"
              : "border-gray-200"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Xác minh
            </span>
            <span className="text-2xl font-semibold text-gray-900">
              {stats.verifying}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 flex items-center justify-between bg-white cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "submitted"
              ? "ring-2 ring-green-400 border-transparent"
              : "border-gray-200"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Đã gửi
            </span>
            <span className="text-2xl font-semibold text-gray-900">
              {stats.submitted}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-2xl bg-white">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm căn hộ, đối tác..."
              className="pl-9 bg-gray-50/50 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-between w-full sm:w-48 bg-white"
              >
                {selectedDate ? `${selectedDate}` : "Chọn ngày"}
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 max-h-60 overflow-y-auto"
            >
              <DropdownMenuItem
                onClick={() => setSelectedDate(null)}
                className={!selectedDate ? "bg-gray-100" : ""}
              >
                <div className="flex items-center gap-3 w-full">
                  <span>Tất cả ngày</span>
                  {!selectedDate && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </div>
              </DropdownMenuItem>

              {uniqueDates.map((date) => (
                <DropdownMenuItem
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={selectedDate === date ? "bg-gray-100" : ""}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span>{date}</span>
                    {selectedDate === date && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto text-sm text-gray-500 whitespace-nowrap">
            Hiển thị{" "}
            <span className="font-semibold text-gray-900">
              {filteredRequests.length}
            </span>{" "}
            / {mockRequests.length}
          </div>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
        <TableRequest
          filteredRequests={filteredRequests}
          onOpenDetail={(request) => handleOpenDetail(request)}
          onOpenStaffUpdate={(request) => handleOpenStaffUpdate(request)}
        />
      </div>

      <RequestDetailModal
        open={detailModalOpen}
        id={String(selectedRequest?.id)}
        onClose={() => setDetailModalOpen(false)}
      />

      <StaffUpdateModal
        open={staffUpdateModalOpen}
        request={selectedRequest}
        onClose={() => setStaffUpdateModalOpen(false)}
        onUpdate={handleStaffUpdateSubmit}
      />
    </div>
  );
}
