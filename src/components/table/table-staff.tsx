"use client";

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
import { StaffItem } from "@/lib/services/staff.service";
import { EditIcon, EyeIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";

interface TableStaffProps {
  staff: (StaffItem | null)[] | undefined;
  onViewDetail?: (staff: StaffItem) => void;
  onEdit?: (staff: StaffItem) => void;
  onDelete?: (staff: StaffItem) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const roleColors: Record<string, { bg: string; text: string; border: string }> =
  {
    admin: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    manager: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
    },
    operator: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
    },
    staff: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
    maintenance: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200",
    },
  };

export default function TableStaff({
  staff,
  onViewDetail,
  onEdit,
  onDelete,
}: TableStaffProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Nhân viên</TableHead>
            <TableHead className="font-semibold">Mã nhân viên</TableHead>

            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Điện thoại</TableHead>
            <TableHead className="font-semibold">Phòng ban</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày tạo</TableHead>
            <TableHead className="text-right font-semibold">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff?.map((member) => {
            if (!member) return null;
            return (
              <TableRow key={member.id} className="hover:bg-gray-50 transition">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={member.profileImageUrl || ""}
                        alt={member.fullName}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                        {getInitials(member.fullName || "S")}
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
                <TableCell className="text-sm">
                  {member.phone || "---"}
                </TableCell>

                {/* Department */}
                <TableCell className="text-sm text-gray-600">
                  {member.staffRole === "customer_service" &&
                    "Dịch vụ khách hàng"}
                  {member.staffRole === "maintenance" && "Bảo trì"}
                  {member.staffRole === "technician" && "Kỹ thuật viên"}
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
                <TableCell className="text-sm text-gray-600">
                  {member.createdAt
                    ? new Date(member.createdAt).toLocaleDateString("vi-VN")
                    : "---"}
                </TableCell>

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
                            ? "Khóa nhân viên"
                            : "Mở khóa nhân viên"}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!staff ||
        (staff.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu nhân viên
          </div>
        ))}
    </div>
  );
}
