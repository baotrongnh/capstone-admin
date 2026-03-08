"use client";

import { Modal, Button } from "antd";
import { XCircle } from "lucide-react";
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

export function ContractTerminateModal({
  contract,
  open,
  onOpenChange,
}: {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleTerminate = () => {
    toast.success("Hủy hợp đồng thành công");
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      onOk={handleTerminate}
      okText="Xác nhận hủy hợp đồng"
      cancelText="Không, quay lại"
      okButtonProps={{ danger: true }}
      width={425}
      title={
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="size-5" />
          <span className="font-semibold">Hủy hợp đồng</span>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Hợp đồng sẽ chuyển sang trạng thái <b>“Đã hủy”</b> và không còn hiệu
        lực.
      </p>

      <div className="bg-red-50 p-4 rounded-lg border border-red-200 space-y-3">
        <p className="text-sm font-semibold text-red-700">
          ⚠️ Cảnh báo: Hành động này không thể hoàn tác
        </p>

        <div className="space-y-1 text-sm">
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
        </div>
      </div>
    </Modal>
  );
}
