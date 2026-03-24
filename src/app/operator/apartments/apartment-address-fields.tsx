"use client"

import { useDistricts, useProvinces } from "@/hooks/query/useProvinces"
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { useMemo, useState } from "react"

type AddressCodes = {
     newProvinceCode?: number
     newWardCode?: number
}

type AddressChange = {
     newWardCode?: number
     cityName?: string
}

type ApartmentAddressFieldsProps = {
     initialCodes: AddressCodes
     onChange: (value: AddressChange) => void
}

export function ApartmentAddressFields({
     initialCodes,
     onChange,
}: ApartmentAddressFieldsProps) {
     const [newProvinceCode, setNewProvinceCode] = useState<number | undefined>(
          initialCodes.newProvinceCode,
     )
     const [newWardCode, setNewWardCode] = useState<number | undefined>(
          initialCodes.newWardCode,
     )

     const { data: newProvinces } = useProvinces(true)
     const { data: newWards } = useDistricts(newProvinceCode, true)

     const newProvinceName = useMemo(() => {
          return newProvinces?.find((item) => item.code === newProvinceCode)?.name
     }, [newProvinceCode, newProvinces])

     const emitChange = (next: { newWardCode?: number; cityName?: string }) => {
          onChange({ newWardCode: next.newWardCode, cityName: next.cityName })
     }

     const toOptionalNumber = (value: string) => (value ? Number(value) : undefined)

     const handleNewProvinceChange = (value: string) => {
          const nextCode = toOptionalNumber(value)
          setNewProvinceCode(nextCode)
          setNewWardCode(undefined)

          const nextCityName = newProvinces?.find((item) => item.code === nextCode)?.name
          emitChange({ newWardCode: undefined, cityName: nextCityName })
     }

     const handleNewWardChange = (value: string) => {
          const nextCode = toOptionalNumber(value)
          setNewWardCode(nextCode)

          emitChange({ newWardCode: nextCode, cityName: newProvinceName })
     }

     return (
          <section className="rounded-lg border p-4 space-y-3">
               <h3 className="text-sm font-semibold">Địa chỉ</h3>

               <div className="space-y-2">
                    <p className="text-sm font-medium">Địa chỉ mới</p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                         <Select
                              value={newProvinceCode ? String(newProvinceCode) : undefined}
                              onValueChange={handleNewProvinceChange}
                         >
                              <SelectTrigger className="w-full">
                                   <SelectValue placeholder="Tỉnh/Thành phố" />
                              </SelectTrigger>
                              <SelectContent>
                                   {newProvinces?.map((province) => (
                                        <SelectItem key={province.code} value={String(province.code)}>
                                             {province.name}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>

                         <Select
                              value={newWardCode ? String(newWardCode) : undefined}
                              onValueChange={handleNewWardChange}
                              disabled={!newProvinceCode}
                         >
                              <SelectTrigger className="w-full">
                                   <SelectValue placeholder="Phường/Xã" />
                              </SelectTrigger>
                              <SelectContent>
                                   {newWards?.map((ward) => (
                                        <SelectItem key={ward.code} value={String(ward.code)}>
                                             {ward.name}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                    </div>
               </div>
          </section>
     )
}
