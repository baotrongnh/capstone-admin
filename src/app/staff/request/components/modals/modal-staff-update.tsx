"use client";

import {
  Modal,
  Button,
  Form,
  Select,
  Input,
  Upload,
  Space,
  Progress,
  Alert,
  Divider,
} from "antd";
import {
  FileText,
  Upload as UploadIcon,
  CheckCircle2,
  FileImage,
  Building2,
  MapPin,
  Maximize,
  Info,
} from "lucide-react";
import React, { useState } from "react";
import type { UploadFile } from "antd";

interface StaffUpdateModalProps {
  open: boolean;
  request: any;
  onClose: () => void;
  onUpdate: (staffUpdate: any) => void;
  loading?: boolean;
}

const conditionOptions = [
  { value: "excellent", label: "Xuất sắc - Như mới" },
  { value: "very_good", label: "Rất tốt - Nhẹ hao mòn" },
  { value: "good", label: "Tốt - Bình thường" },
  { value: "fair", label: "Khá - Có vết cũ" },
  { value: "poor", label: "Kém - Cần sửa chữa" },
];

export function StaffUpdateModal({
  open,
  request,
  onClose,
  onUpdate,
  loading = false,
}: StaffUpdateModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!request) return null;

  const uploadProgress = Math.min(100, Math.round((fileList.length / 5) * 100));
  const isValidForSubmit = fileList.length >= 5;

  const handleUploadChange = (info: any) => {
    const newFileList = info.fileList.slice(-20);
    setFileList(newFileList);

    if (newFileList.length >= 5) {
      setError(null);
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      if (fileList.length < 5) {
        setError(`Vui lòng tải lên ít nhất 5 ảnh (${fileList.length}/5)`);
        return;
      }

      setError(null);

      const staffUpdate = {
        ...values,
        files: fileList,
        updatedDate: new Date().toISOString().split("T")[0],
      };

      console.log("Staff update:", staffUpdate);
      onUpdate(staffUpdate);
      form.resetFields();
      setFileList([]);
    } catch (err) {
      setError("Vui lòng kiểm tra lại thông tin trên form");
    }
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
    setFileList([]);
    setError(null);
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={850}
      centered
      title={
        <div className="flex flex-col gap-1 pb-4 border-b border-gray-100 pr-6">
          <h2 className="text-xl font-bold text-gray-800 m-0 flex items-center gap-2">
            Cập nhật Khảo sát
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200 text-xs">
              ID: {request.id}
            </span>
            <span>•</span>
            <span className="font-medium text-gray-700">
              {request.apartmentName}
            </span>
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Button size="large" className="text-gray-600"></Button>
          <Space>
            <Button
              type="primary"
              onClick={handleUpdate}
              loading={loading}
              disabled={!isValidForSubmit}
              size="medium"
              icon={<CheckCircle2 size={18} />}
              className="bg-indigo-600 hover:bg-indigo-700 font-medium shadow-sm"
            >
              Lưu Khảo sát
            </Button>
          </Space>
        </div>
      }
    >
      <div className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Tên căn hộ
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {request.apartmentName || "Đang cập nhật"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Vị trí
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {request.location || "Đang cập nhật"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Maximize size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Diện tích
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate flex items-baseline gap-1">
                {request.area || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            1. Tình trạng Bất động sản
          </h3>
          <Form form={form} layout="vertical" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Form.Item
                name="exteriorCondition"
                label={
                  <span className="font-medium text-gray-700">Bên ngoài</span>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn tình trạng" },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Đánh giá mặt ngoài..."
                  options={conditionOptions}
                />
              </Form.Item>

              <Form.Item
                name="interiorCondition"
                label={
                  <span className="font-medium text-gray-700">Bên trong</span>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn tình trạng" },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Đánh giá nội thất/bên trong..."
                  options={conditionOptions}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="notes"
              label={
                <span className="font-medium text-gray-700">
                  Ghi chú chi tiết (Tùy chọn)
                </span>
              }
              rules={[
                { max: 500, message: "Ghi chú không vượt quá 500 ký tự" },
              ]}
              className="mb-0"
            >
              <Input.TextArea
                placeholder="Mô tả các vấn đề phát hiện, hỏng hóc cần sửa chữa..."
                rows={3}
                maxLength={500}
                showCount
                className="rounded-lg"
              />
            </Form.Item>
          </Form>
        </div>

        <Divider className="my-2" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              2. Hình ảnh Khảo sát
            </h3>
            <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
              Bắt buộc: Tối thiểu 5 ảnh
            </span>
          </div>

          <div className="mb-4">
            <Upload.Dragger
              multiple
              maxCount={20}
              accept="image/*"
              onChange={handleUploadChange}
              fileList={fileList}
              listType="picture-card"
              beforeUpload={() => false}
              className="[&_.ant-upload.ant-upload-drag]:w-40! [&_.ant-upload.ant-upload-drag]:h-40![&_.ant-upload-list]:mt-4 text-left"
            >
              <div className="flex flex-col items-center justify-center h-full p-2">
                <UploadIcon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                <p className="text-[13px] font-semibold text-gray-800 m-0 text-center leading-tight">
                  Kéo thả ảnh hoặc <br /> click để chọn file
                </p>
                <p className="text-[11px] text-gray-500 mt-2 m-0 text-center">
                  Hỗ trợ JPG, PNG <br /> (Tối đa 20 ảnh)
                </p>
              </div>
            </Upload.Dragger>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-gray-400" />
                Đã tải lên:{" "}
                <span className="text-indigo-600">{fileList.length}/5 ảnh</span>
              </span>
              {isValidForSubmit ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Đạt yêu cầu
                </span>
              ) : (
                <span className="text-xs text-orange-500 font-medium">
                  Cần thêm {5 - fileList.length} ảnh
                </span>
              )}
            </div>
            <Progress
              percent={uploadProgress}
              strokeColor={isValidForSubmit ? "#10b981" : "#4f46e5"}
              size="small"
              status={isValidForSubmit ? "success" : "active"}
            />
          </div>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="rounded-lg border-red-200"
          />
        )}

        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
          <p className="text-sm text-indigo-900 font-semibold mb-2 flex items-center gap-2">
            <Info size={16} /> Hướng dẫn chụp ảnh
          </p>
          <ul className="text-sm text-indigo-800 space-y-1.5 pl-6 list-disc opacity-90">
            <li>Chụp toàn cảnh các phòng chính từ nhiều góc độ.</li>
            <li>Chụp cận cảnh các vị trí có vấn đề, hư hỏng (nếu có).</li>
            <li>Đảm bảo ảnh rõ nét, đủ ánh sáng, không bị mờ nhòe.</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
