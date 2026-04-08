import type { Dayjs } from "dayjs"
import type { paths } from "@/types/api"

export type AssignedAppointmentsResponse =
    paths["/api/v1/viewing-requests/my-assigned"]["get"]["responses"]["200"]["content"]["application/json"]

export type Appointment = NonNullable<AssignedAppointmentsResponse["data"]>[number]

export type AppointmentApartment = {
    id: string
    apartmentNumber?: string | null
    wardCode?: number | null
}

export type AppointmentWithApartment = Appointment & {
    apartment?: AppointmentApartment
}

export type AppointmentStatus =
    NonNullable<paths["/api/v1/viewing-requests/my"]["get"]["parameters"]["query"]>["status"]

export type ConfirmAppointmentPayload =
    paths["/api/v1/viewing-requests/staff/accept"]["patch"]["requestBody"]["content"]["application/json"]

export type DenyAppointmentPayload =
    paths["/api/v1/viewing-requests/staff/deny"]["patch"]["requestBody"]["content"]["application/json"]

export type AppointmentActionResponse =
    paths["/api/v1/viewing-requests/staff/accept"]["patch"]["responses"]["200"]["content"]["application/json"]

export type CancelAppointmentPayload = {
    appointmentId: string
    note?: string
}

export type DoneAppointmentPayload = {
    appointmentId: string
}

export type CalendarAppointments = Map<string, Appointment[]>

export type CalendarViewProps = {
    value: Dayjs
    appointmentsByDate: CalendarAppointments
    onPanelChange: (value: Dayjs) => void
    onSelect: (value: Dayjs) => void
}

export type AppointmentModalProps = {
    open: boolean
    selectedDateTitle: string
    appointments: AppointmentWithApartment[]
    onClose: () => void
    onConfirm: (appointment: Appointment) => void
    onDeny: (appointment: Appointment) => void
    onCancel: (appointment: Appointment) => void
    onDone: (appointment: Appointment) => void
    isSubmitting?: boolean
}

export type AppointmentCardProps = {
    appointment: AppointmentWithApartment
    onConfirm: AppointmentModalProps["onConfirm"]
    onDeny: AppointmentModalProps["onDeny"]
    onCancel: AppointmentModalProps["onCancel"]
    onDone: AppointmentModalProps["onDone"]
    isSubmitting?: AppointmentModalProps["isSubmitting"]
    statusLabelMap: Record<string, string>
}

export type AppointmentActionsProps = {
    appointment: Appointment
    onConfirm: (appointment: Appointment) => void
    onDeny: (appointment: Appointment) => void
    onCancel: (appointment: Appointment) => void
    onDone: (appointment: Appointment) => void
    isSubmitting?: boolean
}

export type ReasonModalMode = "cancel" | "deny"

export type CancelReasonModalProps = {
    open: boolean
    mode: ReasonModalMode
    onClose: () => void
    onSubmit: (note: string) => void
    isSubmitting?: boolean
}

export type ScheduleSummaryProps = {
    upcomingCount: number
    currentFocusDate?: string
    currentFocusTime?: string
    onNext: () => void
}
