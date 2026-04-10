"use client";

import { Button, Modal } from "antd";
import { AlertCircle, CheckCircle2, Home } from "lucide-react";
import { useApproveCooperation } from "@/hooks/query/useApartments";
import { useState } from "react";
import { Request, StaffUpdate } from "@/types/request";

interface ModalApproveRequestProps {
  open: boolean;
  request: Request | null;
  staffUpdate: StaffUpdate | undefined;
  onClose: () => void;
  loading?: boolean;
}

export function ModalApproveRequest({
  open,
  request,
  onClose,
  loading = false,
}: ModalApproveRequestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: approveCooperation } = useApproveCooperation();

  if (!request) return null;

  const isAlreadyProcessed =
    request.status === "approved" || request.status === "rejected";

  const handleClose = () => {
    onClose();
  };

  const handleApprove = async (requestId: string) => {
    try {
      setIsLoading(true);
      await approveCooperation(requestId);
      onClose();
    } catch (error) {
      console.error("Error approving cooperation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={450}
      centered
      closeIcon={false}
      footer={null}
    >
      <div className="flex flex-col items-center text-center pt-4 pb-2">
        {isAlreadyProcessed ? (
          <div className="w-16 h-16 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 size={32} />
          </div>
        ) : (
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm border border-blue-100">
            <AlertCircle size={32} strokeWidth={2.5} />
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isAlreadyProcessed
            ? "Yêu cầu đã được xử lý"
            : "Xác nhận duyệt yêu cầu"}
        </h2>

        <div className="text-gray-500 text-sm mb-6">
          <p className="mb-3">
            {isAlreadyProcessed
              ? "Yêu cầu này đã được phê duyệt hoặc từ chối trước đó."
              : "Bạn có chắc chắn muốn xử lý yêu cầu cho căn hộ này không? Hành động này không thể hoàn tác."}
          </p>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3 text-left w-full mx-auto max-w-sm">
            <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm text-gray-400 shrink-0">
              <Home size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-500 font-medium mb-0.5 uppercase tracking-wider">
                Mã: {request.id}
              </p>
              <p className="font-semibold text-gray-900 text-sm truncate">
                {request.apartmentName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full mt-2">
          {isAlreadyProcessed ? (
            <Button
              className="w-full h-11 font-medium text-base rounded-xl"
              onClick={handleClose}
            >
              Đóng
            </Button>
          ) : (
            <>
              <Button
                className="flex-1 h-11 font-medium text-base rounded-xl border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400"
                onClick={handleClose}
                disabled={loading}
              >
                Hủy
              </Button>

              <Button
                type="primary"
                className="flex-1 h-11 font-medium text-base rounded-xl bg-blue-600 hover:bg-blue-700"
                onClick={() => handleApprove(request.id)}
                loading={isLoading}
              >
                Chấp nhận
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
