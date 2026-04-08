import { paths } from "@/types/api";
import { apiClient } from "../apis/client";
import { endpoints } from "../apis/endpoints";

// Use the properly defined /api/v1/users endpoint structure since /api/v1/users/staff lacks content definition
export type StaffResponse =
  paths["/api/v1/users"]["get"]["responses"]["200"]["content"]["application/json"];

// StaffItem represents individual staff object (extends user with staff-specific fields)
export type StaffItem = NonNullable<StaffResponse["data"]>[number] & {
  employeeCode?: string;
  role?: string;
  staffRole?: string;
  department?: string;
  workingCity?: string;
  workingDistrict?: string;
  hireDate?: string;
  position?: string;
};

export const staffService = {
  getStaffs: async () => {
    const { data } = await apiClient.get<StaffResponse>(
      `${endpoints.user}/staff`,
    );
    return data;
  },
  createStaff: async (staffData: object) => {
    const { data } = await apiClient.post(`${endpoints.user}/staff`, staffData);
    return data;
  },
  updateStaff: async (staffId: string, body: object) => {
    const { data } = await apiClient.patch(
      `${endpoints.user}/staff/${staffId}`,
      body,
    );
    return data;
  },
  blockStaff: async (staffId: string) => {
    const { data } = await apiClient.delete(
      `${endpoints.user}/staff/${staffId}`,
    );
    return data;
  },
};
