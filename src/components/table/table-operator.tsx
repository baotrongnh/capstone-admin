"use client";

import { useMemo, useState } from "react";

import { Pagination } from "antd";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { OperatorItem } from "@/lib/services/operator.service";
import { EditIcon, EyeIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";

interface TableOperatorProps {
  operators: (OperatorItem | null)[] | undefined;
  onViewDetail?: (operator: OperatorItem) => void;
  onEdit?: (operator: OperatorItem) => void;
  onDelete?: (operator: OperatorItem) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const isOperatorItem = (member: OperatorItem | null): member is OperatorItem =>
  member !== null;

const PAGE_SIZE = 7;

export default function TableOperator({
  operators,
  onViewDetail,
  onEdit,
  onDelete,
}: TableOperatorProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const operatorMembers = useMemo(
    () => (operators ?? []).filter(isOperatorItem),
    [operators],
  );
  const totalItems = operatorMembers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOperators = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return operatorMembers.slice(start, start + PAGE_SIZE);
  }, [operatorMembers, safeCurrentPage]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Nhân viên vận hành</TableHead>
            <TableHead className="font-semibold">Mã nhân viên</TableHead>

            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Điện thoại</TableHead>
            <TableHead className="font-semibold">Ca làm việc</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="text-right font-semibold">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOperators.map((member) => (
            <TableRow key={member.id} className="hover:bg-gray-50 transition">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={member.profileImageUrl || ""}
                      alt={member.fullName}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                      {getInitials(member.fullName || "O")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{member.fullName}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="text-sm text-gray-600">
                {member.employeeCode || "---"}
              </TableCell>

              {/* Email */}
              <TableCell className="text-sm text-gray-600">
                {member.email}
              </TableCell>

              {/* Phone */}
              <TableCell className="text-sm">{member.phone || "---"}</TableCell>

              {/* Shift */}
              <TableCell className="text-sm text-gray-600">
                {member.operatorShift === "flexible" && "Ca linh hoạt"}
                {member.operatorShift === "morning" && "Ca sáng"}
                {member.operatorShift === "afternoon" && "Ca chiều"}
                {member.operatorShift === "night" && "Ca đêm"}
                {!member.operatorShift && "---"}
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant={member.isActive ? "default" : "secondary"}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                    member.isActive
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {member.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </TableCell>

              {/* Join Date */}

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon className="size-4" />
                      <span className="sr-only">Mở menu thao tác</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {onViewDetail && (
                      <DropdownMenuItem
                        onClick={() => onViewDetail(member)}
                        className="cursor-pointer"
                      >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        <span>Xem chi tiết</span>
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={() => onEdit(member)}
                        className="cursor-pointer"
                      >
                        <EditIcon className="mr-2 h-4 w-4" />
                        <span>Sửa thông tin</span>
                      </DropdownMenuItem>
                    )}
                    {(onDelete || true) && <DropdownMenuSeparator />}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(member)}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        {member.isActive
                          ? "Khóa nhân viên vận hành"
                          : "Mở khóa nhân viên vận hành"}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalItems === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không có dữ liệu nhân viên vận hành
        </div>
      )}
      {totalItems > PAGE_SIZE && (
        <div className="flex justify-end border-t bg-white px-4 py-3">
          <Pagination
            current={safeCurrentPage}
            total={totalItems}
            pageSize={PAGE_SIZE}
            showSizeChanger={false}
            onChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
