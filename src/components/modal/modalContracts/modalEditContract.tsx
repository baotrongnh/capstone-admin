"use client";

import { Modal, Button } from "antd";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { toast } from "sonner";

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

export function ContractEditModal({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSave = () => {
    toast.success("Cập nhật hợp đồng thành công");
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleSave}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      okButtonProps={{
        className: "bg-orange-600 hover:bg-orange-700",
      }}
      width={600}
      title={
        <div>
          <div className="flex items-center gap-2">
            <Edit className="size-5 text-orange-500" />
            <span>Chỉnh sửa hợp đồng</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Cập nhật thông tin hợp đồng #{contract.id}
          </p>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Info */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="text-sm">
            <span className="font-semibold">Người thuê:</span>{" "}
            {contract.tenantName}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Căn hộ:</span>{" "}
            {contract.apartmentName}
          </p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-startDate">Ngày bắt đầu</Label>
            <Input
              id="edit-startDate"
              type="date"
              defaultValue={contract.startDate}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-endDate">Ngày kết thúc</Label>
            <Input
              id="edit-endDate"
              type="date"
              defaultValue={contract.endDate}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="edit-rentAmount">Tiền thuê (VND / tháng)</Label>
            <Input
              id="edit-rentAmount"
              type="number"
              defaultValue={contract.rentAmount}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
