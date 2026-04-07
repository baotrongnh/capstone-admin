"use client";

import { useUpdateProfile } from "@/hooks/query/useUsers";
import { UserListItem } from "@/types/user";
import {
  CalendarOutlined,
  PhoneOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, DatePicker, Divider, Form, Input, Modal } from "antd";
import dayjs from "dayjs";
import React from "react";

interface EditUserModalProps {
  user: UserListItem | null;
  onClose: () => void;
  open: boolean;
}

export default function ModalEditUser({
  user,
  onClose,
  open,
}: EditUserModalProps) {
  const [form] = Form.useForm();

  const { mutateAsync: updateUser, isPending: isUpdatePending } =
    useUpdateProfile(user?.id || "");

  React.useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
      });
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    const value = form.getFieldsValue();
    const payload = {
      fullName: value.fullName,
      phone: value.phone,
      dateOfBirth: value.dateOfBirth
        ? value.dateOfBirth.format("YYYY-MM-DD")
        : null,
      emergencyContactName: value.emergencyContactName,
      emergencyContactPhone: value.emergencyContactPhone,
    };

    try {
      await updateUser(payload);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      footer={null}
      closable={true}
      width={600}
      className="custom-modal"
      style={{
        padding: "24px",
      }}
    >
      <div className="relative">
        <div className="mb-8">
          <div className="flex gap-3.5">
            <UserOutlined className="text-2xl text-gray-500! mb-2" />
            <div>
              {" "}
              <h2 className="text-2xl font-bold text-gray-700  tracking-tight">
                Chỉnh sửa hồ sơ
              </h2>
              <p className="text-gray-500 text-[14px]">
                Quản lý thông tin cá nhân và liên hệ khẩn cấp của người dùng.
              </p>
            </div>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          autoComplete="off"
        >
          <div className="flex gap-8 mb-8">
            <div className="flex flex-col items-center gap-3">
              <Avatar
                size={110}
                src={user?.profileImageUrl}
                icon={<UserOutlined />}
                className="border-4 border-white shadow-xl bg-slate-100 ring-1 ring-gray-100"
              />
              <span className="text-[12px] font-medium text-gray-400 italic">
                Ảnh hồ sơ
              </span>
            </div>

            {/* Right: Basic Info */}
            <div className="flex-1 space-y-4">
              <Form.Item
                label={
                  <span className="font-semibold text-gray-700">Họ và tên</span>
                }
                name="fullName"
                rules={[{ required: true, message: "Nhập họ tên" }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400 mr-1" />}
                  placeholder="Nguyễn Văn A"
                  className="h-11 rounded-lg border-gray-200 hover:border-blue-400 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)] transition-all"
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Số điện thoại
                    </span>
                  }
                  name="phone"
                  rules={[{ required: true, message: "Nhập SĐT" }]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400 mr-1" />}
                    placeholder="09xx..."
                    className="h-11 rounded-lg border-gray-200"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Ngày sinh
                    </span>
                  }
                  name="dateOfBirth"
                >
                  <DatePicker
                    suffixIcon={<CalendarOutlined className="text-gray-400" />}
                    format="DD/MM/YYYY"
                    className="h-11 w-full rounded-lg border-gray-200"
                    placeholder="Chọn ngày"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          <Divider>
            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <UserAddOutlined /> Liên hệ khẩn cấp
            </span>
          </Divider>

          <div className="bg-gray-50/50 p-5 rounded-xl border border-dashed border-gray-200 grid grid-cols-2 gap-4">
            <Form.Item
              label={
                <span className="font-semibold text-gray-700">
                  Tên người liên hệ
                </span>
              }
              name="emergencyContactName"
              className="mb-0"
            >
              <Input
                placeholder="Tên người thân"
                className="h-11 rounded-lg bg-white border-gray-200"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">
                  SĐT khẩn cấp
                </span>
              }
              name="emergencyContactPhone"
              className="mb-0"
            >
              <Input
                placeholder="Số điện thoại"
                className="h-11 rounded-lg bg-white border-gray-200"
              />
            </Form.Item>
          </div>

          <div className="flex items-center justify-end gap-3 mt-10">
            <Button
              onClick={onClose}
              disabled={isUpdatePending}
              className="h-11 px-8 rounded-lg font-medium border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={isUpdatePending}
              onClick={handleSubmit}
              className="h-11 px-8 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
