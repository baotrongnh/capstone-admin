"use client"

import { Modal, Tag } from "antd"
import type {
    AppointmentModalProps,
    AppointmentWithApartment,
} from "@/types/appointment"
import {
    STATUS_COLORS,
    getAppointmentTime,
    toSafeString,
} from "@/utils/schedule-utils"
import AppointmentActions from "./AppointmentActions"
import { useTranslations } from "next-intl"
import { useApartment } from "@/hooks/query/useApartments"
import { useFullAddress } from "@/hooks/query/useAddress"

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

type AppointmentCardProps = {
    appointment: AppointmentWithApartment
    onConfirm: AppointmentModalProps["onConfirm"]
    onDeny: AppointmentModalProps["onDeny"]
    onCancel: AppointmentModalProps["onCancel"]
    onDone: AppointmentModalProps["onDone"]
    isSubmitting?: AppointmentModalProps["isSubmitting"]
    statusLabelMap: Record<string, string>
}

function AppointmentCard({
    appointment,
    onConfirm,
    onDeny,
    onCancel,
    onDone,
    isSubmitting,
    statusLabelMap,
}: AppointmentCardProps) {
    const t = useTranslations("StaffSchedule")
    const apartmentId = appointment.apartment?.id || appointment.apartmentId
    const { data: apartmentResponse } = useApartment(apartmentId || "")
    const apartmentDetail = apartmentResponse?.data
    const fullAddress = useFullAddress(
        apartmentDetail?.streetAddress || undefined,
        apartmentDetail?.provinceCode || undefined,
        apartmentDetail?.wardCode || undefined,
    )
    const showStaffNotes =
        appointment.status === "completed" || appointment.status === "cancelled"

    const apartmentLabel = [
        toSafeString(apartmentDetail?.buildingName),
        toSafeString(
            apartmentDetail?.apartmentNumber || appointment.apartment?.apartmentNumber,
        ),
    ]
        .filter((value) => value && value !== "-")
        .join(" - ")

    const locationLabel = fullAddress || toSafeString(appointment.meetingLocation)

    return (
        <div className="rounded-lg border border-gray-200 p-3">
            <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-gray-900">
                    {t("appointment.label", { id: appointment.id })}
                </p>
                <Tag color={STATUS_COLORS[appointment.status] || "default"}>
                    {statusLabelMap[appointment.status] || appointment.status}
                </Tag>
            </div>

            <p className="text-sm text-gray-600">
                {t("fields.apartment")}: {apartmentLabel || "-"}
            </p>
            <p className="text-sm text-gray-600">
                {t("fields.time")}: {getAppointmentTime(appointment)} ({appointment.durationMinutes} {t("fields.minutes")})
            </p>
            <p className="text-sm text-gray-600">
                {t("fields.location")}: {locationLabel}
            </p>
            <p className="text-sm text-gray-600">
                {t("fields.guestNotes")}: {toSafeString(appointment.guestNotes)}
            </p>
            {showStaffNotes && (
                <p className="text-sm text-gray-600">
                    {t("fields.staffNotes")}: {toSafeString(appointment.staffNotes)}
                </p>
            )}

            <AppointmentActions
                appointment={appointment}
                onConfirm={onConfirm}
                onDeny={onDeny}
                onCancel={onCancel}
                onDone={onDone}
                isSubmitting={isSubmitting}
            />
        </div>
    )
}
