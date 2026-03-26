"use client";

import { useApartment } from "@/hooks/query/useApartments";
import { Modal, Button, Space, Steps, Tag } from "antd";
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
  Image as ImageIcon,
  Home,
  Pen,
  Bath,
} from "lucide-react";

interface RequestDetailModalProps {
  open: boolean;
  onClose: () => void;
  id?: string;

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

  verifying: {
    label: "Đã xác minh",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    order: 3,
  },

  completed: {
    label: "Đã duyệt",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    order: 5,
  },
};

export function RequestDetailModal({
  open,
  id,
  onClose,

  loading = false,
}: RequestDetailModalProps) {
  if (!id) return null;

  const { data: apartmentRequest, isLoading } = useApartment(id);
  const request = apartmentRequest?.data;

  const status = request
    ? statusConfig[request.status] || {
        label: "Không xác định",
        color: "text-gray-700",
        bgColor: "bg-gray-100",
        borderColor: "border-gray-200",
        order: 0,
      }
    : null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={850}
      centered
      bodyStyle={{
        maxHeight: "70vh",
        overflowY: "auto",
        paddingRight: "8px",
      }}
      title={
        request ? (
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
                Chủ sở hữu:{" "}
                <span className="text-gray-800">
                  {request.owner?.fullName || "N/A"}
                </span>
                <div className="ml-25">
                  <Tag color={"yellow"}>
                    {request.status === "inactive"
                      ? "Chờ duyệt"
                      : request.status}
                  </Tag>
                </div>
              </span>
            </div>
          </div>
        ) : null
      }
      footer={
        request && request.status === "pending" ? (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1.5 rounded-md border border-orange-100 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Vui lòng kiểm tra kỹ thông tin trước khi duyệt
            </div>
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
      {request && (
        <div className="space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div>
                  {request.images && request.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid grid-cols-1 gap-3">
                        {request.images
                          .slice(0, 4)
                          .map((image: string, idx: number) => (
                            <div
                              key={idx}
                              className="overflow-hidden rounded-lg h-62"
                            >
                              <img
                                src={image}
                                alt={`Hình ${idx + 1}`}
                                height={700}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                              />
                            </div>
                          ))}
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {request.apartmentNumber || "Chưa cập nhật"}
                        </h3>

                        <p className="text-sm text-gray-500 flex items-center gap-2 mb-5">
                          <MapPin size={14} />
                          {request.buildingName || "Chưa cập nhật"}
                        </p>

                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Banknote size={14} /> Giá thuê
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              {request.baseRentPrice
                                ? `${Number(request.baseRentPrice).toLocaleString()} ₫`
                                : "N/A"}
                            </p>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Maximize size={14} /> Diện tích
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                              {request.totalArea
                                ? `${request.totalArea} m²`
                                : "N/A"}
                            </p>
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <BedDouble size={14} /> Phòng ngủ
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                              {request.numberOfBedrooms
                                ? `${request.numberOfBedrooms} phòng`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                      Chủ sở hữu
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.owner?.fullName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Địa chỉ
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {"N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Banknote size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Tiền cọc
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.depositAmount
                        ? `${Number(request.depositAmount).toLocaleString()} ₫`
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Pen size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Ghi chú của chủ nhà
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.description
                        ? request.description.length > 100
                          ? `${request.description.slice(0, 100)}...`
                          : request.description
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-base border-b border-gray-100 pb-3 mb-4">
                <Home className="text-green-500" size={18} />
                Thông tin Tòa nhà
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Tên tòa nhà
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.buildingName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Bath size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Phòng tắm
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.numberOfBathrooms || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <BedDouble size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Phòng ngủ
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.numberOfBedrooms || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Clock size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Ngày tạo
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString(
                            "vi-VN",
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Home size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Năm xây dựng
                    </p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.yearBuilt || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">Tầng</p>
                    <p className="text-sm font-medium text-gray-900 leading-tight mt-0.5">
                      {request.floorNumber || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 border border-gray-100 shrink-0">
                    <Maximize size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-tight">
                      Tình trạng nội thất
                    </p>
                    <div className="mt-0.5">
                      {request.furnishingStatus ? (
                        <Tag
                          color={
                            request.furnishingStatus === "furnished"
                              ? "green"
                              : "orange"
                          }
                        >
                          {request.furnishingStatus === "furnished"
                            ? "Có nội thất"
                            : "Không nội thất"}
                        </Tag>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          N/A
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
