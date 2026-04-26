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
import { useTranslations } from "next-intl"

export const useAppointments = () => {
    return useQuery({
        queryKey: ["appointments"],
        queryFn: viewingRequestService.getAppointments,
    })
}

export const useConfirmAppointment = () => {
    const t = useTranslations("StaffSchedule.toast")
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
            message.success(t("confirmSuccess"))
        },
        onError: () => {
            message.error(t("confirmError"))
        },
    })
}

export const useDenyAppointment = () => {
    const t = useTranslations("StaffSchedule.toast")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: DenyAppointmentPayload) =>
            viewingRequestService.denyAppointment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            message.success(t("denySuccess"))
        },
        onError: () => {
            message.error(t("denyError"))
        },
    })
}

export const useCancelAppointment = () => {
    const t = useTranslations("StaffSchedule.toast")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: CancelAppointmentPayload) =>
            viewingRequestService.cancelAppointment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            message.success(t("cancelSuccess"))
        },
        onError: () => {
            message.error(t("cancelError"))
        },
    })
}

export const useDoneAppointment = () => {
    const t = useTranslations("StaffSchedule.toast")
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: DoneAppointmentPayload) =>
            viewingRequestService.doneAppointment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] })
            message.success(t("doneSuccess"))
        },
        onError: () => {
            message.error(t("doneError"))
        },
    })
}
