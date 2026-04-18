"use client"

import { useProvinces, useWards } from "@/hooks/query/useAddress"
import { normalizeText } from "@/utils/format"
import { Select as AntdSelect } from "antd"
import { useEffect, useMemo, useState } from "react"

type ApartmentAddressFieldsProps = {
     initialCodes: {
          provinceCode?: number
          wardCode?: number
     }
     onChange: (value: { wardCode?: number }) => void
}

export function ApartmentAddressFields({ initialCodes, onChange }: ApartmentAddressFieldsProps) {
     const [provinceCode, setProvinceCode] = useState<number | undefined>(initialCodes.provinceCode)
     const [wardCode, setWardCode] = useState<number | undefined>(initialCodes.wardCode)

     useEffect(() => {
          if (initialCodes.provinceCode === undefined) {
               return
          }

          setProvinceCode(initialCodes.provinceCode)
          setWardCode(initialCodes.wardCode)
     }, [initialCodes.provinceCode, initialCodes.wardCode])

     const { data: provinces, isLoading: isProvincesLoading, isFetching: isProvincesFetching } = useProvinces()
     const { data: wards, isLoading: isWardsLoading, isFetching: isWardsFetching } = useWards(provinceCode)

     const provincesLoading = isProvincesLoading || isProvincesFetching
     const wardsLoading = isWardsLoading || isWardsFetching

     const provinceOptions = useMemo(() => provinces?.map((province) => ({
          label: province.name,
          value: String(province.code),
     })) || [], [provinces])

     const wardOptions = useMemo(() => wards?.map((ward) => ({
          label: ward.name,
          value: String(ward.code),
     })) || [], [wards])

     const toOptionalNumber = (value: string) => (value ? Number(value) : undefined)

     const handleProvinceChange = (value: string) => {
          const nextCode = toOptionalNumber(value)
          setProvinceCode(nextCode)
          setWardCode(undefined)
          onChange({ wardCode: undefined })
     }

     const handleWardChange = (value: string) => {
          const nextCode = toOptionalNumber(value)
          setWardCode(nextCode)
          onChange({ wardCode: nextCode })
     }

     const filterAddressOption = (input: string, option?: { label?: string | number }) => {
          const normalizedInput = normalizeText(input || "")
          const normalizedLabel = normalizeText(String(option?.label || ""))
          return normalizedLabel.includes(normalizedInput)
     }

     return (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
               <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tỉnh/Thành phố</p>
                    <AntdSelect
                         showSearch
                         allowClear
                         loading={provincesLoading}
                         value={provinceCode ? String(provinceCode) : undefined}
                         placeholder="Chọn tỉnh/thành phố"
                         optionFilterProp="label"
                         filterOption={filterAddressOption}
                         options={provinceOptions}
                         onChange={(value) => handleProvinceChange(String(value || ""))}
                         className="w-full"
                    />
               </div>

               <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phường/Xã</p>
                    <AntdSelect
                         showSearch
                         allowClear
                         loading={wardsLoading}
                         value={wardCode ? String(wardCode) : undefined}
                         placeholder="Chọn phường/xã"
                         optionFilterProp="label"
                         filterOption={filterAddressOption}
                         options={wardOptions}
                         onChange={(value) => handleWardChange(String(value || ""))}
                         disabled={!provinceCode || provincesLoading}
                         className="w-full"
                    />
               </div>
          </div>
     )
}
