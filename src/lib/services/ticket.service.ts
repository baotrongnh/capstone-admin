import { endpoints } from "@/lib/apis/endpoints";
import type { ResolveTicketBody, TicketDetail, TicketItem, TicketListQuery } from "@/types/ticket";
import { apiClient } from "../apis/client";

const toResolveFormData = (payload: ResolveTicketBody) => {
  const formData = new FormData();
  formData.append("action", payload.action);
  formData.append("note", payload.note);
  payload.images.forEach((image) => formData.append("images", image));
  return formData;
};

export const ticketService = {
  getList: async (params?: TicketListQuery): Promise<TicketItem[]> => {
    const { data } = await apiClient.get(endpoints.tickets, { params });
    return data;
  },
  getDetail: async (id: string): Promise<TicketDetail> => {
    const { data } = await apiClient.get(`${endpoints.tickets}/${id}`);
    return data;
  },
  resolve: async (id: string, payload: ResolveTicketBody) => {
    const { data } = await apiClient.post(`${endpoints.tickets}/${id}/resolve`, toResolveFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
