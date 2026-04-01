import { ApartmentForm } from "@/types/apartment-modal"

export type ApartmentValidationField =
     | "apartmentNumber"
     | "totalArea"
     | "numberOfBedrooms"
     | "numberOfBathrooms"
     | "baseRentPrice"
     | "furnishingStatus"

export type ApartmentValidationError = {
     field: ApartmentValidationField
     message: string
}

export type ApartmentFieldErrors = Partial<Record<ApartmentValidationField, string>>

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

     if (!form.apartmentNumber?.trim()) {
          errors.push({ field: "apartmentNumber", message: "Vui lòng nhập mã căn hộ" })
     }

     if (!form.totalArea || form.totalArea <= 0) {
          errors.push({ field: "totalArea", message: "Diện tích phải lớn hơn 0" })
     }

     if (form.numberOfBedrooms === undefined || form.numberOfBedrooms === null) {
          errors.push({ field: "numberOfBedrooms", message: "Vui lòng nhập số phòng ngủ" })
     } else if (form.numberOfBedrooms < 0) {
          errors.push({ field: "numberOfBedrooms", message: "Số phòng ngủ không được nhỏ hơn 0" })
     }

     if (form.numberOfBathrooms === undefined || form.numberOfBathrooms === null) {
          errors.push({ field: "numberOfBathrooms", message: "Vui lòng nhập số phòng tắm" })
     } else if (form.numberOfBathrooms < 0) {
          errors.push({ field: "numberOfBathrooms", message: "Số phòng tắm không được nhỏ hơn 0" })
     }

     if (!form.baseRentPrice || form.baseRentPrice <= 0) {
          errors.push({ field: "baseRentPrice", message: "Giá thuê phải lớn hơn 0" })
     }

     if (!form.furnishingStatus) {
          errors.push({ field: "furnishingStatus", message: "Vui lòng chọn tình trạng nội thất" })
     }

     return errors
}
