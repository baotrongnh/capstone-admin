"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { message } from "antd"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useSaveCommissionPhases } from "@/hooks/query/useSystemConfig"
import type { CommissionPhaseInput } from "@/types/system-config"
import { formatDateTime } from "@/utils/format"
import { ConfigDateField } from "./config-date-field"
import { toEndOfDayIso, toStartOfDayIso } from "@/utils/date-utils"

type Row = {
     id: string
     phaseName: string
     effectiveFrom: string
     effectiveTo: string
     commissionRate: string
}

const createRow = (): Row => ({
     id: crypto.randomUUID(),
     phaseName: "",
     effectiveFrom: "",
     effectiveTo: "",
     commissionRate: "",
})

export function CommissionCard() {
     const [rows, setRows] = useState<Row[]>([createRow()])
     const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
     const mutation = useSaveCommissionPhases()

     const updateRow = (row: Row, field: keyof Row, value: string) => {
          setRows((current) => current.map((item) => (item.id === row.id ? { ...item, [field]: value } : item)))
     }

     const removeRow = (row: Row) => {
          setRows((current) => (current.length === 1 ? current : current.filter((item) => item.id !== row.id)))
     }

     const buildPhases = () =>
          rows.map((row) => ({
               phaseName: row.phaseName.trim(),
               effectiveFrom: toStartOfDayIso(row.effectiveFrom),
               effectiveTo: toEndOfDayIso(row.effectiveTo) ?? null,
               commissionRate: Number(row.commissionRate),
          }))

     const save = () => {
          const phases = buildPhases()
          const invalid = phases.some((phase) => !phase.phaseName || !phase.effectiveFrom || Number.isNaN(phase.commissionRate))

          if (invalid) {
               message.warning("Vui lòng điền đầy đủ các giai đoạn hoa hồng.")
               return
          }

          mutation.mutate(phases as CommissionPhaseInput[], {
               onSuccess: () => setLastSavedAt(new Date().toISOString()),
          })
     }

     return (
          <Card className="border-border/70">
               <CardHeader>
                    <CardTitle className="text-base">Cấu hình hoa hồng hợp tác</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                    {rows.map((row) => (
                         <div key={row.id} className="grid gap-3 rounded-lg border p-4 md:grid-cols-5">
                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tên giai đoạn</p>
                                   <Input value={row.phaseName} onChange={(event) => updateRow(row, "phaseName", event.target.value)} placeholder="VD: Giai đoạn 1" />
                              </div>

                              <ConfigDateField field={{ label: "Từ ngày", value: row.effectiveFrom, onChange: (value) => updateRow(row, "effectiveFrom", value) }} />
                              <ConfigDateField field={{ label: "Đến ngày", value: row.effectiveTo, onChange: (value) => updateRow(row, "effectiveTo", value) }} />

                              <div className="space-y-1">
                                   <p className="text-xs text-muted-foreground">Tỷ lệ (%)</p>
                                   <Input type="number" min={0} max={100} value={row.commissionRate} onChange={(event) => updateRow(row, "commissionRate", event.target.value)} placeholder="10" />
                              </div>

                              <div className="flex items-end">
                                   <Button type="button" variant="ghost" onClick={() => removeRow(row)} disabled={rows.length === 1}>
                                        <Trash2 className="size-4 text-red-500" />
                                   </Button>
                              </div>
                         </div>
                    ))}

                    <div className="flex flex-wrap items-center gap-2">
                         <Button type="button" variant="outline" onClick={() => setRows((current) => [...current, createRow()])}>
                              <Plus className="mr-1 size-4" />
                              Thêm giai đoạn
                         </Button>
                         <Button onClick={save} disabled={mutation.isPending}>
                              {mutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}
                         </Button>
                         {lastSavedAt ? <p className="text-xs text-muted-foreground">Cập nhật gần nhất: {formatDateTime(lastSavedAt)}</p> : null}
                    </div>
               </CardContent>
          </Card>
     )
}