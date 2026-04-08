import { paths } from "@/types/api";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

// Use the properly defined /api/v1/users endpoint structure
export type OperatorResponse =
  paths["/api/v1/users"]["get"]["responses"]["200"]["content"]["application/json"];

// OperatorItem represents individual operator object (extends user with operator-specific fields)
export type OperatorItem = NonNullable<OperatorResponse["data"]>[number] & {
  employeeCode?: string;
  role?: string;
  operatorShift?: string;
  position?: string;
};

export const operatorService = {
  getOperators: async () => {
    const { data } = await apiClient.get<OperatorResponse>(
      `${endpoints.user}/operators`,
    );
    return data;
  },
  createOperator: async (operatorData: object) => {
    const { data } = await apiClient.post(
      `${endpoints.user}/operators`,
      operatorData,
    );
    return data;
  },
  updateOperator: async (operatorId: string, body: object) => {
    const { data } = await apiClient.patch(
      `${endpoints.user}/operators/${operatorId}`,
      body,
    );
    return data;
  },
  blockOperator: async (operatorId: string) => {
    const { data } = await apiClient.delete(
      `${endpoints.user}/operators/${operatorId}`,
    );
    return data;
  },
};
