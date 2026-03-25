"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableRequestOperatorProps {
  filteredRequests: any[];
  statusConfig: Record<
    string,
    {
      label: string;
      color: string;
    }
  >;
  onOpenApprove: (request: any) => void;
}

export function TableRequestOperator({
  filteredRequests,
  statusConfig,
  onOpenApprove,
}: TableRequestOperatorProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Mã</TableHead>
            <TableHead className="font-semibold">Căn hộ</TableHead>
            <TableHead className="font-semibold">Đối tác</TableHead>
            <TableHead className="font-semibold">Vị trí</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày</TableHead>
            <TableHead className="text-right font-semibold">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.map((request) => (
            <TableRow key={request.id} className="hover:bg-gray-50">
              <TableCell className="font-mono text-sm">{request.id}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{request.apartmentName}</p>
                  <p className="text-xs text-gray-600">
                    {request.bedrooms} phòng • {request.area}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{request.partner}</TableCell>
              <TableCell className="text-sm">{request.location}</TableCell>
              <TableCell>
                <span
                  className={`px-3 py-1 rounded-lg font-medium text-xs ${statusConfig[request.status].color}`}
                >
                  {statusConfig[request.status].label}
                </span>
              </TableCell>
              <TableCell className="text-sm">{request.submittedDate}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  title={
                    request.status === "submitted"
                      ? "Xem chi tiết và duyệt"
                      : "Xem lại thông tin"
                  }
                  onClick={() => onOpenApprove(request)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
