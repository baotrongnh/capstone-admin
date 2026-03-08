"use client";

import { Modal, Button } from "antd";
import { CheckCircle } from "lucide-react";
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

export function ContractActivateModal({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleActivate = () => {
    toast.success("Kích hoạt hợp đồng thành công");
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleActivate}
      okText="Kích hoạt hợp đồng"
      cancelText="Hủy"
      okButtonProps={{
        className: "bg-green-600 hover:bg-green-700",
      }}
      title={
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="size-5" />
          <span>Kích hoạt hợp đồng</span>
        </div>
      }
      width={420}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Hợp đồng sẽ chuyển sang trạng thái <b>“Hoạt động”</b> và có thể được áp
        dụng.
      </p>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm font-semibold mb-3">
          Xác nhận kích hoạt hợp đồng:
        </p>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Hợp đồng:</span> #{contract.id}
          </p>
          <p>
            <span className="font-semibold">Người thuê:</span>{" "}
            {contract.tenantName}
          </p>
          <p>
            <span className="font-semibold">Căn hộ:</span>{" "}
            {contract.apartmentName}
          </p>
          <p>
            <span className="font-semibold">Tiền thuê:</span>{" "}
            {formatCurrency(contract.rentAmount)}
          </p>
        </div>
      </div>
    </Modal>
  );
}
