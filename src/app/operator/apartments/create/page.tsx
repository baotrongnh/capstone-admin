"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateApartment } from "@/hooks/query/useApartments"
import {
     ApartmentCreateFurnishingType,
     ApartmentCreateRequestBody,
} from "@/types/apartment"
import { message } from "antd"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const FURNISHING_OPTIONS: { label: string; value: ApartmentCreateFurnishingType }[] = [
     { label: "Không nội thất", value: "unfurnished" },
     { label: "Nội thất cơ bản", value: "semi_furnished" },
     { label: "Đầy đủ nội thất", value: "fully_furnished" },
]

const DEFAULT_FORM: ApartmentCreateRequestBody = {
     apartmentNumber: "",
     totalArea: 0,
     numberOfBedrooms: 1,
     numberOfBathrooms: 1,
     furnishingStatus: "unfurnished",
     baseRentPrice: 0,
}

export default function CreateApartmentPage() {
     const router = useRouter()
     const createApartment = useCreateApartment()

     const [form, setForm] = useState<ApartmentCreateRequestBody>(DEFAULT_FORM)
     const [amenitiesInput, setAmenitiesInput] = useState("")

     const isSubmitting = createApartment.isPending

     const parsedAmenities = useMemo(
          () =>
               amenitiesInput
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
          [amenitiesInput],
     )

     const toNumber = (value: string) => {
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : 0
     }

     const validate = () => {
          const nextErrors: string[] = []

          if (!form.apartmentNumber?.trim()) {
               nextErrors.push("Vui lòng nhập mã căn hộ")
          }

          if (!form.totalArea || form.totalArea <= 0) {
               nextErrors.push("Diện tích phải lớn hơn 0")
          }

          if (!form.numberOfBedrooms || form.numberOfBedrooms < 1) {
               nextErrors.push("Số phòng ngủ tối thiểu là 1")
          }

          if (!form.numberOfBathrooms || form.numberOfBathrooms < 1) {
               nextErrors.push("Số phòng tắm tối thiểu là 1")
          }

          if (!form.baseRentPrice || form.baseRentPrice <= 0) {
               nextErrors.push("Giá thuê phải lớn hơn 0")
          }

          if (nextErrors.length > 0) {
               message.error(nextErrors[0])
               return false
          }

          return true
     }

     const handleSubmit = () => {
          if (!validate()) return

          const payload: ApartmentCreateRequestBody = {
               ...form,
               apartmentNumber: form.apartmentNumber.trim(),
               buildingName: form.buildingName?.trim() || undefined,
               description: form.description?.trim() || undefined,
               amenities: parsedAmenities.length > 0 ? parsedAmenities : undefined,
          }

          createApartment.mutate(payload, {
               onSuccess: () => {
                    router.push("/operator/apartments")
               },
          })
     }

     return (
          <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
               <div className="flex items-center justify-between">
                    <div>
                         <h1 className="text-xl font-semibold">Tạo căn hộ mới</h1>
                         <p className="mt-1 text-sm text-muted-foreground">
                              Trang tạo riêng để thao tác nhanh, dễ mở rộng thêm fields sau này.
                         </p>
                    </div>
                    <Button variant="outline" asChild>
                         <Link href="/operator/apartments">Quay lại danh sách</Link>
                    </Button>
               </div>

               <section className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2">
                    <div className="space-y-2">
                         <p className="text-sm font-medium">Mã căn hộ *</p>
                         <Input
                              value={form.apartmentNumber || ""}
                              onChange={(event) =>
                                   setForm({ ...form, apartmentNumber: event.target.value })
                              }
                              placeholder="VD: A-1501"
                         />
                    </div>

                    <div className="space-y-2">
                         <p className="text-sm font-medium">Tên tòa nhà</p>
                         <Input
                              value={form.buildingName || ""}
                              onChange={(event) => setForm({ ...form, buildingName: event.target.value })}
                              placeholder="VD: Vinhomes Central Park"
                         />
                    </div>

                    <div className="space-y-2">
                         <p className="text-sm font-medium">Diện tích (m²) *</p>
                         <Input
                              type="number"
                              min={1}
                              value={form.totalArea ?? ""}
                              onChange={(event) =>
                                   setForm({ ...form, totalArea: toNumber(event.target.value) })
                              }
                         />
                    </div>

                    <div className="space-y-2">
                         <p className="text-sm font-medium">Giá thuê (VND/tháng) *</p>
                         <Input
                              type="number"
                              min={1}
                              value={form.baseRentPrice ?? ""}
                              onChange={(event) =>
                                   setForm({ ...form, baseRentPrice: toNumber(event.target.value) })
                              }
                         />
                    </div>

                    <div className="space-y-2">
                         <p className="text-sm font-medium">Số phòng ngủ *</p>
                         <Input
                              type="number"
                              min={1}
                              value={form.numberOfBedrooms ?? ""}
                              onChange={(event) =>
                                   setForm({ ...form, numberOfBedrooms: toNumber(event.target.value) })
                              }
                         />
                    </div>

                    <div className="space-y-2">
                         <p className="text-sm font-medium">Số phòng tắm *</p>
                         <Input
                              type="number"
                              min={1}
                              value={form.numberOfBathrooms ?? ""}
                              onChange={(event) =>
                                   setForm({ ...form, numberOfBathrooms: toNumber(event.target.value) })
                              }
                         />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                         <p className="text-sm font-medium">Tình trạng nội thất *</p>
                         <Select
                              value={form.furnishingStatus}
                              onValueChange={(value) =>
                                   setForm({
                                        ...form,
                                        furnishingStatus: value as ApartmentCreateFurnishingType,
                                   })
                              }
                         >
                              <SelectTrigger>
                                   <SelectValue placeholder="Chọn tình trạng nội thất" />
                              </SelectTrigger>
                              <SelectContent>
                                   {FURNISHING_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                             {option.label}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                         <p className="text-sm font-medium">Tiện ích (cách nhau bởi dấu phẩy)</p>
                         <Input
                              value={amenitiesInput}
                              onChange={(event) => setAmenitiesInput(event.target.value)}
                              placeholder="wifi, parking, gym"
                         />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                         <p className="text-sm font-medium">Mô tả</p>
                         <Textarea
                              value={form.description || ""}
                              onChange={(event) => setForm({ ...form, description: event.target.value })}
                              placeholder="Mô tả ngắn về căn hộ"
                              rows={4}
                         />
                    </div>
               </section>

               <div className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                         <Link href="/operator/apartments">Hủy</Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                         {isSubmitting ? "Đang tạo..." : "Tạo căn hộ"}
                    </Button>
               </div>
          </div>
     )
}
