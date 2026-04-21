"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Request } from "@/types/request";
import { MoreHorizontalIcon } from "lucide-react";

interface TableRequestOperatorProps {
  filteredRequests: Request[];
  onViewDetail: (request: Request) => void;
  onOpenApprove: (request: Request) => void;
  onOpenReject: (request: Request) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  verified: {
    label: "Chờ duyệt",
    className: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
};

const formatPhoneNumber = (phone?: string | null) => {
  if (!phone) return "N/A";
  // Xóa các ký tự không phải số (nếu có)
  let cleaned = phone.replace(/\D/g, "");

  // Thay thế 84 ở đầu bằng 0
  if (cleaned.startsWith("84")) {
    cleaned = "0" + cleaned.slice(2);
  }

  // Nếu là số điện thoại 10 số chuẩn VN (VD: 0912.345.678)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  }

  // Nếu độ dài khác, tự động chèn dấu chấm sau mỗi 3 số
  return cleaned.replace(/(\d{3})(?=\d)/g, "$1.");
};

const formatDateVN = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try {
    // Parse ISO string và convert sang Vietnam timezone (UTC+7)
    const date = new Date(dateString);

    // Tạo formatter cho Vietnam timezone
    const vnFormatter = new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });

    // Format theo pattern DD/MM/YYYY
    const parts = vnFormatter.formatToParts(date);
    const dayPart = parts.find((p) => p.type === "day")?.value || "";
    const monthPart = parts.find((p) => p.type === "month")?.value || "";
    const yearPart = parts.find((p) => p.type === "year")?.value || "";

    return `${dayPart}/${monthPart}/${yearPart}`;
  } catch {
    return "N/A";
  }
};

export function TableRequestOperator({
  filteredRequests,
  onOpenReject,
  onOpenApprove,
  onViewDetail,
}: TableRequestOperatorProps) {
  console.log("DA", filteredRequests);
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Tên đối tác</TableHead>
            <TableHead className="font-semibold">Số điện thoại</TableHead>

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
          {filteredRequests.map((request) => (
            <TableRow key={request.id} className="hover:bg-gray-50 transition">
              <TableCell className="text-sm">
                {request?.owner?.fullName || "N/A"}
              </TableCell>
              <TableCell className="text-sm">
                {formatPhoneNumber(request?.owner?.phone)}
              </TableCell>

              <TableCell className="text-sm">
                {request.apartmentName?.split(" - ")[0] || "N/A"}
              </TableCell>

              <TableCell className="text-sm">
                {request.location}, {request.wardName}
              </TableCell>

              <TableCell className="text-sm">{request.deposit} đ</TableCell>

              <TableCell className="text-sm">{request.price} đ</TableCell>

              <TableCell className="text-sm">
                {formatDateVN(request.createdAt)}
              </TableCell>

              <TableCell>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition
                      ${
                        statusConfig[request.status]?.className ||
                        "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  Chờ duyệt
                </span>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon className="size-4" />
                      <span className="sr-only">Mở menu thao tác</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetail(request)}>
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenApprove(request)}>
                      Duyệt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onOpenReject(request)}
                      variant="destructive"
                    >
                      Từ chối
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
