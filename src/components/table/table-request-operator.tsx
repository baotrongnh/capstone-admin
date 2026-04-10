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

export function TableRequestOperator({
  filteredRequests,
  onOpenReject,
  onOpenApprove,
  onViewDetail,
}: TableRequestOperatorProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
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
          {filteredRequests.map((request) => (
            <TableRow key={request.id} className="hover:bg-gray-50 transition">
              <TableCell>
                <div>
                  <p className="font-medium text-sm">
                    {request.apartmentName || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.bedrooms} phòng • {request.area}
                  </p>
                </div>
              </TableCell>

              <TableCell className="text-sm">
                {request.apartmentName?.split(" - ")[0] || "N/A"}
              </TableCell>

              <TableCell className="text-sm">{request.location}</TableCell>

              <TableCell className="text-sm">{request.deposit} đ</TableCell>

              <TableCell className="text-sm">{request.price} đ</TableCell>

              <TableCell className="text-sm">{request.submittedDate}</TableCell>

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
