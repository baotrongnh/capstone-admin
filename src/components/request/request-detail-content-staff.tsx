"use client";

import { Button } from "@/components/ui/button";
import { useFullAddress } from "@/hooks/query/useAddress";
import { useAmenities } from "@/hooks/query/useAmenities";
import { useApartmentGeocoding } from "@/hooks/apartment/use-apartment-geocoding";
import {
  useApartment,
  useCreateCooperationMedia,
} from "@/hooks/query/useApartments";
import { useUser, useUsers } from "@/hooks/query/useUsers";
import {
  mapAmenitiesToOptions,
  mergeAmenityOptions,
  withFallbackAmenityOptions,
} from "@/lib/apartment/amenity-mapping";
import {
  ApartmentForm,
  buildApartmentForm,
  parseNumber,
} from "@/types/apartment-form";
import {
  formatDateTime,
  formatStatus,
  formatVND,
  parseVNDInput,
} from "@/utils/format";
import { message } from "antd";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Hash,
  Home,
  Info,
  Landmark,
  MapPin,
  Ruler,
  Star,
  Users,
} from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  ApartmentDetailsSection,
  ApartmentAmenitySection,
  ApartmentOwnerSection,
  ApartmentMediaSection,
} from "@/components/apartment";
import { useRouter } from "next/navigation";

type RequestDetailContentProps = {
  apartmentId: string | null;
  mode: "view" | "edit";
  allowEdit?: boolean;
  inDialog?: boolean;
};

