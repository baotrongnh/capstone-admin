"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useGlobalUtilityRates, useUpdateGlobalUtilityRates } from "@/hooks/query/useIotDevices"
import type { UpdateGlobalUtilityRatesRequest } from "@/types/iot"
import { formatDateTime, formatVNDInput, parseVNDInput } from "@/utils/format"

type RateForm = {
     electricity: string
     water: string
     notes: string
}


export function UtilityRateManagerCard() {
     const { data, isError, isFetching, refetch } = useGlobalUtilityRates()
     const updateRates = useUpdateGlobalUtilityRates()
     const rates = data?.data
     const [draft, setDraft] = useState<Partial<RateForm>>({})

     const savedForm: RateForm = {
          electricity: formatVNDInput(rates?.electricity?.ratePerUnit),
          water: formatVNDInput(rates?.water?.ratePerUnit),
          notes: rates?.notes || "",
     }

     const form = {
          electricity: draft.electricity ?? savedForm.electricity,
          water: draft.water ?? savedForm.water,
          notes: draft.notes ?? savedForm.notes,
     }

     const electricity = parseVNDInput(form.electricity)
     const water = parseVNDInput(form.water)
     const payload: UpdateGlobalUtilityRatesRequest = {}

     if (form.electricity !== savedForm.electricity && electricity !== undefined) {
          payload.electricityRatePerUnit = electricity
     }

     if (form.water !== savedForm.water && water !== undefined) {
          payload.waterRatePerUnit = water
     }

     if (form.notes.trim() !== savedForm.notes.trim()) {
          payload.notes = form.notes.trim()
     }

     const isSaving = updateRates.isPending
     const canSubmit = !isSaving && Object.keys(payload).length > 0

     return (
          <Card className="border-border/70">
               <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle className="text-base">Giá điện/nước mặc định</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
                         {isFetching ? "Đang tải..." : "Làm mới"}
                    </Button>
               </CardHeader>

               <CardContent className="space-y-4">
                    {isError ? (
                         <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                              <AlertCircle className="h-4 w-4" />
                              Không thể tải giá mặc định.
                         </div>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                         <div className="space-y-2">
                              <Label htmlFor="global-electricity-rate">Giá điện (kWh)</Label>
                              <Input
                                   id="global-electricity-rate"
                                   value={form.electricity}
                                   onChange={(event) => setDraft((current) => ({ ...current, electricity: formatVNDInput(event.target.value) }))}
                                   inputMode="numeric"
                                   placeholder="3,500"
                                   disabled={isSaving}
                              />
                         </div>

                         <div className="space-y-2">
                              <Label htmlFor="global-water-rate">Giá nước (m3)</Label>
                              <Input
                                   id="global-water-rate"
                                   value={form.water}
                                   onChange={(event) => setDraft((current) => ({ ...current, water: formatVNDInput(event.target.value) }))}
                                   inputMode="numeric"
                                   placeholder="15,000"
                                   disabled={isSaving}
                              />
                         </div>
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="global-rate-notes">Ghi chú</Label>
                         <Textarea
                              id="global-rate-notes"
                              value={form.notes}
                              onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                              placeholder="Ghi chú"
                              disabled={isSaving}
                         />
                    </div>

                    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                         <p className="text-xs text-muted-foreground">Cập nhật gần nhất: {formatDateTime(rates?.updatedAt)}</p>
                         <Button onClick={() => canSubmit && updateRates.mutate(payload, { onSuccess: () => setDraft({}) })} disabled={!canSubmit}>
                              {isSaving ? "Đang lưu..." : "Cập nhật"}
                         </Button>
                    </div>
               </CardContent>
          </Card>
     )
}