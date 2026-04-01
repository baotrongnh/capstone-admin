import { ApartmentCreateRequestBody, ApartmentUpdateRequestBody } from "@/types/apartment";

type ApartmentPayload = Partial<ApartmentCreateRequestBody & ApartmentUpdateRequestBody> & {
     videoTourUrl?: string;
};

type BuildApartmentFormDataOptions = {
     mode: "create" | "update";
     imageFiles?: File[];
     videoFile?: File | null;
};

const STRING_FIELDS: Array<keyof ApartmentPayload> = [
     "buildingName",
     "apartmentNumber",
     "streetAddress",
     "furnishingStatus",
     "description",
     "ownerId",
];

const NUMBER_FIELDS: Array<keyof ApartmentPayload> = [
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
];

export const buildApartmentFormData = (
     payload: ApartmentPayload,
     options: BuildApartmentFormDataOptions,
): FormData => {
     const formData = new FormData();

     for (const key of STRING_FIELDS) {
          const value = payload[key];
          if (typeof value === "string" && value.trim()) {
               formData.append(key, value.trim());
          }
     }

     for (const key of NUMBER_FIELDS) {
          const value = payload[key];
          if (typeof value === "number" && Number.isFinite(value)) {
               formData.append(key, String(value));
          }
     }

     if (options.mode === "update" && payload.status) {
          formData.append("status", payload.status);
     }

     if (Array.isArray(payload.amenities)) {
          payload.amenities
               .map((item) => item.trim())
               .filter(Boolean)
               .forEach((item) => formData.append("amenities", item));
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
