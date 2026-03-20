import { LoginDTO, LoginPayload, LoginRes, LogoutDTO, LogoutRes } from "@/types/auth";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

export const authServices = {
    login: async (payload: LoginDTO): Promise<LoginPayload> => {
        const { data } = await apiClient.post(`${endpoints.auth}/login`, payload)
        return data.data
    },
    logout: async (refreshToken: LogoutDTO): Promise<LogoutRes> => {
        const { data } = await apiClient.post(`${endpoints.auth}/logout`, refreshToken)
        return data
    }
}