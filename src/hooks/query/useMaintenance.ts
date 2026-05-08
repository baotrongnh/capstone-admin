"use client";

import { maintenanceService } from "@/lib/services/maintenance.service";
import { MaintenanceCompleteRequestBody, MaintenanceListQuery, MaintenanceUpdateRequestBody } from "@/types/maintenance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useMaintenances = (params?: MaintenanceListQuery) =>
     useQuery({
          queryKey: ["maintenance", params],
          queryFn: () => maintenanceService.getList(params),
     });

export const useMaintenance = (id?: string | null) =>
     useQuery({
          queryKey: ["maintenance", id],
          queryFn: () => maintenanceService.getById(id!),
          enabled: !!id,
     });

export const useUpdateMaintenance = () => {
     const queryClient = useQueryClient();

     return useMutation({
          mutationFn: ({ id, payload }: { id: string; payload: MaintenanceUpdateRequestBody }) =>
               maintenanceService.update(id, payload),
          onSuccess: (_, variables) => {
               queryClient.invalidateQueries({ queryKey: ["maintenance"] });
               queryClient.invalidateQueries({ queryKey: ["maintenance", variables.id] });
               message.success("Đã cập nhật yêu cầu bảo trì.");
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!");
          },
     });
};

export const useCompleteMaintenance = () => {
     const queryClient = useQueryClient();

     return useMutation({
          mutationFn: ({ id, payload }: { id: string; payload: MaintenanceCompleteRequestBody }) => maintenanceService.complete(id, payload),
          onSuccess: (_, variables) => {
               queryClient.invalidateQueries({ queryKey: ["maintenance"] });
               queryClient.invalidateQueries({ queryKey: ["maintenance", variables.id] });
               message.success("Đã hoàn tất yêu cầu bảo trì.");
          },
          onError: (error) => {
               message.error(error?.message || "Có lỗi xảy ra!");
          },
     });
};

