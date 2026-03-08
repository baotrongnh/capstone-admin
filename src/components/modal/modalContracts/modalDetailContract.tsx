"use client";

import { Modal, Button } from "antd";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Home, DollarSign } from "lucide-react";

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

export function ContractDetailModal({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={[
        <Button key="close" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>,
      ]}
      width={600}
      title={
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-blue-600" />
          <span>Chi tiết hợp đồng</span>
        </div>
      }
    >
      <div className="space-y-6 py-2">
        {/* Thông tin hợp đồng */}
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary">
            <FileText className="size-4" /> Thông tin hợp đồng
          </h4>
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                ID Hợp đồng
              </p>
              <p className="text-sm font-mono font-bold">#{contract.id}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Ngày tạo
              </p>
              <p className="text-sm">{formatDate(contract.createdAt)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Người thuê */}
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary">
            <User className="size-4" /> Thông tin người thuê
          </h4>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Tên
              </p>
              <p className="text-sm font-semibold">{contract.tenantName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                ID
              </p>
              <p className="text-sm font-mono">{contract.tenantId}</p>
            </div>
          </div>
        </div>

        {/* Căn hộ */}
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary">
            <Home className="size-4" /> Thông tin căn hộ
          </h4>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex justify-between">
            <div>
              <p className="text-sm font-semibold">{contract.apartmentName}</p>
              <p className="text-xs text-muted-foreground">
                ID: {contract.apartmentId}
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-none">
              Căn hộ
            </Badge>
          </div>
        </div>

        {/* Tài chính */}
        <div>
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2 text-primary">
            <DollarSign className="size-4" /> Chi tiết tài chính
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Tiền thuê / tháng
              </p>
              <p className="text-lg font-bold text-amber-700">
                {formatCurrency(contract.rentAmount)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Thời hạn
              </p>
              <p className="text-sm font-semibold text-purple-700">
                {formatDate(contract.startDate)} →{" "}
                {formatDate(contract.endDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
