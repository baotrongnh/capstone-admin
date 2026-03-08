"use client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MoreHorizontalIcon,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  Home,
  User,
  Download,
  PenTool,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateContractModal } from "@/components/modal/modalContracts/modalCreateContract";
import { ContractDetailModal } from "@/components/modal/modalContracts/modalDetailContract";
import { ContractEditModal } from "@/components/modal/modalContracts/modalEditContract";
import { ContractActivateModal } from "@/components/modal/modalContracts/modalActiveContract";
import { ContractTerminateModal } from "@/components/modal/modalContracts/modalTerminateContract";
import { ContractPreviewModal } from "@/components/modal/modalContracts/modalPreviewContract";

// Mock data
const MOCK_CONTRACTS = [
  {
    id: "CT-001",
    tenantName: "Nguyễn Văn A",
    tenantId: "T001",
    apartmentName: "BS16 - Vinhomes Grand Park",
    apartmentId: "APT-001",
    status: "active" as const,
    startDate: "2024-01-15",
    endDate: "2025-01-15",
    rentAmount: 15000000,
    createdAt: "2024-01-10",
  },
  {
    id: "CT-002",
    tenantName: "Trần Thị B",
    tenantId: "T002",
    apartmentName: "C7 - Saigon Pearl",
    apartmentId: "APT-002",
    status: "pending" as const,
    startDate: "2024-02-01",
    endDate: "2025-02-01",
    rentAmount: 20000000,
    createdAt: "2024-01-20",
  },
  {
    id: "CT-003",
    tenantName: "Lê Minh C",
    tenantId: "T003",
    apartmentName: "T1 - Masteri Thảo Điền",
    apartmentId: "APT-003",
    status: "draft" as const,
    startDate: "2024-03-01",
    endDate: "2025-03-01",
    rentAmount: 12000000,
    createdAt: "2024-02-15",
  },
  {
    id: "CT-004",
    tenantName: "Phạm Huy D",
    tenantId: "T004",
    apartmentName: "D5 - City Garden",
    apartmentId: "APT-004",
    status: "terminated" as const,
    startDate: "2023-01-01",
    endDate: "2024-01-01",
    rentAmount: 18000000,
    createdAt: "2023-12-20",
  },
  {
    id: "CT-005",
    tenantName: "Võ Thị E",
    tenantId: "T005",
    apartmentName: "A2 - Diamond Island",
    apartmentId: "APT-005",
    status: "active" as const,
    startDate: "2024-02-20",
    endDate: "2025-02-20",
    rentAmount: 25000000,
    createdAt: "2024-02-10",
  },
] as const satisfies readonly Contract[];

interface Contract {
  id: string;
  tenantName: string;
  tenantId: string;
  apartmentName: string;
  apartmentId: string;
  status: "draft" | "pending" | "active" | "terminated";
  startDate: string;
  endDate: string;
  rentAmount: number;
  createdAt: string;
}

