import {
  UserDetail,
  UserDetailResponse,
  UserListQuery,
  UserListResponse,
} from "@/types/user";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

export const userService = {
  getProfile: async (): Promise<UserDetail> => {
    const { data } = await apiClient.get(`${endpoints.user}/profile`);
    return data.data;
  },

  getUsers: async (params?: UserListQuery): Promise<UserListResponse> => {
    const { data } = await apiClient.get(endpoints.user, { params });
    return data;
  },

  getById: async (id: string): Promise<UserDetailResponse> => {
    const { data } = await apiClient.get(`${endpoints.user}/${id}`);
    return data;
  },
  deleteUser: async (id: string) => {
    const { data } = await apiClient.delete(`${endpoints.user}/${id}`);
    return data;
  },
  updateProfile: async (body: object, id: string) => {
    const { data } = await apiClient.patch(`${endpoints.user}/${id}`, body);
    return data;
  },
};
