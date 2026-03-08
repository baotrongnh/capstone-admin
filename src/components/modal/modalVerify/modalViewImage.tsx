import React from "react";
import { Modal, Button, Space, Row, Col, Image, Tag, Divider } from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  IdcardOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ProfileOutlined,
} from "@ant-design/icons";

import { Badge } from "@/components/ui/badge";

// Import từ file Page hoặc định nghĩa lại ở đây
interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  dob: string;
  address: string;
  idFront: string;
  idBack: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: string;
}

interface ImageViewModalProps {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
  onVerify?: () => void;
  onReject?: () => void;
  loading?: boolean;
}

export function ImageViewModal({
  open,
  customer,
  onClose,
  onVerify,
  onReject,
  loading = false,
}: ImageViewModalProps) {
  const handleVerify = () => {
    Modal.confirm({
      title: "Xác nhận phê duyệt",
      content:
        "Bạn có chắc chắn muốn xác thực thông tin khách hàng này hợp lệ?",
      okText: "Xác thực",
      cancelText: "Hủy",
      onOk: onVerify,
      okButtonProps: { className: "bg-blue-600 hover:bg-blue-700" },
    });
  };

  const renderStatus = (status?: string) => {
    switch (status) {
      case "verified":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã xác thực
          </Tag>
        );
      case "rejected":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Đã từ chối
          </Tag>
        );
      case "pending":
      default:
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Chờ xử lý
          </Tag>
        );
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN");

  return (
    <Modal
      closable={false}
      title={
        <div className="flex items-center justify-between pr-8 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
              <SafetyCertificateOutlined className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 m-0 leading-tight">
                Hồ sơ định danh (eKYC)
              </h2>
              <p className="text-sm text-slate-500 m-0 font-normal">
                Mã hồ sơ:{" "}
                <span className="font-mono text-slate-700">
                  {customer?.id.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
          <div>{renderStatus(customer?.status)}</div>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      centered
      destroyOnClose
      closeIcon={
        <div className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors ">
          <CloseCircleOutlined className="text-slate-500" />
        </div>
      }
      className="kyc-modal"
      footer={
        <div className="pt-4 border-t flex justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="text-sm text-slate-500">
            {customer?.status === "pending" && (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Cần kiểm tra kỹ giấy tờ trước khi duyệt
              </span>
            )}
          </div>

          <Space size="middle">
            <Button onClick={onClose} className="px-6 font-medium">
              Đóng
            </Button>

            {customer?.status === "pending" && (
              <>
                <Button danger onClick={onReject} className="px-6 font-medium">
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleVerify}
                  loading={loading}
                  className="px-6 bg-blue-600 hover:bg-blue-700 border-0 font-medium shadow-md shadow-blue-500/30"
                >
                  Phê duyệt hồ sơ
                </Button>
              </>
            )}
          </Space>
        </div>
      }
    >
      {customer && (
        <div className=" space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <IdcardOutlined className="text-blue-600" />
              Ảnh chứng minh nhân dân / CCCD
            </h3>

            <Image.PreviewGroup>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                        Mặt trước
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-slate-200 h-[200px] flex items-center justify-center relative cursor-pointer">
                      <Image
                        src={customer.idFront}
                        alt="ID Front"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        fallback="https://via.placeholder.com/400x250?text=Lỗi+tải+ảnh"
                      />
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
                        Mặt sau
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-slate-200 h-[200px] flex items-center justify-center relative cursor-pointer">
                      <Image
                        src={customer.idBack}
                        alt="ID Back"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        fallback="https://via.placeholder.com/400x250?text=Lỗi+tải+ảnh"
                      />
                    </div>
                  </div>
                </Col>
              </Row>
            </Image.PreviewGroup>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ProfileOutlined className="text-blue-600 text-lg" />
              Thông tin khai báo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 bg-white p-4 rounded-lg border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Họ và tên</p>
                <p className="font-semibold text-slate-800">
                  {customer.fullName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Số CCCD/CMND</p>
                <p className="font-mono font-semibold text-slate-800">
                  {customer.idNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
                <p className="font-medium text-slate-800">
                  {formatDate(customer.dob)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Số điện thoại</p>
                <p className="font-medium text-slate-800">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="font-medium text-slate-800">{customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ngày gửi yêu cầu</p>
                <p className="font-medium text-slate-800">
                  {formatDate(customer.submittedAt)}
                </p>
              </div>
              <div className="col-span-2 md:col-span-3">
                <p className="text-xs text-slate-500 mb-1">
                  Địa chỉ thường trú
                </p>
                <p className="font-medium text-slate-800">{customer.address}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
