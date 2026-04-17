import {
  ApartmentCreateResponse,
  ApartmentDetailResponse,
  ApartmentListResponse,
  ApartmentSearchQueryParams,
  ApartmentUpdateResponse,
} from "@/types/apartment";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

type UploadProgressHandler = (progressEvent: {
  loaded: number;
  total?: number;
}) => void;

export const apartmentService = {
  getList: async (
    params?: ApartmentSearchQueryParams,
  ): Promise<ApartmentListResponse> => {
    const { data } = await apiClient.get(`${endpoints.apartments}/search`, {
      params,
    });
    return data;
  },

  getById: async (id: string | number): Promise<ApartmentDetailResponse> => {
    const { data } = await apiClient.get(`${endpoints.apartments}/${id}`);
    return data;
  },

  create: async (
    apartmentData: FormData,
    options?: {
      onUploadProgress?: UploadProgressHandler;
    },
  ): Promise<ApartmentCreateResponse> => {
    const { data } = await apiClient.post(endpoints.apartments, apartmentData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: options?.onUploadProgress,
    });
    return data;
  },

  update: async (
    id: string | number,
    apartmentData: FormData,
    options?: {
      onUploadProgress?: UploadProgressHandler;
    },
  ): Promise<ApartmentUpdateResponse> => {
    const { data } = await apiClient.patch(
      `${endpoints.apartments}/${id}`,
      apartmentData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: options?.onUploadProgress,
      },
    );
    return data;
  },

  delete: async (id: string | number) => {
    const { data } = await apiClient.delete(`${endpoints.apartments}/${id}`);
    return data;
  },

  createCooperationMedia: async (
    apartmentId: string | number,
    cooperationData: object,
  ) => {
    const { data } = await apiClient.patch(
      `${endpoints.apartments}/${apartmentId}/cooperation-media`,
      cooperationData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  },

  approveCooperation: async (apartmentId: string | number) => {
    const { data } = await apiClient.patch(
      `${endpoints.apartments}/${apartmentId}/approve-cooperation`,
    );
    return data;
  },

  rejectCooperation: async (apartmentId: string | undefined, body: object) => {
    const { data } = await apiClient.patch(
      `${endpoints.apartments}/${apartmentId}/reject-cooperation`,
      body,
    );
    return data;
  },
};
