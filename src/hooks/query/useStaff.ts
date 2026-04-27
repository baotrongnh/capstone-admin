import { staffService } from "@/lib/services/staff.service";
import { getErrorMessage } from "@/lib/utils/api-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useStaffs = () => {
  return useQuery({
    queryKey: ["staffs"],
    queryFn: () => staffService.getStaffs(),
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffData: object) => staffService.createStaff(staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      message.success("Đã thêm nhân viên mới.");
    },
    onError: (error) => {
      console.error("Error creating staff:", error);
      message.error(getErrorMessage(error, "Lỗi khi thêm nhân viên."));
    },
  });
};

export const useUpdateStaff = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (staffData: object) => staffService.updateStaff(id, staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      message.success("Đã cập nhật thông tin nhân viên.");
    },
    onError: (error) => {
      console.error("Error updating staff:", error);
      message.error(
        getErrorMessage(error, "Lỗi khi cập nhật thông tin nhân viên."),
      );
    },
  });
};

export const useDeleteStaff = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => staffService.blockStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      message.success("Đã khóa nhân viên.");
    },
    onError: (error) => {
      console.error("Error deleting staff:", error);
      message.error(getErrorMessage(error, "Lỗi khi khóa/mở khóa nhân viên."));
    },
  });
};
