"use client";

import { Modal, Button, Alert, Divider, Empty, Image } from "antd";
import { FileText, ImageIcon, MapPin, Maximize, Info } from "lucide-react";
import React from "react";

interface ModalApproveRequestProps {
  open: boolean;
  request: any;
  staffUpdate: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}

const conditionLabels: Record<string, string> = {
  excellent: "Xuất sắc - Như mới",
  very_good: "Rất tốt - Nhẹ nhàng",
  good: "Tốt - Bình thường",
  fair: "Khá - Có vết cũ",
  poor: "Kém - Cần sửa chữa",
};

const getConditionColor = (condition: string) => {
  const colors: Record<string, string> = {
    excellent: "bg-green-100 text-green-800",
    very_good: "bg-lime-100 text-lime-800",
    good: "bg-blue-100 text-blue-800",
    fair: "bg-yellow-100 text-yellow-800",
    poor: "bg-red-100 text-red-800",
  };
  return colors[condition] || "bg-gray-100 text-gray-800";
};

export function ModalApproveRequest({
  open,
  request,
  staffUpdate,
  onClose,
  onApprove,
  onReject,
  loading = false,
}: ModalApproveRequestProps) {
  if (!request || !staffUpdate) return null;

  // Giữ lại view "Xem chi tiết" nếu yêu cầu đã được duyệt/từ chối từ trước
  const isAlreadyProcessed =
    request.status === "approved" || request.status === "rejected";

  const handleApprove = () => {
    onApprove(); // Chạy hàm truyền từ cha (cha sẽ tự đóng modal)
  };

  const handleReject = () => {
    onReject(); // Chạy hàm truyền từ cha thực thi luôn không cần lý do
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex flex-col gap-1 pb-2 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {isAlreadyProcessed
              ? "Chi tiết Yêu cầu Căn hộ"
              : "Duyệt Yêu cầu Căn hộ"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md border">
              {request.id}
            </span>
            <span>•</span>
            <span className="truncate">{request.apartmentName}</span>
          </div>
        </div>
      }
      width={850}
      centered
      destroyOnClose
      footer={
        isAlreadyProcessed
          ? [
              <Button
                key="close"
                type="primary"
                onClick={handleClose}
                size="middle"
              >
                Đóng
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={handleClose} size="middle">
                Hủy
              </Button>,
              <Button
                key="reject"
                danger
                size="middle"
                onClick={handleReject}
                loading={loading}
              >
                Từ chối
              </Button>,
              <Button
                key="approve"
                type="primary"
                size="middle"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                loading={loading}
              >
                Chấp nhận
              </Button>,
            ]
      }
    >
      <div className="space-y-6 pt-4">
        <Alert
          message={
            <span className="font-medium text-blue-800">
              Cập nhật lần cuối: {staffUpdate.updatedDate || "N/A"}
            </span>
          }
          type="success"
          className="bg-blue-50! border-blue-200! mb-5!"
        />

        {/* Basic Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">
                Tên Căn Hộ
              </p>
              <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                {request.apartmentName}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">
                Vị Trí
              </p>
              <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                {request.location}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <Maximize size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">
                Diện Tích
              </p>
              <p className="font-semibold text-gray-900 text-sm">
                {request.area}
              </p>
            </div>
          </div>
        </div>

        {/* Condition Section */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-100/50 px-5 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 m-0 text-base">
              Tình trạng Bất động sản
            </h3>
          </div>

          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Tình trạng Bên ngoài:
                </span>
                <div>
                  <span
                    className={`px-3 py-1 rounded-lg font-medium text-sm ${getConditionColor(
                      staffUpdate.exteriorCondition,
                    )}`}
                  >
                    {conditionLabels[staffUpdate.exteriorCondition] ||
                      "Chưa cập nhật"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Tình trạng Bên trong:
                </span>
                <div>
                  <span
                    className={`px-3 py-1 rounded-lg font-medium text-sm ${getConditionColor(
                      staffUpdate.interiorCondition,
                    )}`}
                  >
                    {conditionLabels[staffUpdate.interiorCondition] ||
                      "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>

            {staffUpdate.notes && (
              <>
                <Divider className="my-2" />
                <div>
                  <span className="text-sm font-medium text-gray-600 block mb-2">
                    Ghi chú từ nhân viên:
                  </span>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {staffUpdate.notes}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Photos Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base m-0">
              <ImageIcon size={18} className="text-gray-500" />
              Ảnh Khảo sát
            </h3>
            <span className="bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-full text-xs border border-blue-100">
              {staffUpdate.files?.length || 0} hình ảnh
            </span>
          </div>

          {staffUpdate.files && staffUpdate.files.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Image.PreviewGroup>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {staffUpdate.files.map((file: any, idx: number) => {
                    const imageUrl =
                      file.thumbUrl ||
                      (file.originFileObj
                        ? URL.createObjectURL(file.originFileObj)
                        : "");
                    return (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white"
                      >
                        <Image
                          src={imageUrl}
                          alt={`Ảnh hiện trường ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                          fallback="https://via.placeholder.com/300?text=Error"
                        />
                      </div>
                    );
                  })}
                </div>
              </Image.PreviewGroup>
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl py-8">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500">
                    Chưa có hình ảnh khảo sát nào được tải lên
                  </span>
                }
              />
            </div>
          )}
        </div>

        {/* Chỉ hiện Hướng dẫn duyệt khi chưa được xử lý */}
        {!isAlreadyProcessed && (
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3 mt-8">
            <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-900/80">
              <p className="font-semibold mb-1 text-blue-900">
                Hướng dẫn duyệt
              </p>
              <ul className="list-disc pl-4 space-y-1 mb-0">
                <li>
                  Kiểm tra kỹ tình trạng bất động sản từ khảo sát của staff.
                </li>
                <li>
                  Xem xét tất cả hình ảnh và ghi chú để đưa ra quyết định.
                </li>
                <li>
                  Chấp nhận nếu đủ điều kiện, từ chối nếu cần khảo sát lại.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
