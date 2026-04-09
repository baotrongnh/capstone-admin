import { ApartmentForm } from "@/types/apartment-form"
import type { ApartmentValidationField } from "@/types/apartment"

export type { ApartmentValidationField } from "@/types/apartment"

export type ApartmentValidationError = {
     field: ApartmentValidationField
     message: string
}

export type ApartmentFieldErrors = Partial<Record<ApartmentValidationField, string>>

export const APARTMENT_REQUIRED_FIELDS: ApartmentValidationField[] = [
     "buildingName",
     "apartmentNumber",
     "status",
     "totalArea",
     "maxOccupants",
     "baseRentPrice",
     "depositAmount",
     "furnishingStatus",
     "wardCode",
     "streetAddress",
]

export const toApartmentFieldErrors = (
     errors: ApartmentValidationError[],
): ApartmentFieldErrors => {
     return errors.reduce<ApartmentFieldErrors>((acc, current) => {
          if (!acc[current.field]) {
               acc[current.field] = current.message
          }
          return acc
     }, {})
}

export const validateApartmentForm = (form: ApartmentForm): ApartmentValidationError[] => {
     const errors: ApartmentValidationError[] = []

     if (!form.buildingName?.trim()) {
          errors.push({ field: "buildingName", message: "Vui lòng nhập tên tòa nhà" })
     }

     if (!form.apartmentNumber?.trim()) {
          errors.push({ field: "apartmentNumber", message: "Vui lòng nhập mã căn hộ" })
     }

     if (!form.status) {
          errors.push({ field: "status", message: "Vui lòng chọn trạng thái" })
     }

     if (!form.totalArea || form.totalArea <= 0) {
          errors.push({ field: "totalArea", message: "Diện tích phải lớn hơn 0" })
     }

     if (form.numberOfBedrooms !== undefined && form.numberOfBedrooms !== null && form.numberOfBedrooms < 0) {
          errors.push({ field: "numberOfBedrooms", message: "Số phòng ngủ không được nhỏ hơn 0" })
     }

     if (form.numberOfBathrooms !== undefined && form.numberOfBathrooms !== null && form.numberOfBathrooms < 0) {
          errors.push({ field: "numberOfBathrooms", message: "Số phòng tắm không được nhỏ hơn 0" })
     }

     if (form.maxOccupants === undefined || form.maxOccupants === null) {
          errors.push({ field: "maxOccupants", message: "Vui lòng nhập số người cho phép" })
     } else if (form.maxOccupants < 1) {
          errors.push({ field: "maxOccupants", message: "Số người cho phép phải lớn hơn hoặc bằng 1" })
     }

     if (!form.baseRentPrice || form.baseRentPrice <= 0) {
          errors.push({ field: "baseRentPrice", message: "Giá thuê phải lớn hơn 0" })
     }

     if (!form.depositAmount || form.depositAmount <= 0) {
          errors.push({ field: "depositAmount", message: "Tiền cọc phải lớn hơn 0" })
     }

     if (!form.furnishingStatus) {
          errors.push({ field: "furnishingStatus", message: "Vui lòng chọn tình trạng nội thất" })
     }

     if (!form.wardCode) {
          errors.push({ field: "wardCode", message: "Vui lòng chọn thành phố và phường/xã" })
     }

     if (!form.streetAddress?.trim()) {
          errors.push({ field: "streetAddress", message: "Vui lòng nhập số nhà, đường" })
     }

     return errors
}
