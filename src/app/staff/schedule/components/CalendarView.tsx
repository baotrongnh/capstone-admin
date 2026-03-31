"use client"

import type { CalendarProps } from "antd"
import { Calendar } from "antd"
import type { Dayjs } from "dayjs"
import type { CalendarViewProps } from "@/types/appointment"
import { useTranslations } from "next-intl"

export default function CalendarView({
    value,
    appointmentsByDate,
    onPanelChange,
    onSelect,
}: CalendarViewProps) {
    const t = useTranslations("StaffSchedule")
    const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
        if (info.type !== "date") return info.originNode

        const dateKey = current.format("DD-MM-YYYY")
        const appointments = appointmentsByDate.get(dateKey) ?? []
        const appointmentCount = appointments.length
        const pendingCount = appointments.filter(
            (appointment) => appointment.status === "scheduled",
        ).length
        const confirmedCount = appointments.filter(
            (appointment) => appointment.status === "confirmed",
        ).length
        const completedCount = appointments.filter(
            (appointment) => appointment.status === "completed",
        ).length
        const cancelledCount = appointments.filter(
            (appointment) => appointment.status === "cancelled",
        ).length
        const hasAppointment = appointmentCount > 0
        const markerColorClass = pendingCount > 0
            ? "bg-yellow-500"
            : completedCount > 0
                ? "bg-green-500"
                : cancelledCount > 0
                    ? "bg-red-500"
                    : confirmedCount > 0
                        ? "bg-blue-500"
                        : "bg-gray-400"

        if (!hasAppointment) return null

        return (
            <div className="mt-1 flex flex-col items-center gap-1">
                <div className={`mx-auto mt-1 h-0.5 w-6 rounded-full ${markerColorClass}`} />
                <div className="flex flex-wrap gap-1">
                    {pendingCount > 0 && (
                        <div className="rounded bg-yellow-50 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700">
                            {t("calendar.pending", { count: pendingCount })}
                        </div>
                    )}
                    {confirmedCount > 0 && (
                        <div className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                            {t("calendar.confirmed", { count: confirmedCount })}
                        </div>
                    )}
                    {completedCount > 0 && (
                        <div className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-600">
                            {t("calendar.completed", { count: completedCount })}
                        </div>
                    )}
                    {cancelledCount > 0 && (
                        <div className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            {t("calendar.cancelled", { count: cancelledCount })}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 [&_.ant-picker-calendar-date-content]:overflow-hidden">
            <Calendar
                value={value}
                onPanelChange={(nextValue) => onPanelChange(nextValue)}
                cellRender={cellRender}
                onSelect={onSelect}
                fullscreen
            />
        </div>
    )
}
