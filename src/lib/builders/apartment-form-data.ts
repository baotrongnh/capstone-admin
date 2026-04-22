import type { ApartmentPayload } from "@/types/apartment";

type BuildApartmentFormDataOptions = {
     mode: "create" | "update";
     imageFiles?: File[];
     videoFile?: File | null;
};

const toFiniteNumber = (value: unknown): number | undefined => {
     if (typeof value === "number" && Number.isFinite(value)) {
          return value
     }

     if (typeof value !== "string") {
          return undefined
     }

     const trimmed = value.trim()
     if (!trimmed) {
          return undefined
     }

     const decimalComma = /^-?\d+,\d+$/.test(trimmed)
     const thousandsComma = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(trimmed)

     const normalized = decimalComma
          ? trimmed.replace(",", ".")
          : thousandsComma
               ? trimmed.replace(/,/g, "")
               : trimmed

     const parsed = Number(normalized)
     return Number.isFinite(parsed) ? parsed : undefined
}

const STRING_FIELDS = [
     "buildingName",
     "apartmentNumber",
     "streetAddress",
     "furnishingStatus",
     "description",
     "ownerId",
] as const

const NUMBER_FIELDS = [
     "floorNumber",
     "wardCode",
     "latitude",
     "longitude",
     "totalArea",
     "usableArea",
     "numberOfBedrooms",
     "numberOfBathrooms",
     "baseRentPrice",
     "depositAmount",
     "yearBuilt",
] as const

export const buildApartmentFormData = (
     payload: ApartmentPayload,
     options: BuildApartmentFormDataOptions,
): FormData => {
     const formData = new FormData();
     const payloadData = payload as Record<string, unknown>

     for (const key of STRING_FIELDS) {
          const value = payloadData[key]
          if (typeof value === "string" && value.trim()) {
               formData.append(key, value.trim());
          }
     }

     for (const key of NUMBER_FIELDS) {
          const value = payloadData[key]
          const numericValue = toFiniteNumber(value)
          if (numericValue !== undefined) {
               formData.append(key, String(numericValue));
          }
     }

     if (options.mode === "update" && payload.status) {
          formData.append("status", payload.status);
     }

     if (Array.isArray(payload.amenityIds)) {
          payload.amenityIds
               .map((item) => item.trim())
               .filter(Boolean)
               .forEach((item) => formData.append("amenityIds", item));
     }

     const existingImages = Array.isArray(payload.images)
          ? payload.images
               .filter((imageUrl): imageUrl is string => typeof imageUrl === "string")
               .map((imageUrl) => imageUrl.trim())
               .filter(Boolean)
          : null

     if (existingImages) {
          if (options.mode === "update" && existingImages.length === 0) {
               formData.append("images", "")
          } else {
               existingImages.forEach((imageUrl) => {
                    formData.append("images", imageUrl)
               })
          }
     }

     if (Array.isArray(options.imageFiles)) {
          options.imageFiles.forEach((file) => {
               formData.append("images", file);
          });
     }

     if (options.videoFile) {
          formData.append("video", options.videoFile);
     }

     return formData;
};
