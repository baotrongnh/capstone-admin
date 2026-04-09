
"use client"

import { useMemo, useState } from "react"
import dayjs, { type Dayjs } from "dayjs"
import { Alert, Empty } from "antd"
import { useTranslations } from "next-intl"
import CalendarView from "./components/CalendarView"
import AppointmentModal from "./components/AppointmentModal"
import CancelReasonModal from "./components/CancelReasonModal"
import ScheduleSummary from "./components/ScheduleSummary"
import type {
     Appointment,
     ReasonModalMode,
} from "@/types/appointment"
import {
     buildAppointmentsByDate,
     getAppointmentDateTime,
     getAppointmentTime,
     UPCOMING_STATUSES,
} from "@/utils/schedule-utils"
import {
     useAppointments,
     useCancelAppointment,
     useConfirmAppointment,
     useDenyAppointment,
     useDoneAppointment,
} from "@/hooks/query/useViewingRequests"

export default function ScheduleStaff() {
     const t = useTranslations("StaffSchedule")
     const { data, isLoading, isError, error } = useAppointments()
     const { mutateAsync: confirmAppointment, isPending: isConfirming } =
          useConfirmAppointment()
     const { mutateAsync: denyAppointment, isPending: isDenying } =
          useDenyAppointment()
     const { mutateAsync: cancelAppointment, isPending: isCancelling } =
          useCancelAppointment()
     const { mutateAsync: doneAppointment, isPending: isDone } =
          useDoneAppointment()

     const [openDetail, setOpenDetail] = useState(false)
     const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
     const [selectedAppointments, setSelectedAppointments] = useState<
          Appointment[]
     >([])
     const [calendarValue, setCalendarValue] = useState<Dayjs>(dayjs())
     const [upcomingIndex, setUpcomingIndex] = useState(-1)

     const [reasonModalOpen, setReasonModalOpen] = useState(false)
     const [reasonMode, setReasonMode] = useState<ReasonModalMode>("cancel")
     const [pendingAppointment, setPendingAppointment] =
          useState<Appointment | null>(null)

     const appointments = useMemo(() => {
          return data?.data ?? []
     }, [data])

     const appointmentsByDate = useMemo(() => {
          return buildAppointmentsByDate(appointments)
     }, [appointments])

     const upcomingAppointments = useMemo(() => {
          const now = dayjs()
          return appointments
               .filter((appointment) => {
                    if (!UPCOMING_STATUSES.has(appointment.status)) return false
                    return getAppointmentDateTime(appointment).isAfter(now)
               })
               .sort(
                    (a, b) =>
                         getAppointmentDateTime(a).valueOf() -
                         getAppointmentDateTime(b).valueOf(),
               )
     }, [appointments])

     const currentUpcoming =
          upcomingIndex >= 0 ? upcomingAppointments[upcomingIndex] : undefined

     const openDateAppointments = (value: Dayjs) => {
          const dateKey = value.format("DD-MM-YYYY")
          const items = appointmentsByDate.get(dateKey) ?? []
          if (items.length === 0) return

          setCalendarValue(value)
          setSelectedDate(value)
          setSelectedAppointments(items)
          setOpenDetail(true)
     }

     const handleNextUpcoming = () => {
          if (upcomingAppointments.length === 0) return

          const nextIndex = (upcomingIndex + 1) % upcomingAppointments.length
          const nextAppointment = upcomingAppointments[nextIndex]
          const nextDate = getAppointmentDateTime(nextAppointment)

          setUpcomingIndex(nextIndex)
          setCalendarValue(nextDate)
     }

     const handleConfirm = async (appointment: Appointment) => {
          const response = await confirmAppointment({ appointmentId: appointment.id })
          const updated = response?.data
          if (!updated) return

          setSelectedAppointments((items) =>
               items.map((item) =>
                    item.id === appointment.id ? { ...item, ...updated } : item,
               ),
          )
     }

     const openReasonModal = (mode: ReasonModalMode, appointment: Appointment) => {
          setReasonMode(mode)
          setPendingAppointment(appointment)
          setOpenDetail(false)
          setReasonModalOpen(true)
     }

     const handleDeny = (appointment: Appointment) => {
          openReasonModal("deny", appointment)
     }

     const handleCancel = (appointment: Appointment) => {
          openReasonModal("cancel", appointment)
     }

     const handleDone = async (appointment: Appointment) => {
          const response = await doneAppointment({ appointmentId: appointment.id })
          const updated = response?.data
          if (!updated) return

          setSelectedAppointments((items) =>
               items.map((item) =>
                    item.id === appointment.id ? { ...item, ...updated } : item,
               ),
          )
     }

     const handleSubmitReason = async (reason: string) => {
          if (!pendingAppointment) return

          try {
               if (reasonMode === "deny") {
                    const response = await denyAppointment({
                         appointmentId: pendingAppointment.id,
                         reason,
                    })
                    const updated = response?.data
                    if (updated) {
                         setSelectedAppointments((items) =>
                              items.map((item) =>
                                   item.id === pendingAppointment.id
                                        ? { ...item, ...updated }
                                        : item,
                              ),
                         )
                    }
               } else {
                    const response = await cancelAppointment({
                         appointmentId: pendingAppointment.id,
                         reason,
                    })
                    const updated = response?.data
                    if (updated) {
                         setSelectedAppointments((items) =>
                              items.map((item) =>
                                   item.id === pendingAppointment.id
                                        ? { ...item, ...updated }
                                        : item,
                              ),
                         )
                    }
               }
               setReasonModalOpen(false)
               setPendingAppointment(null)
          } catch {
               return
          }
     }

     const selectedDateTitle = selectedDate
          ? selectedDate.format("DD-MM-YYYY")
          : ""

     const isSubmitting = isConfirming || isDenying || isCancelling || isDone

     const hasUpcomingAppointments = appointments.some((appointment) =>
          getAppointmentDateTime(appointment).isAfter(dayjs()),
     )

     return (
          <div className="space-y-4">
               <div>
                    <h2 className="text-2xl font-bold">{t("title")}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                         {t("subtitle")}
                    </p>
               </div>

               <ScheduleSummary
                    upcomingCount={upcomingAppointments.length}
                    currentFocusDate={
                         currentUpcoming
                              ? getAppointmentDateTime(currentUpcoming).format(
                                   "DD-MM-YYYY",
                              )
                              : undefined
                    }
                    currentFocusTime={
                         currentUpcoming
                              ? getAppointmentTime(currentUpcoming)
                              : undefined
                    }
                    onNext={handleNextUpcoming}
               />

               {isError && (
                    <Alert
                         type="error"
                         showIcon
                         message={t("errorTitle")}
                         description={(error as Error)?.message || t("errorDescription")}
                    />
               )}

               <CalendarView
                    value={calendarValue}
                    appointmentsByDate={appointmentsByDate}
                    onPanelChange={setCalendarValue}
                    onSelect={openDateAppointments}
               />

               {!isLoading && appointments.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white py-12">
                         <Empty description={t("empty")} />
                    </div>
               )}

               {!isLoading && appointments.length > 0 && !hasUpcomingAppointments && (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
                         {t("pastNotice")}
                    </div>
               )}

               <AppointmentModal
                    open={openDetail}
                    selectedDateTitle={selectedDateTitle}
                    appointments={selectedAppointments}
                    onClose={() => setOpenDetail(false)}
                    onConfirm={handleConfirm}
                    onDeny={handleDeny}
                    onCancel={handleCancel}
                    onDone={handleDone}
                    isSubmitting={isSubmitting}
               />

               <CancelReasonModal
                    open={reasonModalOpen}
                    mode={reasonMode}
                    onClose={() => setReasonModalOpen(false)}
                    onSubmit={handleSubmitReason}
                    isSubmitting={isDenying || isCancelling}
               />
          </div>
     )
}
