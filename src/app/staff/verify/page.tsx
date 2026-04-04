"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Eye,
  MoreHorizontalIcon,
  Trash2,
  FileText,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
// import { useUsers } from "@/hooks/useUser";

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  dob: string;
  address: string;
  idFront: string;
  idBack: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
}

export interface Contract {
  id: string;
  tenantName: string;
  tenantId: string;
  apartmentName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: "active" | "expired" | "pending";
  createdAt: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "CUST-001",
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    idNumber: "123456789012",
    dob: "1990-05-15",
    address: "123 Đường A, Quận 1, TP.HCM",
    idFront: "https://via.placeholder.com/400x250?text=ID+Front",
    idBack: "https://via.placeholder.com/400x250?text=ID+Back",
    status: "pending",
    submittedAt: "2024-03-07",
  },
  {
    id: "CUST-002",
    fullName: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0902345678",
    idNumber: "234567890123",
    dob: "1992-08-20",
    address: "456 Đường B, Quận 2, TP.HCM",
    idFront: "https://via.placeholder.com/400x250?text=ID+Front",
    idBack: "https://via.placeholder.com/400x250?text=ID+Back",
    status: "pending",
    submittedAt: "2024-03-06",
  },
];

const MOCK_CONTRACTS: Contract[] = [
  {
    id: "HD-2024-001",
    tenantName: "Nguyễn Văn A",
    tenantId: "CUST-001",
    apartmentName: "P.301 - Tòa A",
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-12-31T00:00:00.000Z",
    rentAmount: 5500000,
    status: "active",
    createdAt: "2023-12-25T14:30:00.000Z",
  },
  {
    id: "HD-2023-089",
    tenantName: "Nguyễn Văn A",
    tenantId: "CUST-001",
    apartmentName: "P.102 - Tòa B",
    startDate: "2023-01-01T00:00:00.000Z",
    endDate: "2023-12-31T00:00:00.000Z",
    rentAmount: 4500000,
    status: "expired",
    createdAt: "2022-12-20T09:15:00.000Z",
  },
];

export default function VerifyPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [openImageModal, setOpenImageModal] = useState(false);

  // const { data: user, loading, error } = useUsers();

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.idNumber.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const customerContracts = MOCK_CONTRACTS.filter(
    (contract) => contract.tenantId === selectedCustomer?.id,
  );

  const handleViewImage = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenImageModal(true);
  };

  const handleVerifyNow = () => {
    if (!selectedCustomer) return;

    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, status: "verified" } : c,
      ),
    );

    toast.success(`Đã xác thực thành công cho ${selectedCustomer.fullName}`);
    setOpenImageModal(false);
    setSelectedCustomer(null);
  };

  const handleReject = (customer: Customer) => {
    setCustomers(
      customers.map((c) =>
        c.id === customer.id ? { ...c, status: "rejected" } : c,
      ),
    );
    toast.error(
      `Đã từ chối xác thực cho ${customer.fullName}. Vui lòng liên hệ khách hàng để cập nhật thông tin.`,
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Đã xác thực
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <FileText className="w-3 h-3 mr-1" /> Chờ xác thực
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="w-3 h-3 mr-1" /> Bị từ chối
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="px-8 py-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Xác thực thông tin khách hàng
            </h1>
            <p className="text-slate-600 mt-1">
              Xác minh và quản lý thông tin chứng minh thư của khách hàng.
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <p className="text-slate-600 font-medium text-sm">
              Tổng khách hàng
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {customers.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <p className="text-green-600 font-medium text-sm">Đã xác thực</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {customers.filter((c) => c.status === "verified").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <p className="text-yellow-600 font-medium text-sm">Chờ xác thực</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {customers.filter((c) => c.status === "pending").length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <p className="text-red-600 font-medium text-sm">Bị từ chối</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {customers.filter((c) => c.status === "rejected").length}
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 border-b border-slate-200 flex items-center gap-4">
        <div className="flex-1">
          <Label
            htmlFor="search"
            className="text-sm font-medium text-slate-700 mb-2 block"
          >
            Tìm kiếm
          </Label>
          <Input
            id="search"
            placeholder="Tìm theo tên người dùng, cần hộ hoặc ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-slate-200 w-100 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="pt-6">
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Lọc theo trạng thái
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ xác thực</SelectItem>
              <SelectItem value="verified">Đã xác thực</SelectItem>
              <SelectItem value="rejected">Bị từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700 w-16">
                  ID
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Khách hàng
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Liên hệ
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  CCCD
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Ngày sinh
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Trạng thái
                </TableHead>
                <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  Ngày gửi
                </TableHead>
                <TableHead className="px-6 py-4 text-center text-sm font-semibold text-slate-700 w-12">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4 text-sm font-medium text-slate-600">
                      #{customer.id}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {customer.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID: {customer.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-slate-700">
                          {customer.email}
                        </div>
                        <div className="text-sm text-slate-700">
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <code className="text-sm font-mono text-slate-900">
                        {customer.idNumber}
                      </code>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-700">
                      {new Date(customer.dob).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {getStatusBadge(customer.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-slate-700">
                      {new Date(customer.submittedAt).toLocaleDateString(
                        "vi-VN",
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewImage(customer)}
                          className="border-slate-200 text-slate-700 hover:bg-blue-50 h-8 w-8 p-0"
                          title="Xem chứng minh thư"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontalIcon className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-slate-700">
                              Hành động
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {customer.status === "pending" && (
                              <DropdownMenuItem
                                onClick={() => handleReject(customer)}
                                className="cursor-pointer text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Từ chối xác
                                thực
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" /> Xóa hồ sơ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-slate-500">Không tìm thấy khách hàng</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
