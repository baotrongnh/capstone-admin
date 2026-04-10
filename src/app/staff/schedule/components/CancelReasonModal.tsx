"use client"

import { Modal, Select, Input, message } from "antd"
import { useMemo, useState } from "react"
import type { CancelReasonModalProps } from "@/types/appointment"
import { buildCancelNote } from "@/utils/schedule-utils"
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
    const [note, setNote] = useState<string>("")

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
        setNote("")
    }

    const handleSubmit = () => {
        if (!title.trim()) {
            message.error(t("reasonModal.titleRequired"))
            return
        }

        const combinedNote = buildCancelNote(title.trim(), note)
        onSubmit(combinedNote)
    }

    return (
        <Modal
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okButtonProps={{ danger: true }}
            cancelText={t("actions.cancel")}
            okText={
                mode === "deny"
                    ? t("reasonModal.submitDeny")
                    : t("reasonModal.submitCancel")
            }
            confirmLoading={isSubmitting}
            title={modalTitle}
            afterClose={handleAfterClose}
            footer={(_, { OkBtn, CancelBtn }) => (
                <div className="flex justify-end gap-2">
                    <CancelBtn />
                    <OkBtn />
                </div>
            )}
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
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                    />
                </div>
            </div>
        </Modal>
    )
}
