import type {
    AppointmentActionResponse,
    AssignedAppointmentsResponse,
    CancelAppointmentPayload,
    ConfirmAppointmentPayload,
    DenyAppointmentPayload,
    DoneAppointmentPayload,
} from "@/types/appointment"
import { apiClient } from "@/lib/apis/client"
import { endpoints } from "@/lib/apis/endpoints"

export const viewingRequestService = {
    getAppointments: async (): Promise<AssignedAppointmentsResponse> => {
        const { data } = await apiClient.get(`${endpoints.viewRequest}/my-assigned`)
        return data
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
