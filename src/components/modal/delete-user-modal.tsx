"use client";

import { useDeleteUser, useUpdateProfile } from "@/hooks/query/useUsers";
import { UserListItem } from "@/types/user";
import {
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Modal } from "antd";

interface DeleteUserModalProps {
  user: UserListItem | null;
  onClose: () => void;
  open: boolean;
}

export default function ModalDeleteUser({
  user,
  onClose,
  open,
}: DeleteUserModalProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const { mutateAsync: banUser, isPending: isTogglePending } = useDeleteUser(
    user?.id || "",
  );

  const { mutateAsync: unbanUser, isPending: isUnbanPending } =
    useUpdateProfile(user?.id || "");

  const isLockMode = user?.isActive ?? true;

  const handleBan = async () => {
    if (!user) return;
    try {
      await banUser();
      onClose();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleUnban = async () => {
    if (!user) return;
    try {
      await unbanUser({ isActive: true });
      onClose();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleAction = isLockMode ? handleBan : handleUnban;
  const actionText = isLockMode ? "Khóa người dùng" : "Mở khóa người dùng";
  const titleText = isLockMode
    ? "Xác nhận khóa người dùng"
    : "Xác nhận mở khóa người dùng";
  const messageText = isLockMode
    ? "Người dùng sẽ không thể đăng nhập vào hệ thống."
    : "Người dùng sẽ có thể đăng nhập trở lại vào hệ thống.";
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

        {/* User Card */}
        {user && (
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-blue-700">
                    {getInitials(user.fullName || "U")}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
            </div>

            {/* User Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <MailOutlined className="mr-2 text-gray-400" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-gray-600">
                  <PhoneOutlined className="mr-2 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600">
                <UserOutlined className="mr-2 text-gray-400" />
                <span>ID: {user.id.substring(0, 8)}...</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3.5 w-full">
          <Button className="w-full" size="large" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className={`w-full ${buttonColor} ${buttonHoverColor}`}
            size="large"
            loading={isLockMode ? isTogglePending : isUnbanPending}
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
