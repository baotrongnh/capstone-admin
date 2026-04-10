"use client"

import { viewingRequestService } from "@/lib/services/viewing-request.service"
import type {
    AssignedAppointmentsResponse,
    CancelAppointmentPayload,
    ConfirmAppointmentPayload,
    DenyAppointmentPayload,
    DoneAppointmentPayload,
} from "@/types/appointment"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { message } from "antd"

export const useAppointments = () => {
    return useQuery({
        queryKey: ["appointments"],
        queryFn: viewingRequestService.getAppointments,
    })
}

export const useConfirmAppointment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: ConfirmAppointmentPayload) =>
            viewingRequestService.confirmAppointment(payload),
        onSuccess: (response, variables) => {
            queryClient.setQueryData(
                ["appointments"],
                (current?: AssignedAppointmentsResponse) => {
                    if (!current?.data) return current

                    const updated = response?.data
                    const nextData = current.data.map((appointment) => {
                        if (appointment.id !== variables.appointmentId) return appointment
                        if (updated) return { ...appointment, ...updated }
                        return { ...appointment, status: "confirmed" }
                    })

                    return { ...current, data: nextData }
                },
            )
            message.success("Appointment confirmed.")
        },
        onError: (error) => {
            message.error(error?.message || "Failed to confirm appointment.")
        },
    })
}

export const useDenyAppointment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: DenyAppointmentPayload) =>
            viewingRequestService.denyAppointment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            message.success("Appointment denied.")
        },
        onError: (error) => {
            message.error(error?.message || "Failed to deny appointment.")
        },
    })
}

export const useCancelAppointment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: CancelAppointmentPayload) =>
            viewingRequestService.cancelAppointment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            message.success("Appointment cancelled.")
        },
        onError: (error) => {
            message.error(error?.message || "Failed to cancel appointment.")
        },
    })
}

export const useDoneAppointment = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: DoneAppointmentPayload) =>
            viewingRequestService.doneAppointment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            message.success("Appointment marked as done.")
        },
        onError: (error) => {
            message.error(error?.message || "Failed to complete appointment.")
        },
    })
}
