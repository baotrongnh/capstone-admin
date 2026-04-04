import type { ApartmentPayload } from "@/types/apartment";

type BuildApartmentFormDataOptions = {
     mode: "create" | "update";
     imageFiles?: File[];
     videoFile?: File | null;
};

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
          if (typeof value === "number" && Number.isFinite(value)) {
               formData.append(key, String(value));
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

     if (Array.isArray(payload.images)) {
          payload.images.forEach((imageUrl) => {
               if (typeof imageUrl === "string" && imageUrl.trim()) {
                    formData.append("images", imageUrl.trim());
               }
          });
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
