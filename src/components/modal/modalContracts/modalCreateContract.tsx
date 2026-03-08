"use client";

import { Modal, Form, Input, DatePicker, InputNumber } from "antd";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateContractModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Create contract:", values);

        toast.success("Tạo hợp đồng thành công");
        form.resetFields();
        onOpenChange(false);
      })
      .catch(() => {});
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        onOpenChange(false);
      }}
      onOk={handleSubmit}
      okText="Tạo hợp đồng"
      cancelText="Hủy"
      width={600}
      title={
        <div className="flex items-center gap-2">
          <Plus className="size-5 text-blue-600" />
          <span className="font-semibold">Tạo hợp đồng mới</span>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Điền đầy đủ thông tin để tạo hợp đồng cho người thuê.
      </p>

      <Form form={form} layout="vertical" requiredMark="optional">
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="ID Người thuê"
            name="tenantId"
            rules={[{ required: true, message: "Vui lòng nhập ID người thuê" }]}
          >
            <Input placeholder="Nhập ID người thuê" />
          </Form.Item>

          <Form.Item
            label="ID Căn hộ"
            name="apartmentId"
            rules={[{ required: true, message: "Vui lòng nhập ID căn hộ" }]}
          >
            <Input placeholder="Nhập ID căn hộ" />
          </Form.Item>

          <Form.Item
            label="Ngày bắt đầu"
            name="startDate"
            rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            name="endDate"
            rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
          >
            <DatePicker className="w-full" format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Tiền thuê (VND / tháng)"
            name="rentAmount"
            className="col-span-2"
            rules={[{ required: true, message: "Nhập tiền thuê" }]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              placeholder="0"
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
