"use client";

import { ticketService } from "@/lib/services/ticket.service";
import type { ResolveTicketBody, TicketListQuery } from "@/types/ticket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useStaffTickets = (params?: TicketListQuery) => useQuery({
  queryKey: ["tickets", params],
  queryFn: () => ticketService.getList(params),
});

export const useStaffTicket = (id?: string | null) => useQuery({
  queryKey: ["tickets", id],
  queryFn: () => ticketService.getDetail(id!),
  enabled: Boolean(id),
});

export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveTicketBody }) => ticketService.resolve(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      message.success("Đã xác nhận kiểm tra căn hộ.");
    },
    onError: (error) => message.error(error?.message || "Không thể xử lý ticket."),
  });
};
