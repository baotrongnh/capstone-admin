"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApartments } from "@/hooks/query/useApartments";
import { ApartmentItem, ApartmentQueryParams } from "@/types/apartment";
import { message } from "antd";
import { useRouter } from "next/navigation";
import { TableRequest } from "../../../components/table/table-request-staff";

export default function RequestStaffPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const params = useMemo<ApartmentQueryParams>(
    () => ({
      sortBy: "baseRentPrice",
      sortOrder: "asc",
      status: "inactive",
    }),
    [],
  );

  const { data: apartments } = useApartments(params);
  const allRequests = useMemo(() => apartments?.data || [], [apartments?.data]);

  console.log("|A", apartments);

  const handleViewDetail = (request: ApartmentItem) => {
    router.push(`/staff/request/${request.id}`);
  };

  const handleEdit = (request: ApartmentItem) => {
    router.push(`/staff/request/${request.id}?mode=edit`);
  };

  const handleDelete = (request: ApartmentItem) => {
    message.info(`Sẽ xóa yêu cầu: ${request.id}`);
  };

  const filteredRequests = useMemo(() => {
    return allRequests.filter((req) => {
      const matchSearch =
        req.apartmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.buildingName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = !statusFilter || req.status === statusFilter;

      const matchDate = !selectedDate || req.createdAt === selectedDate;

      return matchSearch && matchStatus && matchDate;
    });
  }, [searchTerm, statusFilter, selectedDate, allRequests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(allRequests.map((req) => req.createdAt))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );
  }, [allRequests]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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

      <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-2xl bg-white">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm căn hộ, tòa nhà..."
              className="pl-9 bg-gray-50/50 w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 justify-between w-full sm:w-48 bg-white"
              >
                {selectedDate ? formatDateTime(selectedDate) : "Chọn ngày"}
                <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-48 max-h-60 overflow-y-auto p-0"
            >
              <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b">
                Chọn ngày
              </div>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedDate(null);
                  setCurrentPage(1);
                }}
                className={`cursor-pointer ${!selectedDate ? "bg-gray-100" : ""}`}
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
                  onClick={() => {
                    setSelectedDate(date);
                    setCurrentPage(1);
                  }}
                  className={`cursor-pointer ${selectedDate === date ? "bg-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span>{formatDateTime(date)}</span>
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
              {filteredRequests.length === 0 ? 0 : startIndex + 1}
            </span>{" "}
            -{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(endIndex, filteredRequests.length)}
            </span>{" "}
            của{" "}
            <span className="font-semibold text-gray-900">
              {filteredRequests.length}
            </span>
          </div>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
        <TableRequest
          filteredRequests={paginatedRequests}
          onViewDetail={(request) => handleViewDetail(request)}
          onEdit={(request) => handleEdit(request)}
          onDelete={(request) => handleDelete(request)}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`min-w-10 ${
                  currentPage === page
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
