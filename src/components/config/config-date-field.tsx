"use client"

import { CalendarIcon } from "lucide-react"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { parseDateValue, toDisplayDate, toInputDate } from "@/utils/date-utils"

export function ConfigDateField({ field }: { field: { label: string; value: string; onChange: (value: string) => void } }) {
     return (
          <div className="space-y-1">
               <p className="text-xs text-muted-foreground">{field.label}</p>
               <Popover>
                    <PopoverTrigger asChild>
                         <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 size-4" />
                              {toDisplayDate(field.value)}
                         </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                              mode="single"
                              locale={vi}
                              selected={parseDateValue(field.value) ?? undefined}
                              onSelect={(date) => {
                                   if (!date) return
                                   const selectedDate = new Date(date)
                                   selectedDate.setHours(0, 0, 0, 0)
                                   field.onChange(toInputDate(selectedDate))
                              }}
                              initialFocus
                         />
                    </PopoverContent>
               </Popover>
          </div>
     )
}