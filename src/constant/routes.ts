export const ROUTE_STAFF = {
  INQUIRY: "/staff/inquiry",
  SCHEDULE: "/staff/schedule",
  MAINTENANCE: "/staff/maintenance",
  VERIFY_USER_INFORMATION: "/staff/verify-user-information",
  CHAT: "/staff/chat",
  REQUEST: "/staff/request",
  CONTRACT: "/staff/contracts",
  PAYOUTS: "/staff/payouts",
} as const;

export const ROUTE_ADMIN = {
  DASHBOARD: "/admin/dashboard",
  REVENUES: "/admin/revenues",
  INVOICES: "/admin/invoices",
  IOT_MANAGER: "/admin/iot-manager",
  UTILITY_RATES: "/admin/utility-rates",
  UTILITY_RATES_APARTMENTS: "/admin/utility-rates/apartments",
  ACTIVITY_LOGS: "/admin/activity-logs",
  CONFIG: "/admin/config",
  USER: "/admin/user",
  SCHEDULE: "/staff/schedule",
  VERIFY_USER_INFORMATION: "/staff/verify-user-information",
} as const;

export const ROUTE_OPERATOR = {
  APARTMENT: "/operator/apartments",
  AMENITY: "/operator/amenities",
  STAFF_MANAGER: "/operator/staff-manager",
  REQUEST_PARTNER: "/operator/request",
  IOT_MANAGER: "/operator/iot-manager",
};

export type BackofficeRole = "admin" | "operator" | "staff";

export const ROUTE_ACCOUNT = "/account";

const DEFAULT_ROUTE_BY_ROLE: Record<BackofficeRole, string> = {
  admin: ROUTE_ADMIN.DASHBOARD,
  operator: ROUTE_OPERATOR.APARTMENT,
  staff: ROUTE_STAFF.SCHEDULE,
};

export const getDefaultRouteByRole = (role?: string | null) => {
  if (!role) {
    return null;
  }

  if (role in DEFAULT_ROUTE_BY_ROLE) {
    return DEFAULT_ROUTE_BY_ROLE[role as BackofficeRole];
  }

  return null;
};
