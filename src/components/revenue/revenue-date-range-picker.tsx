"use client"

import { useMemo, useState } from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { parseInputDate, toDisplayDate, toInputDate } from "@/utils/date-utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { RevenueDateFilter } from "@/types/revenue"

export type RevenueDateRangeValue = Required<RevenueDateFilter>

type RevenueDateRangePickerProps = {
     value: RevenueDateRangeValue
     onApply: (next: RevenueDateRangeValue) => void
     onReset: () => void
}

export function RevenueDateRangePicker({ value, onApply, onReset }: RevenueDateRangePickerProps) {
     const [open, setOpen] = useState(false)
     const [draft, setDraft] = useState<DateRange | undefined>({
          from: parseInputDate(value.from),
          to: parseInputDate(value.to),
     })
     const [error, setError] = useState("")

     const label = useMemo(
          () => `${toDisplayDate(value.from)} - ${toDisplayDate(value.to)}`,
          [value.from, value.to],
     )

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
                         <p className="text-sm font-medium text-foreground">Khoảng thời gian</p>
                         <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
                    </div>

                    <Popover open={open} onOpenChange={setOpen}>
                         <PopoverTrigger asChild>
                              <Button variant="outline" className="justify-start text-left font-normal sm:min-w-72">
                                   <CalendarIcon className="size-4" />
                                   Chọn khoảng ngày
                              </Button>
                         </PopoverTrigger>

                         <PopoverContent className="w-auto p-0" align="end">
                              <Calendar
                                   mode="range"
                                   selected={draft}
                                   onSelect={setDraft}
                                   numberOfMonths={2}
                              />

                              <div className="flex items-center justify-between border-t px-3 py-2">
                                   <Button variant="ghost" size="sm" onClick={reset}>Mặc định tháng này</Button>
                                   <Button size="sm" onClick={apply}>Áp dụng</Button>
                              </div>
                         </PopoverContent>
                    </Popover>
               </div>

               {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
          </div>
     )
}
