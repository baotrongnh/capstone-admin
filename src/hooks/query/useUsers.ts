"use client";

import { userService } from "@/lib/services/user.service";
import { UserListQuery } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useUsers = (params?: UserListQuery) =>
  useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getUsers(params),
  });

export const useUser = (id?: string) =>
  useQuery({
    queryKey: ["users", id],
    queryFn: () => userService.getById(id!),
    enabled: !!id,
  });

export const useDeleteUser = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Khóa người dùng thành công");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      message.error("Có lỗi xảy ra khi xóa người dùng");
    },
  });
};

export const useUpdateProfile = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: object) => userService.updateProfile(body, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("Cập nhật thông tin người dùng thành công");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      message.error("Có lỗi xảy ra khi cập nhật thông tin người dùng");
    },
  });
};
