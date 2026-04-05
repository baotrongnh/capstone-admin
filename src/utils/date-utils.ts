import type { RevenueDateFilter } from "@/types/revenue"

export const toIso = (date: Date) => date.toISOString()

export const parseDateValue = (value?: string) => {
     if (!value) {
          return null
     }

     if (value.includes("T")) {
          const date = new Date(value)
          return Number.isNaN(date.getTime()) ? null : date
     }

     const date = new Date(`${value}T00:00:00`)
     return Number.isNaN(date.getTime()) ? null : date
}

export const parseInputDate = (value: string) => {
     const [year, month, day] = value.split("-").map(Number)
     return new Date(year, (month || 1) - 1, day || 1)
}

export const toInputDate = (date: Date) => {
     const year = date.getFullYear()
     const month = String(date.getMonth() + 1).padStart(2, "0")
     const day = String(date.getDate()).padStart(2, "0")
     return `${year}-${month}-${day}`
}

export const toDisplayDate = (value: string) =>
     parseInputDate(value).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
     })

export const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
export const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
export const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

export const quarterStartMonth = (date: Date) => Math.floor(date.getMonth() / 3) * 3
export const startOfQuarter = (date: Date) => new Date(date.getFullYear(), quarterStartMonth(date), 1, 0, 0, 0, 0)
export const endOfQuarter = (date: Date) => new Date(date.getFullYear(), quarterStartMonth(date) + 3, 0, 23, 59, 59, 999)

export const startOfYear = (date: Date) => new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0)
export const endOfYear = (date: Date) => new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)

export const maxDate = (a: Date, b: Date) => (a.getTime() >= b.getTime() ? a : b)
export const minDate = (a: Date, b: Date) => (a.getTime() <= b.getTime() ? a : b)

export const normalizeDateFilter = (filter?: RevenueDateFilter) => {
     const fromDate = parseDateValue(filter?.from)
     const toDate = parseDateValue(filter?.to)

     if (!fromDate || !toDate) {
          return null
     }

     const from = startOfDay(fromDate)
     const to = endOfDay(toDate)

     if (from.getTime() > to.getTime()) {
          return null
     }

     return { from, to }
}

export const formatDayLabel = (date: Date) =>
     date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
     })

export const formatMonthLabel = (date: Date) => {
     const month = String(date.getMonth() + 1).padStart(2, "0")
     return `${month}/${date.getFullYear()}`
}

export const formatQuarterLabel = (date: Date) => {
     const quarter = Math.floor(date.getMonth() / 3) + 1
     return `Q${quarter}/${date.getFullYear()}`
}

export const formatYearLabel = (date: Date) => String(date.getFullYear())

export const toStartOfDayIso = (value: string) => toIso(startOfDay(parseInputDate(value)))
export const toEndOfDayIso = (value: string) => toIso(endOfDay(parseInputDate(value)))

export const isFullMonthRange = (from: string, to: string) => {
     const fromDate = parseInputDate(from)
     const toDate = parseInputDate(to)

     const isSameMonth =
          fromDate.getFullYear() === toDate.getFullYear() &&
          fromDate.getMonth() === toDate.getMonth()

     if (!isSameMonth) {
          return false
     }

     const lastDayOfMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0).getDate()
     return fromDate.getDate() === 1 && toDate.getDate() === lastDayOfMonth
}
