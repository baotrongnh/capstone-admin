"use client";

import React, { useState } from "react";
import {
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Modal } from "antd";
import { StaffItem } from "@/lib/services/staff.service";
import Image from "next/image";
import { useDeleteStaff, useUpdateStaff } from "@/hooks/query/useStaff";
import { is } from "date-fns/locale";

interface ModalDeleteStaffProps {
  staff: StaffItem | null;
  open: boolean;
  onClose: () => void;
}

export default function ModalDeleteStaff({
  staff,
  open,
  onClose,
}: ModalDeleteStaffProps) {
  const [loading, setLoading] = useState(false);

  const { mutateAsync: banStaff } = useDeleteStaff(staff?.id || "");
  const { mutateAsync: unBanStaff } = useUpdateStaff(staff?.id || "");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLockMode = staff?.isActive ?? true;

  const handleBan = async () => {
    if (!staff) return;
    setLoading(true);
    try {
      await banStaff();
      onClose();
    } catch (error) {
      console.error("Error toggling staff status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!staff) return;
    setLoading(true);
    try {
      await unBanStaff({ isActive: true });
      onClose();
    } catch (error) {
      console.error("Error toggling staff status:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAction = isLockMode ? handleBan : handleUnban;

  const titleText = isLockMode
    ? "Xác nhận khóa nhân viên"
    : "Xác nhận mở khóa nhân viên";
  const messageText = isLockMode
    ? "Nhân viên sẽ không thể đăng nhập vào hệ thống."
    : "Nhân viên sẽ có thể đăng nhập trở lại vào hệ thống.";
  const actionText = isLockMode ? "Khóa nhân viên" : "Mở khóa nhân viên";
  const iconColor = isLockMode ? "text-red-500" : "text-blue-500";
  const bgColor = isLockMode ? "bg-red-50" : "bg-blue-50";
  const buttonColor = isLockMode
    ? "bg-red-500! text-white!"
    : "bg-blue-500! text-white!";
  const buttonHoverColor = isLockMode
    ? "hover:bg-red-600!"
    : "hover:bg-blue-600!";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      footer={null}
      closable={false}
      width={500}
      style={{
        padding: "40px 30px",
        borderRadius: "8px",
      }}
    >
      <div className="flex flex-col items-center">
        <div
          className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColor} mb-6`}
        >
          {isLockMode ? (
            <LockOutlined className={`text-3xl ${iconColor}`} />
          ) : (
            <UnlockOutlined className={`text-3xl ${iconColor}`} />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          {titleText}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 text-sm leading-relaxed">
          Bạn có chắc chắn muốn {isLockMode ? "khóa" : "mở khóa"} tài khoản này
          không?{" "}
          <span className="font-medium text-gray-900">{messageText}</span>
        </p>

        {/* Staff Card */}
        {staff && (
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                {staff.profileImageUrl ? (
                  <Image
                    src={staff.profileImageUrl}
                    alt={staff.fullName}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-blue-700">
                    {getInitials(staff.fullName || "S")}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {staff.fullName}
                </p>
                <p className="text-xs text-gray-600 truncate">{staff.email}</p>
              </div>
            </div>

            {/* Staff Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <MailOutlined className="mr-2 text-gray-400" />
                <span>{staff.email}</span>
              </div>
              {staff.phone && (
                <div className="flex items-center text-gray-600">
                  <PhoneOutlined className="mr-2 text-gray-400" />
                  <span>{staff.phone}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <UserOutlined className="mr-2 text-gray-400" />
                <span>ID: {staff.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3.5 w-full">
          <Button
            className="w-full"
            size="large"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            className={`w-full ${buttonColor} ${buttonHoverColor}`}
            size="large"
            loading={loading}
            danger={isLockMode}
            onClick={handleAction}
          >
            {actionText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
