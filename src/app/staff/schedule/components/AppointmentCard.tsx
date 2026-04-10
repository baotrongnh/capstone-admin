"use client"

import { Tag } from "antd"
import type { AppointmentCardProps } from "@/types/appointment"
import {
    STATUS_COLORS,
    getAppointmentTime,
    toSafeString,
} from "@/utils/schedule-utils"
import AppointmentActions from "./AppointmentActions"
import { useTranslations } from "next-intl"
import { useApartment } from "@/hooks/query/useApartments"
import { useFullAddress } from "@/hooks/query/useAddress"

export default function AppointmentCard({
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

    const cancellationReason =
        "cancellationReason" in appointment &&
            typeof appointment.cancellationReason === "string"
            ? appointment.cancellationReason
            : null

    const noteValue = toSafeString(
        cancellationReason || appointment.staffNotes || appointment.guestNotes,
    )

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
                {t("fields.note")}: {noteValue}
            </p>

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