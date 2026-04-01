"use client"

import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { useProvinces, useWards } from "@/hooks/query/useAddress"
import { useMemo, useState } from "react"

type AddressCodes = {
     provinceCode?: number
     wardCode?: number
}

type AddressChange = {
     wardCode?: number
}

type ApartmentAddressFieldsProps = {
     initialCodes: AddressCodes
     onChange: (value: AddressChange) => void
}

export function ApartmentAddressFields({
     initialCodes,
     onChange,
}: ApartmentAddressFieldsProps) {
     const [provinceCode, setProvinceCode] = useState<number | undefined>(
          initialCodes.provinceCode,
     )
     const [wardCode, setWardCode] = useState<number | undefined>(
          initialCodes.wardCode,
     )

     const { data: provinces } = useProvinces()
     const { data: wards } = useWards(provinceCode)

     const provinceOptions = useMemo(
          () =>
               provinces?.map((province) => ({
                    label: province.name,
                    value: String(province.code),
               })) || [],
          [provinces],
     )

     const wardOptions = useMemo(
          () =>
               wards?.map((ward) => ({
                    label: ward.name,
                    value: String(ward.code),
               })) || [],
          [wards],
     )

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

     return (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
               <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tỉnh/Thành phố</p>
                    <Select
                         value={provinceCode ? String(provinceCode) : undefined}
                         onValueChange={handleProvinceChange}
                    >
                         <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn tỉnh/thành phố" />
                         </SelectTrigger>
                         <SelectContent>
                              {provinceOptions.map((option) => (
                                   <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                   </SelectItem>
                              ))}
                         </SelectContent>
                    </Select>
               </div>

               <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Phường/Xã</p>
                    <Select
                         value={wardCode ? String(wardCode) : undefined}
                         onValueChange={handleWardChange}
                         disabled={!provinceCode}
                    >
                         <SelectTrigger className="w-full">
                              <SelectValue placeholder="Chọn phường/xã" />
                         </SelectTrigger>
                         <SelectContent>
                              {wardOptions.map((option) => (
                                   <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                   </SelectItem>
                              ))}
                         </SelectContent>
                    </Select>
               </div>
          </div>
     )
}
