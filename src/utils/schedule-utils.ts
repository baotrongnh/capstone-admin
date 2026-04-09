import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import type { Appointment } from "@/types/appointment"

dayjs.extend(utc)

export const STATUS_COLORS: Record<string, string> = {
    scheduled: "gold",
    confirmed: "blue",
    completed: "green",
    cancelled: "red",
    no_show: "volcano",
}

export const UPCOMING_STATUSES = new Set(["scheduled", "confirmed"])

export const toVnDateKey = (iso: string) =>
    dayjs.utc(iso).utcOffset(7).format("DD-MM-YYYY")

export const toVnTime = (iso: string) =>
    dayjs.utc(iso).utcOffset(7).format("HH:mm")

export const toVnDateTime = (iso: string) => dayjs.utc(iso).utcOffset(7)

export const toSafeString = (value: unknown, fallback = "-") => {
    return typeof value === "string" && value.trim().length > 0
        ? value
        : fallback
}

export const resolveAppointmentIso = (appointment: Appointment) => {
    return (
        appointment.appointmentTime ||
        appointment.appointmentDate ||
        appointment.createdAt
    )
}

export const getAppointmentDateKey = (appointment: Appointment) => {
    return toVnDateKey(resolveAppointmentIso(appointment))
}

export const getAppointmentTime = (appointment: Appointment) => {
    return toVnTime(resolveAppointmentIso(appointment))
}

export const getAppointmentDateTime = (appointment: Appointment) => {
    return toVnDateTime(resolveAppointmentIso(appointment))
}

export const buildAppointmentsByDate = (appointments: Appointment[]) => {
    const grouped = new Map<string, Appointment[]>()

    appointments.forEach((appointment) => {
        const dateKey = getAppointmentDateKey(appointment)
        const existing = grouped.get(dateKey) ?? []
        existing.push(appointment)
        grouped.set(dateKey, existing)
    })

    grouped.forEach((items, key) => {
        grouped.set(
            key,
            [...items].sort(
                (a, b) =>
                    getAppointmentDateTime(a).valueOf() -
                    getAppointmentDateTime(b).valueOf(),
            ),
        )
    })

    return grouped
}

export const buildCancelReason = (title: string, reason?: string) => {
    const trimmed = reason?.trim()
    if (!trimmed) return title
    return `${title}: ${trimmed}`
}
