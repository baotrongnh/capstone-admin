"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useApartments } from "@/hooks/query/useApartments";
import { ApartmentItem, ApartmentQueryParams } from "@/types/apartment";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ModalApproveRequest } from "../../../components/modal/approve-request-operator-modal";
import { TableRequestOperator } from "../../../components/table/table-request-operator";
import type { Request } from "./types";
import { useRouter } from "next/navigation";

export default function RequestOperatorPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;

  const params = useMemo<ApartmentQueryParams>(
    () => ({
      sortBy: "baseRentPrice",
      sortOrder: "asc",
      status: "verified",
    }),
    [],
  );

  const { data: apartments } = useApartments(params);

  const allRequests = useMemo(() => apartments?.data || [], [apartments?.data]);

  const handleOpenApproveModal = (request: Request) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleReject = () => {
    if (selectedRequest) {
      console.log("Request rejected:", selectedRequest.id);
      setApproveModalOpen(false);
    }
  };

  const filteredRequests: Request[] = useMemo(() => {
    return (allRequests as ApartmentItem[])
      .map((apt: ApartmentItem) => ({
        id: apt.id,
        apartmentName: `${apt.buildingName} - ${apt.apartmentNumber}`,
        partner: "",
        location: apt.streetAddress || "N/A",
        bedrooms: apt.numberOfBedrooms || 0,
        area: `${apt.totalArea || 0} m²`,
        price: new Intl.NumberFormat("vi-VN").format(
          Number(apt.baseRentPrice) || 0,
        ),
        deposit: new Intl.NumberFormat("vi-VN").format(
          Number(apt.depositAmount) || 0,
        ),
        status: (apt.status || "submitted") as Request["status"],
        submittedDate: apt.createdAt
          ? new Date(apt.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        staffUpdate: {
          exteriorCondition: "good",
          interiorCondition: "good",
          notes: apt.description || "",
          files: [],
          updatedDate: apt.createdAt
            ? new Date(apt.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        },
      }))
      .filter((req) => {
        const matchSearch = req.apartmentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchDate = !selectedDate || req.submittedDate === selectedDate;

        return matchSearch && matchDate;
      });
  }, [searchTerm, selectedDate, allRequests]);

  const uniqueDates = useMemo(() => {
    return Array.from(
      new Set(
        (allRequests as ApartmentItem[]).map(
          (req: ApartmentItem) =>
            new Date(req.createdAt).toISOString().split("T")[0],
        ),
      ),
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [allRequests]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1);
    callback();
  };

  const handleViewDetail = (request: Request) => {
    router.push(`/operator/apartments/${request.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Duyệt Yêu cầu Căn hộ
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý yêu cầu từ đối tác, khảo sát và gửi cho Operator
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm căn hộ, tòa nhà..."
              className="pl-9 bg-gray-50/50 w-full"
              value={searchTerm}
              onChange={(e) =>
                handleFilterChange(() => setSearchTerm(e.target.value))
              }
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
                onClick={() => handleFilterChange(() => setSelectedDate(null))}
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
                  onClick={() =>
                    handleFilterChange(() => setSelectedDate(date))
                  }
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
              {filteredRequests.length === 0
                ? 0
                : Math.min(startIndex + 1, filteredRequests.length)}{" "}
              - {Math.min(endIndex, filteredRequests.length)}
            </span>{" "}
            của{" "}
            <span className="font-semibold text-gray-900">
              {filteredRequests.length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <TableRequestOperator
          filteredRequests={paginatedRequests}
          onOpenApprove={(request) => handleOpenApproveModal(request)}
          onViewDetail={(request) => handleViewDetail(request)}
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm w-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-gray-500 hover:text-gray-900 rounded-lg px-3 h-8 text-xs font-medium"
            >
              Trước
            </Button>

            <div className="flex items-center gap-1 px-2 border-x border-gray-100">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 p-0 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="text-gray-500 hover:text-gray-900 rounded-lg px-3 h-8 text-xs font-medium"
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <ModalApproveRequest
        open={approveModalOpen}
        request={selectedRequest}
        staffUpdate={selectedRequest?.staffUpdate}
        onClose={() => setApproveModalOpen(false)}
        onReject={handleReject}
      />
    </div>
  );
}
