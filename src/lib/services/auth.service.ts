import { LoginDTO, LoginPayload, LoginRes, LogoutDTO, LogoutRes } from "@/types/auth";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";
import { message } from "antd";
import { useTranslations } from "next-intl";

export const authServices = {
    login: async (payload: LoginDTO): Promise<LoginPayload> => {
        try {
            const { data } = await apiClient.post(`${endpoints.auth}/login`, payload);
            return data.data;
        } catch (error) {
            message.error('Có lỗi đã xảy ra!')
            throw error;
        }
    },
    logout: async (refreshToken: LogoutDTO): Promise<LogoutRes> => {
        try {
            const { data } = await apiClient.post(`${endpoints.auth}/logout`, refreshToken);
            return data;
        } catch (error) {
            message.error('Có lỗi đã xảy ra!')
            throw error;
        }
    }
}