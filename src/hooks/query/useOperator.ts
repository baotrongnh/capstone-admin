import { operatorService } from "@/lib/services/operator.service";
import { getErrorMessage } from "@/lib/utils/api-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

export const useOperators = () => {
  return useQuery({
    queryKey: ["operators"],
    queryFn: () => operatorService.getOperators(),
  });
};

export const useCreateOperator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (operatorData: object) =>
      operatorService.createOperator(operatorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      message.success("Đã thêm nhân viên vận hành mới.");
    },
    onError: (error) => {
      console.error("Error creating operator:", error);
      message.error(getErrorMessage(error, "Lỗi khi thêm nhân viên vận hành."));
    },
  });
};

export const useUpdateOperator = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (operatorData: object) =>
      operatorService.updateOperator(id, operatorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      message.success("Đã cập nhật thông tin nhân viên vận hành.");
    },
    onError: (error) => {
      console.error("Error updating operator:", error);
      message.error(
        getErrorMessage(
          error,
          "Lỗi khi cập nhật thông tin nhân viên vận hành.",
        ),
      );
    },
  });
};

export const useDeleteOperator = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => operatorService.blockOperator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      message.success("Đã khóa nhân viên vận hành.");
    },
    onError: (error) => {
      console.error("Error deleting operator:", error);
      message.error(
        getErrorMessage(error, "Lỗi khi khóa/mở khóa nhân viên vận hành."),
      );
    },
  });
};
