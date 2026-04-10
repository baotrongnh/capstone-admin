"use client"

import { Button } from "@/components/ui/button"
import type { AppointmentActionsProps } from "@/types/appointment"
import dayjs from "dayjs"
import { getAppointmentDateTime } from "@/utils/schedule-utils"
import { useTranslations } from "next-intl"

export default function AppointmentActions({
    appointment,
    onConfirm,
    onDeny,
    onCancel,
    onDone,
    isSubmitting,
}: AppointmentActionsProps) {
    const t = useTranslations("StaffSchedule")
    const now = dayjs()
    const appointmentTime = getAppointmentDateTime(appointment)
    const isPast = appointmentTime.isBefore(now)

    const showConfirmDeny = appointment.status === "scheduled"
    const showCancel = appointment.status === "confirmed"
    const showDone = appointment.status === "confirmed" && isPast

    if (!showConfirmDeny && !showCancel && !showDone) return null

    return (
        <div className="mt-3 flex flex-wrap justify-end gap-2">
            {showConfirmDeny && (
                <>
                    <Button
                        size="sm"
                        onClick={() => onConfirm(appointment)}
                        disabled={isSubmitting}
                    >
                        {t("actions.confirm")}
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeny(appointment)}
                        disabled={isSubmitting}
                    >
                        {t("actions.deny")}
                    </Button>
                </>
            )}

            {showCancel && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancel(appointment)}
                    disabled={isSubmitting}
                >
                    {t("actions.cancel")}
                </Button>
            )}

            {showDone && (
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onDone(appointment)}
                    disabled={isSubmitting}
                >
                    {t("actions.done")}
                </Button>
            )}
        </div>
    )
}
