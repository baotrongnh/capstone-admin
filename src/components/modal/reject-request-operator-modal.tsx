"use client";

import { useRejectCooperation } from "@/hooks/query/useApartments";
import { Request } from "@/types/request";
import { Button, Input, Modal, Select } from "antd";
import { Home, Info } from "lucide-react";
import { useState } from "react";

interface ModalRejectRequestProps {
  open: boolean;
  onClose: () => void;
  request: Request | null;
  onConfirm?: () => Promise<void>;
}

export default function ModalRejectRequest({
  open,
  onClose,
  request,
}: ModalRejectRequestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");

  const { mutateAsync: rejectRequest } = useRejectCooperation(
    request?.id || "",
  );

  const handleConfirm = async () => {
    if (!selectedReason) return;
    const reason = {
      reason: selectedReason,
    };
    try {
      setIsLoading(true);
      await rejectRequest(reason);
      handleClose();
    } catch (error) {
      console.error("Error confirming request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    onClose();
  };

  if (!request) return null;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={500}
      centered
      closeIcon={false}
      footer={null}
    >
      <div className="flex flex-col items-center text-center pt-4 pb-2">
        {/* Info Icon */}
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
          <Info size={32} strokeWidth={2.5} />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Xác nhận từ chối yêu cầu
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Bạn có chắc chắn muốn từ chối yêu cầu cho căn hộ này không?
          <br />
          Hành động này không thể hoàn tác.
        </p>

        {/* Info Box */}
        <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-3 mb-6">
          <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm text-gray-400 shrink-0">
            <Home size={20} />
          </div>
          <div className="overflow-hidden text-left flex-1">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">
              MÃ: {request?.id}
            </p>
            <p className="font-semibold text-gray-900 text-sm truncate">
              {request?.apartmentName}
            </p>
          </div>
        </div>

        {/* Rejection Reason */}
        <div className="w-full mb-6">
          <label className="block text-left text-sm font-medium text-gray-900 mb-2">
            Lý do từ chối <span className="text-red-500">*</span>
          </label>
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do từ chối..."
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <Button
            className="flex-1 h-11 font-medium text-base rounded-lg"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="flex-1 h-11 text-white! font-medium text-base rounded-lg bg-red-500! hover:bg-red-700!"
            onClick={handleConfirm}
            disabled={!selectedReason || isLoading}
            loading={isLoading}
          >
            Từ chối
          </Button>
        </div>
      </div>
    </Modal>
  );
}
