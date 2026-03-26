"use client";

import { uploadFile } from "@/utils/uploadFile";
import { useCreateCooperationMedia } from "@/hooks/query/useApartments";
import { useDistricts, useProvinces } from "@/hooks/query/useProvinces";
import { ApartmentItem } from "@/types/apartment";
import type { UploadFile } from "antd";
import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Upload,
} from "antd";
import { RcFile } from "antd/es/upload";
import {
  CheckCircle2,
  FileText,
  Info,
  MapPin,
  Maximize,
  Plus,
  VideoIcon,
} from "lucide-react";
import { useState } from "react";

interface StaffUpdateModalProps {
  open: boolean;
  request: ApartmentItem | null;
  onClose: () => void;
  onUpdate: (success: boolean) => void;
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
  const [videoList, setVideoList] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);

  const { data: provinces } = useProvinces(true);

  const { data: districts } = useDistricts(selectedProvince || undefined, true);

  const { mutateAsync: createCooperationMedia } = useCreateCooperationMedia();

  if (!request) return null;

  const provinceOptions = provinces?.map((item: any) => ({
    label: item.name,
    value: item.code,
  }));

  const districtOptions = districts?.map((item: any) => ({
    label: item.name,
    value: item.code,
  }));

  const handleUploadChange = (info: any) => {
    const newFileList = info.fileList.slice(-20);
    setFileList(newFileList);
    form.setFieldValue("surveyImages", newFileList);

    if (newFileList.length >= 3) {
      setError(null);
    }
  };

  const handleVideoChange = (info: any) => {
    const newVideoList = info.fileList.slice(-1);
    setVideoList(newVideoList);
    form.setFieldValue("surveyVideo", newVideoList);
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const values = await form.validateFields();
      setError(null);

      const formData = new FormData();

      formData.append("buildingName", values.buildingName);
      formData.append("apartmentNumber", values.apartmentNumber);
      formData.append("floorNumber", String(values.floorNumber));
      formData.append("yearBuilt", String(values.yearBuilt));
      formData.append("furnishingStatus", values.furnishingStatus);

      formData.append("wardCode", values.wardCode);
      formData.append("streetAddress", values.streetAddress || "");
      formData.append("usableArea", String(values.usableArea));
      formData.append("totalArea", String(values.totalArea));
      formData.append("numberOfBedrooms", String(values.numberOfBedrooms));
      formData.append("numberOfBathrooms", String(values.numberOfBathrooms));
      formData.append("description", values.description);
      formData.append("baseRentPrice", String(values.baseRentPrice));
      formData.append("depositAmount", String(values.depositAmount));

      if (values.amenities && values.amenities.length > 0) {
        values.amenities.forEach((item: string) => {
          formData.append("amenities[]", item);
        });
      }

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj as RcFile);
        }
      });

      if (videoList[0]?.originFileObj) {
        formData.append("video", videoList[0].originFileObj as RcFile);
      }

      await createCooperationMedia({
        apartmentId: request.id,
        data: formData,
      });

      onUpdate(true);
      handleClose();
    } catch (err: any) {
      console.error("Lỗi:", err);
      const errorMessage =
        err?.response?.data?.message || err?.message || "Lỗi hệ thống";
      setError(
        Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
    setFileList([]);
    setVideoList([]);
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
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div></div>
          <Space>
            <Button
              type="primary"
              onClick={handleUpdate}
              loading={isLoading}
              size="medium"
              disabled={isLoading}
              icon={<CheckCircle2 size={18} />}
              className="bg-indigo-600 hover:bg-indigo-700 font-medium shadow-sm"
            >
              Duyệt hợp tác
            </Button>
          </Space>
        </div>
      }
    >
      <div className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Maximize size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Mã căn hộ
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate flex items-baseline gap-1">
                {request.apartmentNumber || "N/A"}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Tên căn hộ
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {request.buildingName || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin size={20} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                Trạng thái
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {request.status === "inactive"
                  ? "Không hoạt động"
                  : "Hoạt động"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 space-y-6">
          <h3 className="text-base font-semibold text-gray-800">
            1. Tình trạng Bất động sản
          </h3>

          <Form form={form} layout="vertical">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Thông tin cơ bản
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="buildingName"
                  label="Tên căn hộ"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập tên..." />
                </Form.Item>

                <Form.Item
                  name="apartmentNumber"
                  label="Số căn hộ"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập số..." />
                </Form.Item>

                <Form.Item
                  name="floorNumber"
                  label="Số tầng"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Nhập tầng..." />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="yearBuilt"
                  label="Năm xây dựng"
                  rules={[{ required: true }]}
                >
                  <Input type="number" placeholder="VD: 2020" />
                </Form.Item>

                <Form.Item
                  name="furnishingStatus"
                  label="Nội thất"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Chọn"
                    options={[
                      { label: "Đầy đủ nội thất", value: "fully_furnished" },
                      { label: "Ít nội thất", value: "semi_furnished" },
                      { label: "Không có nội thất", value: "unfurnished" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="province"
                  label="Tỉnh/Thành"
                  rules={[{ required: true, message: "Vui lòng chọn tỉnh" }]}
                >
                  <Select
                    placeholder="Chọn tỉnh"
                    options={provinceOptions}
                    loading={!provinces}
                    showSearch
                    onChange={(value) => {
                      setSelectedProvince(value);
                    }}
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="wardCode"
                  label="Phường/Xã"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Chọn phường"
                    options={districtOptions}
                    showSearch
                    disabled={!selectedProvince}
                  />
                </Form.Item>

                <Form.Item name="streetAddress" label="Địa chỉ cụ thể">
                  <Input.TextArea rows={2} placeholder="Số nhà, đường..." />
                </Form.Item>
              </div>
            </div>

            <div className="bg-gray-50 border mt-4 border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Cấu trúc & tiện ích
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="usableArea"
                  label="DT sử dụng"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="m²" />
                </Form.Item>

                <Form.Item
                  name="totalArea"
                  label="Tổng DT"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="m²" />
                </Form.Item>

                <Form.Item
                  name="numberOfBedrooms"
                  label="Phòng ngủ"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="2" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="numberOfBathrooms"
                  label="Phòng tắm"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="2" />
                </Form.Item>

                <Form.Item
                  name="amenities"
                  label="Tiện ích"
                  rules={[{ required: true }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn tiện ích"
                    options={[
                      { label: "Wifi", value: "wifi" },
                      { label: "Bãi xe", value: "parking" },
                      { label: "Gym", value: "gym" },
                      { label: "Hồ bơi", value: "pool" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Mô tả thêm"
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={3} placeholder="Mô tả thêm..." />
                </Form.Item>
              </div>
            </div>

            <div className="bg-gray-50 border mt-4 border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Giá & thanh toán
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="baseRentPrice"
                  label="Giá thuê"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="VNĐ / tháng" />
                </Form.Item>

                <Form.Item
                  name="depositAmount"
                  label="Tiền cọc"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="VNĐ" />
                </Form.Item>
              </div>
            </div>

            <Divider className="my-4" />

            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                2. Hồ sơ hình ảnh & Video
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="surveyImages"
                  label="Hình ảnh khảo sát"
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                  rules={[
                    {
                      validator: (_, value) =>
                        value && value.length >= 3
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error("Vui lòng tải lên ít nhất 3 ảnh"),
                            ),
                    },
                  ]}
                >
                  <Upload
                    multiple
                    listType="picture-card"
                    accept="image/*"
                    beforeUpload={() => false}
                    onChange={handleUploadChange}
                    fileList={fileList}
                  >
                    {fileList.length < 20 && (
                      <div className="flex flex-col items-center justify-center">
                        <Plus size={20} className="text-indigo-500 mb-1" />
                        <div className="text-[10px] text-indigo-600 uppercase tracking-tighter">
                          Thêm ảnh
                        </div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="surveyVideo"
                  label="Video minh chứng"
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                  rules={[
                    { required: true, message: "Vui lòng tải lên 1 video" },
                  ]}
                >
                  <Upload
                    maxCount={1}
                    accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                    beforeUpload={(file) => {
                      const isAllowed =
                        file.type === "video/mp4" ||
                        file.type === "video/quicktime" ||
                        file.type === "video/webm" ||
                        file.name.toLowerCase().endsWith(".mp4") ||
                        file.name.toLowerCase().endsWith(".mov") ||
                        file.name.toLowerCase().endsWith(".webm");

                      if (!isAllowed) {
                        message.error(
                          "Định dạng video không hợp lệ! Vui lòng chọn MP4, MOV hoặc WEBM.",
                        );
                        return Upload.LIST_IGNORE;
                      }

                      return false;
                    }}
                    onChange={handleVideoChange}
                    fileList={videoList}
                    listType="picture-card"
                  >
                    {videoList.length < 1 && (
                      <div className="flex flex-col items-center justify-center">
                        <VideoIcon size={20} className="text-rose-500 mb-1" />
                        <div className="text-[10px] font-bold text-rose-600 uppercase tracking-tighter">
                          Thêm video
                        </div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>

        <Divider className="my-4" />

        {error && (
          <Alert
            title={error}
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
