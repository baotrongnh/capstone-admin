import type {
    Appointment,
    AppointmentActionResponse,
    AssignedAppointmentsResponse,
    CancelAppointmentPayload,
    ConfirmAppointmentPayload,
    DenyAppointmentPayload,
    DoneAppointmentPayload,
} from "@/types/appointment"
import { apiClient } from "@/lib/apis/client"
import { endpoints } from "@/lib/apis/endpoints"
import type { paths } from "@/types/api"

type MyViewingRequestsResponse =
    paths["/api/v1/viewing-requests/my"]["get"]["responses"]["200"]["content"]["application/json"]

type MyViewingRequestItem = NonNullable<MyViewingRequestsResponse["data"]>[number]

const normalizeMyViewingRequest = (
    appointment: MyViewingRequestItem,
): Appointment => {
    const cancellationReason =
        "cancellationReason" in appointment &&
            typeof appointment.cancellationReason === "string" &&
            appointment.cancellationReason.trim().length > 0
            ? appointment.cancellationReason
            : null

    return {
        id: appointment.appointmentId,
        apartmentId: appointment.apartment.id,
        assignedStaffId: appointment.assignedStaff.id,
        appointmentDate: appointment.appointmentAt,
        appointmentTime: appointment.appointmentAt,
        durationMinutes: appointment.durationMinutes,
        meetingLocation: appointment.apartment.streetAddress ?? null,
        type: "physical_viewing",
        status: appointment.status,
        guestNotes: appointment.note ?? null,
        staffNotes: cancellationReason,
        outcome: null,
        followupRequired: false,
        createdAt: appointment.createdAt,
        updatedAt: appointment.createdAt,
    }
}

export const viewingRequestService = {
    getAppointments: async (): Promise<AssignedAppointmentsResponse> => {
        const { data } = await apiClient.get<MyViewingRequestsResponse>(
            `${endpoints.viewRequest}/my`,
        )

        return {
            ...data,
            data: (data.data ?? []).map(normalizeMyViewingRequest),
        }
    },

    confirmAppointment: async (
        payload: ConfirmAppointmentPayload,
    ): Promise<AppointmentActionResponse> => {
        const { data } = await apiClient.patch(
            `${endpoints.viewRequest}/staff/accept`,
            payload,
        )
        return data
    },

    denyAppointment: async (
        payload: DenyAppointmentPayload,
    ): Promise<AppointmentActionResponse> => {
        const { data } = await apiClient.patch(
            `${endpoints.viewRequest}/staff/deny`,
            payload,
        )
        return data
    },

    cancelAppointment: async (
        payload: CancelAppointmentPayload,
    ): Promise<AppointmentActionResponse> => {
        const { data } = await apiClient.patch(
            `${endpoints.viewRequest}/appointments/${payload.appointmentId}/cancel`,
            { note: payload.note },
        )
        return data
    },

    doneAppointment: async (
        payload: DoneAppointmentPayload,
    ): Promise<AppointmentActionResponse> => {
        const { data } = await apiClient.patch(
            `${endpoints.viewRequest}/appointments/${payload.appointmentId}/done`,
        )
        return data
    },
}
