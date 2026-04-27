"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, Input, Button, Select, Space, Checkbox } from "antd";
import { StaffItem } from "@/lib/services/staff.service";
import { useUpdateStaff } from "@/hooks/query/useStaff";

interface ModalEditStaffProps {
  staff: StaffItem | null;
  open: boolean;
  onClose: () => void;
}

interface IFormData {
  email: string;
  phone: string;
  fullName: string;
  employeeCode: string;
  department: string;
  workingCity: string;
  workingDistrict: string;
  latitude?: number;
  longitude?: number;
  hireDate?: string;
  password?: string;
  isActive: boolean;
}

export default function ModalEditStaff({
  staff,
  open,
  onClose,
}: ModalEditStaffProps) {
  const [form] = Form.useForm<IFormData>();
  const [loading, setLoading] = React.useState(false);
  const { mutateAsync: updateStaff } = useUpdateStaff(staff?.id || "");
  const todayInputValue = new Date().toISOString().split("T")[0];
  const staffRole =
    staff?.staffRole ||
    (staff?.department === "customer_service"
      ? "customer_service"
      : staff?.department === "maintenance"
        ? "maintenance"
        : staff?.department === "technician"
          ? "technician"
          : "general");

  useEffect(() => {
    if (staff && open) {
      form.setFieldsValue({
        email: staff.email || "",
        phone: staff.phone || "",
        fullName: staff.fullName || "",
        employeeCode: staff.employeeCode || "",
        department: staff.department || "",
        workingCity: staff.workingCity || "",
        workingDistrict: staff.workingDistrict || "",
        latitude: undefined,
        longitude: undefined,
        hireDate: staff.hireDate
          ? new Date(staff.hireDate).toISOString().split("T")[0]
          : "",
        password: "",
        isActive: staff.isActive ?? true,
      });
    }
  }, [staff, open, form]);

  const roleOptions = [
    { label: "Kỹ thuật viên", value: "technician" },
    { label: "Dịch vụ khách hàng", value: "customer_service" },
    { label: "Bảo trì", value: "maintenance" },
    { label: "Nhân viên chung", value: "general" },
  ];

  const departmentOptions = [
    { label: "Bảo trì", value: "maintenance" },
    { label: "Dịch vụ khách hàng", value: "customer_service" },
    { label: "Kỹ thuật viên", value: "technician" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    const values = await form.validateFields();
    const payload = {
      email: values.email,
      phone: values.phone,
      fullName: values.fullName,
      employeeCode: values.employeeCode,
      role: staffRole,
      department: values.department,
      workingCity: "",
      workingDistrict: "",
      latitude: values.latitude || 0,
      longitude: values.longitude || 0,
      hireDate: values.hireDate,
      password: values.password,
      isActive: values.isActive,
    };

    console.log("PAU", payload);

    try {
      await updateStaff(payload);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error updating staff:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Sửa thông tin nhân viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin nhân viên: {staff?.fullName}
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

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Phòng ban"
              name="department"
              rules={[{ required: true, message: "Vui lòng chọn phòng ban" }]}
              style={{ marginBottom: 12 }}
            >
              <Select
                options={departmentOptions}
                placeholder="Chọn phòng ban"
                allowClear
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              />
            </Form.Item>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                {
                  min: 8,
                  message: "Mật khẩu phải có ít nhất 8 ký tự",
                },
              ]}
              style={{ marginBottom: 12 }}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
          </div>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            style={{ marginBottom: 12 }}
          >
            <Checkbox>Kích hoạt tài khoản</Checkbox>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={onClose} disabled={loading}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
