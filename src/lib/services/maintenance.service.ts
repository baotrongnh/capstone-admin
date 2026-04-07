import { endpoints } from "@/lib/apis/endpoints";
import {
     MaintenanceCompleteResponse,
     MaintenanceDetailResponse,
     MaintenanceListQuery,
     MaintenanceListResponse,
     MaintenanceUpdateRequestBody,
     MaintenanceUpdateResponse,
} from "@/types/maintenance";
import { apiClient } from "../apis/client";

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

     complete: async (id: string): Promise<MaintenanceCompleteResponse> => {
          const { data } = await apiClient.patch(`${endpoints.maintenance}/${id}/complete`);
          return data;
     },
};