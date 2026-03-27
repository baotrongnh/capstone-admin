"use client";

import { userService } from "@/lib/services/user.service";
import { UserListQuery } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

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
