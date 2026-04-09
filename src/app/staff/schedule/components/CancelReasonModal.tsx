"use client"

import { Modal, Select, Input, message } from "antd"
import { useMemo, useState } from "react"
import type { CancelReasonModalProps } from "@/types/appointment"
import { buildCancelReason } from "@/utils/schedule-utils"
import { useTranslations } from "next-intl"

export default function CancelReasonModal({
    open,
    mode,
    onClose,
    onSubmit,
    isSubmitting,
}: CancelReasonModalProps) {
    const t = useTranslations("StaffSchedule")
    const [title, setTitle] = useState<string>("")
    const [reason, setReason] = useState<string>("")

    const titleOptions = useMemo(
        () => [
            t("reasonOptions.staffUnavailable"),
            t("reasonOptions.emergencyMaintenance"),
            t("reasonOptions.schedulingConflict"),
            t("reasonOptions.other"),
        ],
        [t],
    )

    const modalTitle = useMemo(() => {
        return mode === "deny"
            ? t("reasonModal.denyTitle")
            : t("reasonModal.cancelTitle")
    }, [mode, t])

    const handleAfterClose = () => {
        setTitle("")
        setReason("")
    }

    const handleSubmit = () => {
        if (!title.trim()) {
            message.error(t("reasonModal.titleRequired"))
            return
        }

        const combinedReason = buildCancelReason(title.trim(), reason)
        onSubmit(combinedReason)
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okText={
                mode === "deny"
                    ? t("reasonModal.submitDeny")
                    : t("reasonModal.submitCancel")
            }
            confirmLoading={isSubmitting}
            title={modalTitle}
            afterClose={handleAfterClose}
        >
            <div className="space-y-4">
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                        {t("reasonModal.titleLabel")}
                    </p>
                    <Select
                        placeholder={t("reasonModal.titlePlaceholder")}
                        value={title || undefined}
                        onChange={(value) => setTitle(value)}
                        style={{ width: "100%" }}
                        options={titleOptions.map((option) => ({
                            value: option,
                            label: option,
                        }))}
                    />
                </div>
                <div>
                    <p className="mb-2 text-sm font-medium text-gray-700">
                        {t("reasonModal.detailLabel")}
                    </p>
                    <Input.TextArea
                        rows={4}
                        placeholder={t("reasonModal.detailPlaceholder")}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                    />
                </div>
            </div>
        </Modal>
    )
}
