import type { paths } from "@/types/api"

export type MaintenanceListResponse =
     paths["/api/v1/maintenance"]["get"]["responses"]["200"]["content"]["application/json"]
export type MaintenanceListQuery =
     paths["/api/v1/maintenance"]["get"]["parameters"]["query"]
export type MaintenanceDetailResponse =
     paths["/api/v1/maintenance/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
export type MaintenanceUpdateRequestBody =
     paths["/api/v1/maintenance/{id}"]["patch"]['requestBody']['content']['application/json']
export type MaintenanceUpdateResponse =
     paths["/api/v1/maintenance/{id}"]["patch"]["responses"]["200"]["content"]["application/json"]
export type MaintenanceCompleteResponse =
     paths["/api/v1/maintenance/{id}/complete"]["patch"]["responses"]["200"]["content"]["application/json"]

export type MaintenanceItem = NonNullable<MaintenanceListResponse["data"]>[number]
export type MaintenanceDetailData = NonNullable<MaintenanceDetailResponse["data"]>

export type MaintenanceStatus = NonNullable<NonNullable<MaintenanceListQuery>["status"]>
export type MaintenancePriority = NonNullable<MaintenanceUpdateRequestBody["priority"]>

export type MaintenanceOption<T extends string> = {
     value: T;
     label: string;
     badgeClass: string;
};

export type MaintenanceUpdateForm = {
     status: MaintenanceStatus;
     priority: MaintenancePriority;
     scheduledDate: string;
     resolutionNotes: string;
     cost: string;
};

export const MAINTENANCE_STATUS_OPTIONS: MaintenanceOption<MaintenanceStatus>[] = [
     {
          value: "submitted",
          label: "Mới gửi",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
     },
     {
          value: "acknowledged",
          label: "Đã tiếp nhận",
          badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
     },
     {
          value: "scheduled",
          label: "Đã lên lịch",
          badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
     },
     {
          value: "in_progress",
          label: "Đang xử lý",
          badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
     },
     {
          value: "completed",
          label: "Hoàn tất",
          badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
     },
     {
          value: "cancelled",
          label: "Đã hủy",
          badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
     },
];

export const MAINTENANCE_PRIORITY_OPTIONS: MaintenanceOption<MaintenancePriority>[] = [
     {
          value: "low",
          label: "Thấp",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
     },
     {
          value: "medium",
          label: "Trung bình",
          badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
     },
     {
          value: "high",
          label: "Cao",
          badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
     },
     {
          value: "emergency",
          label: "Khẩn cấp",
          badgeClass: "bg-red-100 text-red-700 border-red-200",
     },
];

export const DEFAULT_MAINTENANCE_UPDATE_FORM: MaintenanceUpdateForm = {
     status: "submitted",
     priority: "medium",
     scheduledDate: "",
     resolutionNotes: "",
     cost: "",
};

export const normalizeMaintenanceStatus = (value?: string | null): MaintenanceStatus => {
     const found = MAINTENANCE_STATUS_OPTIONS.find((option) => option.value === value);
     return found?.value || "submitted";
};

export const normalizeMaintenancePriority = (value?: string | null): MaintenancePriority => {
     const found = MAINTENANCE_PRIORITY_OPTIONS.find((option) => option.value === value);
     return found?.value || "medium";
};

export const getMaintenanceStatusOption = (value?: string | null) => {
     return MAINTENANCE_STATUS_OPTIONS.find((item) => item.value === value);
};

export const getMaintenancePriorityOption = (value?: string | null) => {
     return MAINTENANCE_PRIORITY_OPTIONS.find((item) => item.value === value);
};

export const toLocalDateTimeInput = (value?: string | null) => {
     if (!value) return "";
     const date = new Date(value);
     if (Number.isNaN(date.getTime())) return "";

     const offset = date.getTimezoneOffset();
     const localDate = new Date(date.getTime() - offset * 60_000);
     return localDate.toISOString().slice(0, 16);
};

export const toIsoDateTime = (value: string) => {
     if (!value) return undefined;
     const date = new Date(value);
     if (Number.isNaN(date.getTime())) return undefined;
     return date.toISOString();
};