"use client";

import React, { useState } from "react";
import {
  LockOutlined,
  UnlockOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Modal } from "antd";
import { OperatorItem } from "@/lib/services/operator.service";
import Image from "next/image";
import {
  useDeleteOperator,
  useUpdateOperator,
} from "@/hooks/query/useOperator";

interface ModalDeleteOperatorProps {
  operator: OperatorItem | null;
  open: boolean;
  onClose: () => void;
}

export default function ModalDeleteOperator({
  operator,
  open,
  onClose,
}: ModalDeleteOperatorProps) {
  const [loading, setLoading] = useState(false);

  const { mutateAsync: banOperator } = useDeleteOperator(operator?.id || "");
  const { mutateAsync: unBanOperator } = useUpdateOperator(operator?.id || "");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isLockMode = operator?.isActive ?? true;

  const handleBan = async () => {
    if (!operator) return;
    setLoading(true);
    try {
      await banOperator();
      onClose();
    } catch (error) {
      console.error("Error toggling operator status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!operator) return;
    setLoading(true);
    try {
      await unBanOperator({ isActive: true });
      onClose();
    } catch (error) {
      console.error("Error toggling operator status:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAction = isLockMode ? handleBan : handleUnban;

  const titleText = isLockMode
    ? "Xác nhận khóa nhân viên vận hành"
    : "Xác nhận mở khóa nhân viên vận hành";
  const messageText = isLockMode
    ? "Nhân viên vận hành sẽ không thể đăng nhập vào hệ thống."
    : "Nhân viên vận hành sẽ có thể đăng nhập trở lại vào hệ thống.";
  const actionText = isLockMode
    ? "Khóa nhân viên vận hành"
    : "Mở khóa nhân viên vận hành";
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
        {/* Icon */}
        <div className={`${bgColor} rounded-full p-4 mb-4`}>
          {isLockMode ? (
            <LockOutlined className={`${iconColor} text-3xl`} />
          ) : (
            <UnlockOutlined className={`${iconColor} text-3xl`} />
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-center mb-2">{titleText}</h2>

        {/* Message */}
        <p className="text-gray-600 text-center text-sm mb-6">{messageText}</p>

        {/* Staff Card */}
        {operator && (
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              {operator.profileImageUrl ? (
                <Image
                  src={operator.profileImageUrl}
                  alt={operator.fullName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700">
                  {getInitials(operator.fullName || "O")}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-sm">{operator.fullName}</h3>
                <p className="text-xs text-gray-600">{operator.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <PhoneOutlined />
                <span>{operator.phone || "---"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <UserOutlined />
                <span>ID: {operator.id || "---"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <Button onClick={onClose} className="flex-1" size="large">
            Hủy
          </Button>
          <Button
            onClick={handleAction}
            loading={loading}
            className={`flex-1 ${buttonColor} ${buttonHoverColor}`}
            size="large"
          >
            {actionText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