export function RequestDetailContent({
  apartmentId,
  mode,
  allowEdit = true,
  inDialog = false,
}: RequestDetailContentProps) {
  const {
    data: apartmentDetailResponse,
    isLoading,
    isFetching,
    isError,
  } = useApartment(apartmentId || "");

  const router = useRouter();

  const { mutateAsync: verifyRequest, isPending } = useCreateCooperationMedia();

  const detailApartment = apartmentDetailResponse?.data;
  const detailLoading = isLoading || isFetching;

  const initialForm = useMemo(() => {
    if (!detailApartment) return null;
    return buildApartmentForm(detailApartment);
  }, [detailApartment]);

  const [manualEditMode, setManualEditMode] = useState(false);
  const [draftForm, setDraftForm] = useState<ApartmentForm | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);

  const editMode = mode === "edit" || manualEditMode;
  const form = draftForm || initialForm;

  const { data: amenitiesResponse } = useAmenities();

  const { data: usersResponse, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 200,
  });

  const ownerOptions = usersResponse?.data || [];
  const selectedOwnerId =
    form?.ownerId || detailApartment?.ownerId || undefined;

  const { data: selectedOwnerResponse } = useUser(selectedOwnerId || undefined);

  const selectedOwnerFromList = ownerOptions.find(
    (item) => item.id === selectedOwnerId,
  );
  const selectedOwner = selectedOwnerResponse?.data;

  const ownerName =
    selectedOwner?.fullName ||
    selectedOwnerFromList?.fullName ||
    detailApartment?.owner?.fullName ||
    "-";

  const ownerCompany =
    selectedOwner?.companyName || detailApartment?.owner?.companyName || "-";

  const fullAddress = useFullAddress(
    form?.streetAddress || detailApartment?.streetAddress || undefined,
    detailApartment?.provinceCode || undefined,
    form?.wardCode || detailApartment?.wardCode || undefined,
  );

  const {
    geocodeStatus,
    geocodeErrorMessage,
    markManualCoordinatePick,
    resetGeocodeTracking,
  } = useApartmentGeocoding({
    editMode,
    form,
    fullAddress,
    onAutoCoordinate: ({ latitude, longitude }) => {
      // So sánh để chặn vòng lặp re-render vô tận
      if (form?.latitude !== latitude || form?.longitude !== longitude) {
        setDraftForm((prev) => {
          const currentForm = prev || initialForm;
          if (!currentForm) return prev;
          return {
            ...currentForm,
            latitude: latitude,
            longitude: longitude,
          };
        });
      }
    },
  });

  const usableAreaInvalid =
    form?.usableArea !== undefined &&
    form?.totalArea !== undefined &&
    form.usableArea > form.totalArea;

  const imagePreviews = useMemo(
    () =>
      selectedImageFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [selectedImageFiles],
  );

  const selectedVideoPreviewUrl = useMemo(
    () => (selectedVideoFile ? URL.createObjectURL(selectedVideoFile) : ""),
    [selectedVideoFile],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    return () => {
      if (selectedVideoPreviewUrl) {
        URL.revokeObjectURL(selectedVideoPreviewUrl);
      }
    };
  }, [selectedVideoPreviewUrl]);

  const amenityPresetOptions = useMemo(
    () =>
      withFallbackAmenityOptions(
        form?.amenityIds,
        mergeAmenityOptions(
          mapAmenitiesToOptions(amenitiesResponse?.data),
          mapAmenitiesToOptions(detailApartment?.amenities),
        ),
      ),
    [amenitiesResponse?.data, detailApartment?.amenities, form?.amenityIds],
  );

  const detailItems = useMemo(() => {
    if (!detailApartment) return [];

    return [
      { label: "ID", value: detailApartment.id, icon: Hash },
      {
        label: "Mã căn hộ",
        value: detailApartment.apartmentNumber,
        icon: Home,
      },
      {
        label: "Tên tòa nhà",
        value: detailApartment.buildingName,
        icon: Building2,
      },
      { label: "Tầng", value: detailApartment.floorNumber, icon: Building2 },
      {
        label: "Trạng thái",
        value: formatStatus(detailApartment.status),
        icon: Info,
      },
      {
        label: "Đánh giá trung bình",
        value: detailApartment.rating,
        icon: Star,
      },
      {
        label: "Nội thất",
        value: detailApartment.furnishingStatus,
        icon: Home,
      },
      {
        label: "Giá thuê",
        value: formatVND(detailApartment.baseRentPrice, true),
        icon: CircleDollarSign,
      },
      {
        label: "Tiền cọc",
        value: detailApartment.depositAmount
          ? formatVND(detailApartment.depositAmount, true)
          : "-",
        icon: Landmark,
      },
      {
        label: "Diện tích tổng",
        value: `${detailApartment.totalArea} m²`,
        icon: Ruler,
      },
      {
        label: "Diện tích sử dụng",
        value: detailApartment.usableArea
          ? `${detailApartment.usableArea} m²`
          : "-",
        icon: Ruler,
      },
      {
        label: "Số phòng ngủ",
        value: detailApartment.numberOfBedrooms,
        icon: BedDouble,
      },
      {
        label: "Số phòng tắm",
        value: detailApartment.numberOfBathrooms,
        icon: Bath,
      },
      { label: "Địa chỉ đầy đủ", value: fullAddress, icon: MapPin },
      { label: "Mã phường/xã", value: detailApartment.wardCode, icon: Hash },
      {
        label: "Mã tỉnh/thành",
        value: detailApartment.provinceCode,
        icon: Hash,
      },
      { label: "Vĩ độ", value: detailApartment.latitude, icon: MapPin },
      { label: "Kinh độ", value: detailApartment.longitude, icon: MapPin },
      {
        label: "Năm xây dựng",
        value: detailApartment.yearBuilt,
        icon: CalendarDays,
      },
      {
        label: "Số lượt xem đồng thời tối đa",
        value: detailApartment.maxConcurrentViewings,
        icon: Users,
      },
      {
        label: "Ngày duyệt",
        value: formatDateTime(detailApartment.approvedAt),
        icon: Clock3,
      },
      {
        label: "Ngày tạo",
        value: formatDateTime(detailApartment.createdAt),
        icon: Clock3,
      },
      {
        label: "Cập nhật lần cuối",
        value: formatDateTime(detailApartment.updatedAt),
        icon: Clock3,
      },
    ];
  }, [detailApartment, fullAddress]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 1950 + 1 },
      (_, idx) => currentYear - idx,
    );
  }, []);

  const hasMediaChanges = selectedImageFiles.length > 0 || !!selectedVideoFile;

  const hasFormChanges = useMemo(() => {
    if (!initialForm || !form) return false;

    const initialData = initialForm as Record<string, unknown>;
    const currentData = form as Record<string, unknown>;
    const keys = Array.from(
      new Set([...Object.keys(initialData), ...Object.keys(currentData)]),
    );

    return keys.some((key) => {
      const before = initialData[key] ?? null;
      const after = currentData[key] ?? null;
      return JSON.stringify(before) !== JSON.stringify(after);
    });
  }, [form, initialForm]);

  const hasClientChanges = false;

  const canSaveChanges =
    !usableAreaInvalid &&
    (hasFormChanges || hasMediaChanges || hasClientChanges);

  const setField = (key: string, value: unknown) => {
    setDraftForm((prev) => {
      const currentForm = prev || initialForm;
      if (!currentForm) return prev;
      return { ...currentForm, [key]: value };
    });
  };

  const setNumberField = (key: string, raw: string) => {
    setField(key, parseNumber(raw));
  };

  const setCurrencyField = (key: string, raw: string) => {
    setField(key, parseVNDInput(raw));
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setField(field, value);
    clearFieldError(field);
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleNumberFieldChange = (key: string, raw: string) => {
    setNumberField(key, raw);
    clearFieldError(key);
  };

  const handleCurrencyFieldChange = (key: string, raw: string) => {
    setCurrencyField(key, raw);
    clearFieldError(key);
  };

  const handlePickCoordinate = (value: {
    latitude: number;
    longitude: number;
  }) => {
    setField("latitude", value.latitude);
    setField("longitude", value.longitude);
    markManualCoordinatePick();
  };

  const handleSelectDepositPreset = () => {
    // Not needed for request-detail-content-staff
  };

  const handleStartEdit = () => {
    if (!initialForm || !allowEdit) return;
    setDraftForm(initialForm);
    setManualEditMode(true);
  };

  const resetEditTransientState = () => {
    setSelectedImageFiles([]);
    setSelectedVideoFile(null);
  };

  const handleCancelEdit = () => {
    setDraftForm(null);
    setManualEditMode(false);
    resetEditTransientState();
    resetGeocodeTracking();
    setFieldErrors({});
  };

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (files.length === 0) return;

    setSelectedImageFiles((prev) => {
      const merged = [...prev, ...files];
      if (merged.length > 10) {
        message.warning("Tối đa 10 ảnh mỗi lần cập nhật");
      }
      return merged.slice(0, 10);
    });

    event.target.value = "";
  };

  const handleSelectVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      message.error("Vui lòng chọn file video hợp lệ");
      event.target.value = "";
      return;
    }

    setSelectedVideoFile(file);
    event.target.value = "";
  };

  const handleRemoveExistingImage = (index: number) => {
    if (!form) return;

    setField(
      "images",
      (form.images || []).filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleRemoveSelectedImage = (index: number) => {
    setSelectedImageFiles((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleSave = async () => {
    if (!apartmentId || !form) return;

    if (!canSaveChanges) {
      message.info("Chưa có thay đổi để lưu");
      return;
    }

    if (usableAreaInvalid) {
      message.error("Diện tích sử dụng không được lớn hơn diện tích tổng");
      return;
    }

    const hasExistingVideo = !!form.videoTourUrl;
    const hasNewVideo = !!selectedVideoFile;
    if (!hasExistingVideo && !hasNewVideo) {
      message.error("Vui lòng chọn ít nhất 1 video");
      return;
    }

    const formData = new FormData();

    formData.append("buildingName", form.buildingName || "");
    formData.append("apartmentNumber", form.apartmentNumber || "");
    formData.append("floorNumber", String(form.floorNumber || ""));
    formData.append("yearBuilt", String(form.yearBuilt || ""));
    formData.append("furnishingStatus", form.furnishingStatus || "");
    formData.append("streetAddress", form.streetAddress || "");
    formData.append("usableArea", String(form.usableArea || ""));
    formData.append("totalArea", String(form.totalArea || ""));
    formData.append("numberOfBedrooms", String(form.numberOfBedrooms || ""));
    formData.append("numberOfBathrooms", String(form.numberOfBathrooms || ""));
    formData.append("description", form.description || "");
    formData.append("baseRentPrice", String(form.baseRentPrice || ""));
    formData.append("depositAmount", String(form.depositAmount || ""));

    if (form.amenityIds && form.amenityIds.length > 0) {
      form.amenityIds.forEach((amenityId: string) => {
        formData.append("amenityIds", amenityId);
      });
    }

    selectedImageFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (selectedVideoFile) {
      formData.append("video", selectedVideoFile);
    }

    try {
      await verifyRequest({ apartmentId: apartmentId, data: formData });
      router.push("/staff/request");
    } catch (error) {
      console.log("error", error);
      message.error("Cập nhật thất bại, vui lòng thử lại");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="border-b px-5 py-4 md:px-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {editMode ? "Chỉnh sửa căn hộ" : "Chi tiết căn hộ"}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {editMode
            ? "Cập nhật thông tin căn hộ theo từng nhóm trường để thao tác nhanh và chính xác."
            : "Thông tin chi tiết căn hộ được hiển thị theo cấu trúc rõ ràng và dễ tra cứu."}
        </p>
      </div>

      <div
        className={
          inDialog
            ? "max-h-[82vh] overflow-y-auto px-4 py-4 md:px-6 md:py-5"
            : "px-4 py-4 md:px-6 md:py-5"
        }
      >
        {!apartmentId && (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Vui lòng chọn căn hộ để xem chi tiết.
          </p>
        )}

        {apartmentId && detailLoading && (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Đang tải chi tiết căn hộ...
          </p>
        )}

        {apartmentId && isError && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            Không thể tải chi tiết căn hộ. Vui lòng thử lại.
          </p>
        )}

        {detailApartment && form && (
          <div className="space-y-5">
            <ApartmentDetailsSection
              editMode={editMode}
              form={form}
              fieldErrors={fieldErrors}
              detailItems={detailItems}
              fullAddress={fullAddress}
              availableYears={availableYears}
              usableAreaInvalid={usableAreaInvalid}
              initialProvinceCode={detailApartment.provinceCode || undefined}
              geocodeStatus={geocodeStatus}
              geocodeErrorMessage={geocodeErrorMessage}
              setField={handleFieldChange}
              setNumberField={handleNumberFieldChange}
              setCurrencyField={handleCurrencyFieldChange}
              onPickCoordinate={handlePickCoordinate}
            />

            <ApartmentOwnerSection
              editMode={editMode}
              ownerSummary={{
                id: detailApartment.ownerId || form.ownerId || null,
                fullName: ownerName,
                companyName: ownerCompany,
              }}
              ownerId={form.ownerId || undefined}
              ownerOptions={ownerOptions}
              usersLoading={usersLoading}
              onOwnerChange={(value) => setField("ownerId", value)}
            />

            <ApartmentAmenitySection
              editMode={editMode}
              description={form.description}
              amenityIds={form.amenityIds || []}
              options={amenityPresetOptions}
              onDescriptionChange={(value) => setField("description", value)}
              onAmenitiesChange={(value) => setField("amenityIds", value)}
            />

            <ApartmentMediaSection
              editMode={editMode}
              existingImages={form.images || []}
              selectedImagePreviews={imagePreviews}
              selectedVideoFile={selectedVideoFile}
              selectedVideoPreviewUrl={selectedVideoPreviewUrl}
              videoTourUrl={form.videoTourUrl}
              onSelectImages={handleSelectImages}
              onSelectVideo={handleSelectVideo}
              onRemoveExistingImage={handleRemoveExistingImage}
              onRemoveSelectedImage={handleRemoveSelectedImage}
              onRemoveSelectedVideo={() => setSelectedVideoFile(null)}
            />

            {editMode ? (
              <>
                <div className="flex justify-between">
                  <div></div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isPending || !canSaveChanges}
                    >
                      {isPending ? "Đang duyệt..." : "Duyệt yêu cầu"}
                    </Button>
                  </div>
                </div>
              </>
            ) : allowEdit ? (
              <>
                <div className="flex justify-between">
                  <div></div>
                  <Button onClick={handleStartEdit}>
                    Xác thực lại yêu cầu
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
