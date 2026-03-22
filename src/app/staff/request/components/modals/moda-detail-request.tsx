"use client";

import { Modal, Button, Space, Steps } from "antd";
import {
  Building2,
  MapPin,
  BedDouble,
  Maximize,
  Banknote,
  User,
  Phone,
  Mail,
  Clock,
  Briefcase,
} from "lucide-react";

interface RequestDetailModalProps {
  open: boolean;
  request: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}

const statusConfig: Record<
  string,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    order: number;
  }
> = {
  pending: {
    label: "Chờ duyệt",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    order: 1,
  },
  inspecting: {
    label: "Đang khảo sát",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    order: 2,
  },
  verifying: {
    label: "Đã xác minh",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    order: 3,
  },
  submitted: {
    label: "Đã gửi yêu cầu",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    order: 4,
  },
  completed: {
    label: "Khảo sát xong",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    order: 5,
  },
};

export function RequestDetailModal({
  open,
  request,
  onClose,
  onApprove,
  onReject,
  loading = false,
}: RequestDetailModalProps) {
  if (!request) return null;

  const status = statusConfig[request.status] || {
    label: "Không xác định",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    order: 0,
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={850}
      centered
      closeIcon={
        <div className="bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors mt-1 mr-1 text-gray-500">
          ✕
        </div>
      }
      title={
        <div className="flex flex-col gap-1 pb-4 border-b border-gray-100 pr-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 m-0">
              Chi tiết Yêu cầu
            </h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200 text-xs">
              ID: {request.id}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Briefcase size={14} className="text-gray-400" />
              Đối tác: <span className="text-gray-800">{request.partner}</span>
            </span>
          </div>
        </div>
      }
      footer={
        request.status === "pending" ? (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1.5 rounded-md border border-orange-100 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Vui lòng kiểm tra kỹ thông tin trước khi duyệt
            </div>
            <Space size="middle">
              <Button
                onClick={onClose}
                size="medium"
                className="text-gray-600 border-gray-300"
              >
                Hủy
              </Button>
              <Button
                danger
                onClick={onReject}
                loading={loading}
                size="medium"
                className="font-medium"
              >
                Từ chối
              </Button>
              <Button
                type="primary"
                onClick={onApprove}
                loading={loading}
                size="medium"
                className="bg-blue-600 hover:bg-blue-700 font-medium shadow-sm"
              >
                Duyệt yêu cầu
              </Button>
            </Space>
          </div>
        ) : (
          <div className="pt-3">
            <Button onClick={onClose} size="large">
              Đóng
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-6 pt-4 max-h-[72vh] pr-2 custom-scrollbar">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0">
              <Building2 size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {request.apartmentName || "Chưa cập nhật tên căn hộ"}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-4">
                <MapPin size={14} />{" "}
                {request.location || "Chưa cập nhật vị trí"}
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-blue-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Banknote size={12} /> Giá đề xuất
                  </p>
                  <p className="text-base font-bold text-blue-700">
                    {request.price ? `${request.price} VND` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Maximize size={12} /> Diện tích
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {request.area || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <BedDouble size={12} /> Phòng ngủ
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {request.bedrooms ? `${request.bedrooms} phòng` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
          <Steps
            current={status.order === 0 ? 0 : status.order - 1}
            size="small"
            items={[
              { title: "Chờ duyệt" },
              { title: "Đang khảo sát" },
              { title: "Đã xác minh" },
              { title: "Đã gửi Operator" },
              { title: "Hoàn tất" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base border-b border-gray-100 pb-3 mb-4">
              <User className="text-purple-500" size={18} />
              Thông tin Liên hệ
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                  <User size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 leading-tight">
                    Người đại diện
                  </p>
                  <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                    Nguyễn Văn A
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                  <Phone size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 leading-tight">
                    Số điện thoại
                  </p>
                  <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                    0912.345.678
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 leading-tight">Email</p>
                  <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                    contact@partner.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base border-b border-gray-100 pb-3 mb-4">
              <Clock className="text-green-500" size={18} />
              Lịch sử Hoạt động
            </h3>

            <div className="relative pl-5 space-y-6 before:absolute before:inset-y-1 before:left-2.25 before:w-0.5 before:bg-gray-100">
              <div className="relative">
                <div className="absolute -left-6.25 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                <p className="text-sm font-semibold text-gray-800">
                  Đối tác gửi yêu cầu
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  {request.submittedDate || "Không có dữ liệu"}
                </p>
              </div>

              {request.reviewedDate && (
                <div className="relative">
                  <div className="absolute -left-6.25 top-1.5 h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                  <p className="text-sm font-semibold text-gray-800">
                    Staff đã duyệt
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {request.reviewedDate}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
