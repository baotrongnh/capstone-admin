"use client";

import { Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApartments } from "@/hooks/query/useApartments";
import { useMemo } from "react";
import { ApartmentItem, ApartmentQueryParams } from "@/types/apartment";

interface TableRequestProps {
  filteredRequests: ApartmentItem[];
  onOpenDetail: (request: ApartmentItem) => void;
  onOpenStaffUpdate: (request: ApartmentItem) => void;
}

export function TableRequest({
  filteredRequests,
  onOpenDetail,
  onOpenStaffUpdate,
}: TableRequestProps) {
  const params = useMemo<ApartmentQueryParams>(
    () => ({
      sortBy: "baseRentPrice",
      sortOrder: "asc",
      status: "inactive",
    }),
    [],
  );

  const { data: apartments } = useApartments(params);

  const displayData = apartments?.data || filteredRequests;

  const statusConfig: Record<string, { label: string; className: string }> = {
    inactive: {
      label: "Chờ duyệt",
      className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    },
  };

  const formatCurrency = (value?: number | string) => {
    if (!value) return "N/A";
    return `${Number(value).toLocaleString("vi-VN")} ₫`;
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Căn hộ</TableHead>
            <TableHead className="font-semibold">Tòa nhà</TableHead>
            <TableHead className="font-semibold">Địa chỉ</TableHead>
            <TableHead className="font-semibold">Tiền cọc</TableHead>
            <TableHead className="font-semibold">Giá thuê</TableHead>
            <TableHead className="font-semibold">Ngày tạo</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="text-right font-semibold">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {displayData?.length > 0 ? (
            displayData.map((item: ApartmentItem) => (
              <TableRow key={item.id} className="hover:bg-gray-50 transition">
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {item.apartmentNumber || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.numberOfBedrooms || 0} phòng •{" "}
                      {item.numberOfBathrooms || 0} WC
                    </p>
                  </div>
                </TableCell>

                {/* TÒA NHÀ */}
                <TableCell className="text-sm">
                  {item.buildingName || "N/A"}
                </TableCell>

                {/* ĐỊA CHỈ */}
                <TableCell className="text-sm">
                  {/* {item.address || "N/A"} */}
                </TableCell>

                {/* TIỀN CỌC */}
                <TableCell className="text-sm">
                  {formatCurrency(item.depositAmount || "N/A")}
                </TableCell>

                <TableCell className="text-sm font-semibold text-blue-600">
                  {formatCurrency(item.baseRentPrice || "N/A")}
                </TableCell>

                <TableCell className="text-sm">
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                    : "N/A"}
                </TableCell>

                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition
                      ${
                        statusConfig[item.status]?.className ||
                        "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {statusConfig[item.status]?.label || item.status}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Xem chi tiết"
                      onClick={() => onOpenDetail(item)}
                      className="hover:bg-blue-50 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      title="Cập nhật"
                      onClick={() => onOpenStaffUpdate(item)}
                      className="hover:bg-indigo-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
