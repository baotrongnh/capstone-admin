"use client"

import { Modal } from "antd"
import type { AppointmentModalProps } from "@/types/appointment"
import { useTranslations } from "next-intl"
import AppointmentCard from "./AppointmentCard"

export default function AppointmentModal({
    open,
    selectedDateTitle,
    appointments,
    onClose,
    onConfirm,
    onDeny,
    onCancel,
    onDone,
    isSubmitting,
}: AppointmentModalProps) {
    const t = useTranslations("StaffSchedule")
    const statusLabelMap: Record<string, string> = {
        scheduled: t("status.scheduled"),
        confirmed: t("status.confirmed"),
        completed: t("status.completed"),
        cancelled: t("status.cancelled"),
        no_show: t("status.noShow"),
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title={t("modal.title", { date: selectedDateTitle })}
        >
            <div className="space-y-3">
                {appointments.map((appointment) => (
                    <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onConfirm={onConfirm}
                        onDeny={onDeny}
                        onCancel={onCancel}
                        onDone={onDone}
                        isSubmitting={isSubmitting}
                        statusLabelMap={statusLabelMap}
                    />
                ))}
            </div>
        </Modal>
    )
}