export default function ContractsPageStaff() {
  const [contracts, setContracts] = useState<Contract[]>([...MOCK_CONTRACTS]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([
    ...MOCK_CONTRACTS,
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filterContracts = (search: string, status: string) => {
    let filtered = contracts;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
          c.apartmentName.toLowerCase().includes(search.toLowerCase()) ||
          c.id.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((c) => c.status === status);
    }

    setFilteredContracts(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterContracts(value, statusFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterContracts(searchTerm, value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      draft: {
        label: "Nháp",
        className: "bg-gray-100 text-gray-700 border-gray-200",
      },
      pending: {
        label: "Chờ ký",
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      active: {
        label: "Hoạt động",
        className: "bg-green-100 text-green-700 border-green-200",
      },
      terminated: {
        label: "Đã hủy",
        className: "bg-red-100 text-red-700 border-red-200",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={`${config.className} border`}>{config.label}</Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getContractDays = (start: string, end: string) => {
    return Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24),
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Quản lý Hợp đồng
          </h2>
          <p className="text-muted-foreground">
            Tạo, cập nhật và quản lý hợp đồng cho người thuê.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="size-4" /> Hợp đồng mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search" className="text-xs mb-2 block">
            Tìm kiếm
          </Label>
          <Input
            id="search"
            placeholder="Tìm theo tên người thuê, căn hộ hoặc ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="w-48">
          <Label htmlFor="status" className="text-xs mb-2 block">
            Lọc theo trạng thái
          </Label>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger id="status" className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="pending">Chờ ký</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="terminated">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-22.5">ID</TableHead>
              <TableHead>Người thuê</TableHead>
              <TableHead>Căn hộ</TableHead>
              <TableHead>Thời hạn</TableHead>
              <TableHead>Tiền thuê</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-muted-foreground">
                    Không có hợp đồng nào. Tạo hợp đồng mới để bắt đầu.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredContracts.map((contract) => (
                <TableRow
                  key={contract.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground font-semibold">
                    #{contract.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {contract.tenantName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ID: {contract.tenantId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {contract.apartmentName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(contract.startDate)}
                      </p>
                      <p className="text-xs font-medium">
                        {getContractDays(contract.startDate, contract.endDate)}{" "}
                        ngày
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-green-600">
                    {formatCurrency(contract.rentAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(contract.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionMenu contract={contract} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {filteredContracts.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-muted-foreground font-semibold mb-2">
              Tổng hợp đồng
            </p>
            <p className="text-3xl font-bold">{filteredContracts.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-muted-foreground font-semibold mb-2">
              Hoạt động
            </p>
            <p className="text-3xl font-bold text-green-600">
              {filteredContracts.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-muted-foreground font-semibold mb-2">
              Chờ ký
            </p>
            <p className="text-3xl font-bold text-yellow-600">
              {filteredContracts.filter((c) => c.status === "pending").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <p className="text-xs text-muted-foreground font-semibold mb-2">
              Tổng tiền thuê
            </p>
            <p className="text-lg font-bold">
              {formatCurrency(
                filteredContracts.reduce((sum, c) => sum + c.rentAmount, 0),
              )}
            </p>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      <CreateContractModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}

// ACTION MENU COMPONENT
function ActionMenu({ contract }: { contract: Contract }) {
  const [modalType, setModalType] = useState<
    "detail" | "edit" | "activate" | "terminate" | "preview" | null
  >(null);

  const handleDelete = () => {
    if (
      window.confirm(
        "Bạn chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác.",
      )
    ) {
      toast.success("Xóa hợp đồng thành công");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 outline-none">
            <MoreHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-55">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setModalType("detail")}>
            <Eye className="mr-2 h-4 w-4 text-blue-500" /> Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModalType("preview")}>
            <FileText className="mr-2 h-4 w-4 text-purple-500" /> Xem trước hợp
            đồng
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setModalType("edit")}>
            <Edit className="mr-2 h-4 w-4 text-orange-500" /> Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {contract.status !== "active" && (
            <DropdownMenuItem onClick={() => setModalType("activate")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Kích hoạt
            </DropdownMenuItem>
          )}
          {contract.status !== "terminated" && (
            <DropdownMenuItem onClick={() => setModalType("terminate")}>
              <XCircle className="mr-2 h-4 w-4 text-red-500" /> Hủy hợp đồng
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ContractDetailModal
        contract={contract}
        open={modalType === "detail"}
        onOpenChange={() => setModalType(null)}
      />
      <ContractEditModal
        contract={contract}
        open={modalType === "edit"}
        onOpenChange={() => setModalType(null)}
      />
      <ContractActivateModal
        contract={contract}
        open={modalType === "activate"}
        onOpenChange={() => setModalType(null)}
      />
      <ContractTerminateModal
        contract={contract}
        open={modalType === "terminate"}
        onOpenChange={() => setModalType(null)}
      />
      <ContractPreviewModal
        contract={contract}
        open={modalType === "preview"}
        onOpenChange={() => setModalType(null)}
      />
    </>
  );
}
