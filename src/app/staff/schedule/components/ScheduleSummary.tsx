"use client"

import type { ScheduleSummaryProps } from "@/types/appointment"
import { RightOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useTranslations } from "next-intl"

export default function ScheduleSummary({
    upcomingCount,
    currentFocusDate,
    currentFocusTime,
    onNext,
}: ScheduleSummaryProps) {
    const t = useTranslations("StaffSchedule")

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
            <div>
                <p className="text-sm text-blue-700">
                    {t("summary.upcomingTotal", { count: upcomingCount })}
                </p>
                {typeof currentFocusDate === "string" &&
                    typeof currentFocusTime === "string" && (
                        <p className="text-xs text-blue-600">
                            {t("summary.currentFocus", {
                                date: currentFocusDate,
                                time: currentFocusTime,
                            })}
                        </p>
                    )}
            </div>

            <Button
                type="primary"
                shape="circle"
                icon={<RightOutlined />}
                onClick={onNext}
                disabled={upcomingCount === 0}
                aria-label={t("summary.nextAriaLabel")}
            />
        </div>
    )
}
