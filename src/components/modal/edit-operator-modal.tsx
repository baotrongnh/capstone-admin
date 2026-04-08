"use client";

import React, { useEffect, useState } from "react";
import { Button, Form, Input, Select, Modal, Checkbox } from "antd";
import { OperatorItem } from "@/lib/services/operator.service";
import { useUpdateOperator } from "@/hooks/query/useOperator";

interface ModalEditOperatorProps {
  operator: OperatorItem | null;
  open: boolean;
  onClose: () => void;
}

interface IFormData {
  fullName: string;
  email: string;
  phone: string;
  employeeCode: string;
  shift: string;
  password?: string;
  isActive: boolean;
}

const shiftOptions = [
  { label: "Ca sáng", value: "morning" },
  { label: "Ca chiều", value: "afternoon" },
  { label: "Ca đêm", value: "night" },
  { label: "Ca linh hoạt", value: "flexible" },
];

export default function ModalEditOperator({
  operator,
  open,
  onClose,
}: ModalEditOperatorProps) {
  const [form] = Form.useForm<IFormData>();
  const [loading, setLoading] = useState(false);
  const { mutateAsync: updateOperator } = useUpdateOperator(operator?.id || "");

  useEffect(() => {
    if (operator && open) {
      form.setFieldsValue({
        fullName: operator.fullName || "",
        email: operator.email || "",
        phone: operator.phone || "",
        employeeCode: operator.employeeCode || "",
        shift: operator.operatorShift || "",
        isActive: operator.isActive ?? true,
      });
    }
  }, [operator, open, form]);

  const handleSubmit = async (values: IFormData) => {
    try {
      await form.validateFields();
      setLoading(true);
      const payload: Record<string, unknown> = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        employeeCode: values.employeeCode,
        shift: values.shift,
        isActive: values.isActive,
      };

      if (values.password) {
        payload.password = values.password;
      }

      await updateOperator(payload);
      onClose();
    } catch (error) {
      console.error("Error updating operator:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Sửa thông tin nhân viên vận hành"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          Cập nhật
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginBottom: 0 }}
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Full Name */}
          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="Nhập email" type="email" />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            name="phone"
            label="Điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập điện thoại" }]}
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="Nhập số điện thoại" type="tel" />
          </Form.Item>

          {/* Employee Code */}
          <Form.Item
            name="employeeCode"
            label="Mã nhân viên"
            rules={[{ required: true, message: "Vui lòng nhập mã nhân viên" }]}
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="Nhập mã nhân viên" />
          </Form.Item>

          {/* Shift */}
          <Form.Item
            name="shift"
            label="Ca làm việc"
            rules={[{ required: true, message: "Vui lòng chọn ca làm việc" }]}
            style={{ marginBottom: 12 }}
          >
            <Select
              placeholder="Chọn ca làm việc"
              options={shiftOptions}
              allowClear
              optionLabelProp="label"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu "
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
            ]}
            style={{ marginBottom: 12 }}
          >
            <Input.Password placeholder="Để trống nếu không thay đổi" />
          </Form.Item>
        </div>

        {/* Password */}

        {/* Active Status */}
        <Form.Item
          name="isActive"
          valuePropName="checked"
          style={{ marginBottom: 12 }}
        >
          <Checkbox>Kích hoạt tài khoản</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
