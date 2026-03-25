import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

export const apartmentService = {
  getApartments: async (params?: Record<string, any>) => {
    const response = await apiClient.get(endpoints.apartments, { params });
    return response.data;
  },
};
