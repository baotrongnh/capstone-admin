"use client";

import { useMemo, useState } from "react";

import { Pagination } from "antd";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontalIcon, EyeIcon, EditIcon, TrashIcon } from "lucide-react";
import { UserListItem } from "@/types/user";

interface TableUserProps {
  users: UserListItem[];
  onViewDetail?: (user: UserListItem) => void;
  onEdit?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const PAGE_SIZE = 7;

export function TableUser({
  users,
  onViewDetail,
  onEdit,
  onDelete,
}: TableUserProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = users.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return users.slice(start, start + PAGE_SIZE);
  }, [safeCurrentPage, users]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Người dùng</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Điện thoại</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Xác thực</TableHead>
            <TableHead className="font-semibold">Ngày tạo</TableHead>
            <TableHead className="text-right font-semibold">
              Hành động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50 transition">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.profileImageUrl || ""}
                      alt={user.fullName}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                      {getInitials(user.fullName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{user.fullName}</p>
                  </div>
                </div>
              </TableCell>

              {/* Email */}
              <TableCell className="text-sm text-gray-600">
                {user.email}
              </TableCell>

              {/* Phone */}
              <TableCell className="text-sm">{user.phone || "---"}</TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant={user.isActive ? "default" : "secondary"}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                    user.isActive
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {user.isActive ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </TableCell>

              {/* Verified */}
              <TableCell>
                <Badge
                  variant={user.isVerified ? "default" : "secondary"}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition ${
                    user.isVerified
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  }`}
                >
                  {user.isVerified ? "Xác thực" : "Chờ xác thực"}
                </Badge>
              </TableCell>

              {/* Last Login */}
              <TableCell className="text-sm text-gray-600">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                  : "---"}
              </TableCell>

              {/* Actions */}
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
                        onClick={() => onViewDetail(user)}
                        className="cursor-pointer"
                      >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        <span>Xem chi tiết</span>
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={() => onEdit(user)}
                        className="cursor-pointer"
                      >
                        <EditIcon className="mr-2 h-4 w-4" />
                        <span>Sửa thông tin</span>
                      </DropdownMenuItem>
                    )}
                    {(onDelete || true) && <DropdownMenuSeparator />}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        {user.isActive
                          ? "Khóa người dùng"
                          : "Mở khóa người dùng"}
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
          Không có dữ liệu người dùng
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
