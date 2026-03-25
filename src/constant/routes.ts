export const ROUTE_STAFF = {
     INQUIRY: '/staff/inquiry',
     SCHEDULE: '/staff/schedule',
     VERIFY_USER_INFORMATION: '/staff/verify-user-information',
     CHAT: '/staff/chat',
     VERIFY: '/staff/verify',
     CONTRACT: '/staff/contracts'
} as const

export const ROUTE_ADMIN = {
     DASHBOARD: '/admin/dashboard',
     SCHEDULE: '/staff/schedule',
     VERIFY_USER_INFORMATION: '/staff/verify-user-information',
} as const

export const ROUTE_OPERATOR = {
     APARTMENT: '/operator/apartments',
     STAFF_MANAGER: '/operator/staff-manager',
     REQUEST_PARTNER: '/operator/request-partner',
     IOT_MANAGER: '/operator/iot-manager'
}