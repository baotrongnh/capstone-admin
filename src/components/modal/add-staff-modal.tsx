"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateStaff } from "@/hooks/query/useStaff";
import { Button, Checkbox, Form, Input, Select, Space } from "antd";
import React from "react";

interface ModalAddStaffProps {
  open: boolean;
  onClose: () => void;
}

interface IFormData {
  email: string;
  phone: string;
  fullName: string;
  employeeCode: string;
  role: string;
  department: string;
  workingCity: string;
  workingDistrict: string;
  latitude?: number;
  longitude?: number;
  hireDate?: string;
  password: string;
  isActive: boolean;
}

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function ModalAddStaff({ open, onClose }: ModalAddStaffProps) {
  const [form] = Form.useForm<IFormData>();
  const [loading, setLoading] = React.useState(false);
  const { mutateAsync: createStaff } = useCreateStaff();
  const todayInputValue = getTodayInputValue();

  const handleSubmit = async (values: IFormData) => {
    setLoading(true);
    const payload = {
      email: values.email,
      phone: values.phone,
      fullName: values.fullName,
      employeeCode: values.employeeCode,
      role: values.role,
      department: values.role,
      workingCity: "",
      workingDistrict: "",
      latitude: values.latitude || 0,
      longitude: values.longitude || 0,
      hireDate: values.hireDate,
      password: values.password,
      isActive: values.isActive,
    };
    try {
      console.log("LLLL", payload);
      await createStaff(payload);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error adding staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const options = [
    { label: "Bảo trì", value: "maintenance" },
    { label: "Dịch vụ khách hàng", value: "customer_service" },
    { label: "Kỹ thuật viên", value: "technician" },
  ];

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết nhân viên
          </DialogDescription>
        </DialogHeader>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="mt-2"
          style={{ marginBottom: 0 }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Họ tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="Nhập email" type="email" />
            </Form.Item>
          </div>

          {/* Row 2: Điện thoại, Mã nhân viên */}
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input type="number" placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Mã nhân viên"
              name="employeeCode"
              rules={[
                { required: true, message: "Vui lòng nhập mã nhân viên" },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input placeholder="Nhập mã nhân viên" />
            </Form.Item>
          </div>

          {/* Row 3: Vai trò, Phòng ban */}

          {/* Row 6: Ngày bắt đầu, Mật khẩu */}
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Ngày bắt đầu làm việc"
              name="hireDate"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                () => ({
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    return value < todayInputValue
                      ? Promise.reject(
                          new Error("Ngày bắt đầu không được ở trong quá khứ"),
                        )
                      : Promise.resolve();
                  },
                }),
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input type="date" min={todayInputValue} />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                {
                  min: 8, // Sửa ở đây: từ 6 lên 8
                  message: "Mật khẩu phải có ít nhất 8 ký tự", // Cập nhật message
                },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Vai trò"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              style={{ marginBottom: 12 }}
            >
              <Select
                options={options}
                placeholder="Chọn phòng ban"
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              />
            </Form.Item>
          </div>

          {/* Row 7: Active Status */}
          <Form.Item
            name="isActive"
            valuePropName="checked"
            initialValue={true}
            style={{ marginBottom: 12 }}
          >
            <Checkbox>Kích hoạt tài khoản</Checkbox>
          </Form.Item>

          {/* Buttons */}
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {loading ? "Đang thêm..." : "Thêm nhân viên"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
