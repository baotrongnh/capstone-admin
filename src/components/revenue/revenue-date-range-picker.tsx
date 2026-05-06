"use client"

import { useMemo, useState } from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RevenueDateFilter } from "@/types/revenue"
import { parseInputDate, toDisplayDate, toInputDate } from "@/utils/date-utils"
import {
     REVENUE_FILTER_MODE_LABEL,
     REVENUE_FILTER_MODE_ORDER,
     type RevenueFilterMode,
} from "@/utils/revenue-filter"

export type RevenueDateRangeValue = Required<RevenueDateFilter>
export type { RevenueFilterMode }

type RevenueDateRangePickerProps = {
     value: RevenueDateRangeValue
     onApply: (next: RevenueDateRangeValue) => void
     onReset: () => void
     mode?: RevenueFilterMode
     onModeChange?: (mode: RevenueFilterMode) => void
}

export function RevenueDateRangePicker({
     value,
     onApply,
     onReset,
     mode,
     onModeChange,
}: RevenueDateRangePickerProps) {
     const [open, setOpen] = useState(false)
     const [draft, setDraft] = useState<DateRange | undefined>({
          from: parseInputDate(value.from),
          to: parseInputDate(value.to),
     })
     const [error, setError] = useState("")

     const dateLabel = useMemo(
          () => `${toDisplayDate(value.from)} - ${toDisplayDate(value.to)}`,
          [value.from, value.to],
     )
     const showDateRange = !mode || mode === "custom"
     const label = showDateRange ? dateLabel : `${REVENUE_FILTER_MODE_LABEL[mode]} hiện tại`

     const apply = () => {
          if (!draft?.from || !draft?.to) {
               setError("Vui lòng chọn đủ ngày bắt đầu và kết thúc")
               return
          }

          const from = toInputDate(draft.from)
          const to = toInputDate(draft.to)

          if (from > to) {
               setError("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc")
               return
          }

          setError("")
          onApply({ from, to })
          setOpen(false)
     }

     const reset = () => {
          setError("")
          onReset()
          setOpen(false)
     }

     return (
          <div className="rounded-xl border border-border/70 bg-card p-4">
               <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                         <p className="text-sm font-medium text-foreground">Bộ lọc</p>
                         <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                         {mode && onModeChange ? (
                              <Tabs value={mode} onValueChange={(value) => onModeChange(value as RevenueFilterMode)}>
                                   <TabsList className="grid w-full grid-cols-5 sm:w-auto">
                                        {REVENUE_FILTER_MODE_ORDER.map((item) => (
                                             <TabsTrigger key={item} value={item}>
                                                  {REVENUE_FILTER_MODE_LABEL[item]}
                                             </TabsTrigger>
                                        ))}
                                   </TabsList>
                              </Tabs>
                         ) : null}

                         {showDateRange ? (
                              <Popover open={open} onOpenChange={setOpen}>
                                   <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal sm:min-w-72">
                                             <CalendarIcon className="size-4" />
                                             Chọn khoảng ngày
                                        </Button>
                                   </PopoverTrigger>

                                   <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar mode="range" selected={draft} onSelect={setDraft} numberOfMonths={2} />

                                        <div className="flex items-center justify-between border-t px-3 py-2">
                                             <Button variant="ghost" size="sm" onClick={reset}>Mặc định tháng này</Button>
                                             <Button size="sm" onClick={apply}>Áp dụng</Button>
                                        </div>
                                   </PopoverContent>
                              </Popover>
                         ) : null}
                    </div>
               </div>

               {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
     )
}
