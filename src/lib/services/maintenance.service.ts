import { endpoints } from "@/lib/apis/endpoints";
import {
     MaintenanceCompleteResponse,
     MaintenanceCompleteRequestBody,
     MaintenanceDetailResponse,
     MaintenanceListQuery,
     MaintenanceListResponse,
     MaintenanceUpdateRequestBody,
     MaintenanceUpdateResponse,
} from "@/types/maintenance";
import { apiClient } from "../apis/client";

const toCompleteFormData = (payload: MaintenanceCompleteRequestBody) => {
     const formData = new FormData();
     formData.append("resolutionNotes", payload.resolutionNotes);
     if (typeof payload.cost === "number") formData.append("cost", String(payload.cost));
     payload.completionImages?.forEach((image) => formData.append("completionImages", image));
     return formData;
};

export const maintenanceService = {
     getList: async (params?: MaintenanceListQuery): Promise<MaintenanceListResponse> => {
          const { data } = await apiClient.get(endpoints.maintenance, { params });
          return data;
     },

     getById: async (id: string): Promise<MaintenanceDetailResponse> => {
          const { data } = await apiClient.get(`${endpoints.maintenance}/${id}`);
          return data;
     },

     update: async (
          id: string,
          payload: MaintenanceUpdateRequestBody,
     ): Promise<MaintenanceUpdateResponse> => {
          const { data } = await apiClient.patch(`${endpoints.maintenance}/${id}`, payload);
          return data;
     },

     complete: async (id: string, payload: MaintenanceCompleteRequestBody): Promise<MaintenanceCompleteResponse> => {
          const { data } = await apiClient.patch(`${endpoints.maintenance}/${id}/complete`, toCompleteFormData(payload), {
               headers: { "Content-Type": "multipart/form-data" },
          });
          return data;
     },
};
