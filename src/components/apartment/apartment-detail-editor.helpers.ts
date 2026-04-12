import type { ApartmentDetailData } from "@/types/apartment"
import type { ApartmentForm } from "@/types/apartment-form"
import { APARTMENT_FURNITURE_LABELS, formatDateTime, formatStatus, formatVND } from "@/utils/format"
import { Bath, BedDouble, Building2, CalendarDays, CircleDollarSign, Clock3, Hash, Home, Info, Landmark, MapPin, Ruler, Star, Users } from "lucide-react"

export const DEFAULT_CREATE_FORM: ApartmentForm = {
     furnishingStatus: "unfurnished",
     status: "available",
     amenityIds: [],
     images: [],
     numberOfBedrooms: 0,
     numberOfBathrooms: 0,
     maxOccupants: undefined,
}

export const DEFAULT_SECTION_VISIBILITY = {
     showDetailsSection: true,
     showOwnerSection: true,
     showAmenitySection: true,
     showMediaSection: true,
     showIotSection: true,
     showTenantSection: true,
}

export const AVAILABLE_YEARS = (() => {
     const currentYear = new Date().getFullYear()
     return Array.from({ length: currentYear - 1950 + 1 }, (_, idx) => currentYear - idx)
})()

export const hasApartmentFormChanged = (
     initialForm: ApartmentForm | null,
     currentForm: ApartmentForm | null,
) => {
     if (!initialForm || !currentForm) return false

     const initialData = initialForm as Record<string, unknown>
     const currentData = currentForm as Record<string, unknown>
     const keys = Array.from(new Set([...Object.keys(initialData), ...Object.keys(currentData)]))

     return keys.some((key) => {
          const before = initialData[key] ?? null
          const after = currentData[key] ?? null
          return JSON.stringify(before) !== JSON.stringify(after)
     })
}

export const buildApartmentDetailItems = (detailApartment: ApartmentDetailData, fullAddress: string) => {
     return [
          { group: "Thông tin căn hộ", label: "ID", value: detailApartment.id, icon: Hash },
          { group: "Thông tin căn hộ", label: "Mã căn hộ", value: detailApartment.apartmentNumber, icon: Home },
          { group: "Thông tin căn hộ", label: "Tên tòa nhà", value: detailApartment.buildingName, icon: Building2 },
          { group: "Thông tin căn hộ", label: "Tầng", value: detailApartment.floorNumber, icon: Building2 },
          { group: "Thông tin căn hộ", label: "Trạng thái", value: formatStatus(detailApartment.status), icon: Info },
          { group: "Thông tin căn hộ", label: "Đánh giá trung bình", value: detailApartment.rating, icon: Star },
          { group: "Thông tin căn hộ", label: "Nội thất", value: APARTMENT_FURNITURE_LABELS[detailApartment.furnishingStatus], icon: Home },
          {
               group: "Thông tin căn hộ",
               label: "Giá thuê",
               value: formatVND(detailApartment.baseRentPrice, true),
               icon: CircleDollarSign,
          },
          {
               group: "Thông tin căn hộ",
               label: "Tiền cọc",
               value: detailApartment.depositAmount
                    ? formatVND(detailApartment.depositAmount, true)
                    : "-",
               icon: Landmark,
          },
          { group: "Thông tin căn hộ", label: "Diện tích tổng", value: `${detailApartment.totalArea} m²`, icon: Ruler },
          {
               group: "Thông tin căn hộ",
               label: "Diện tích sử dụng",
               value: detailApartment.usableArea ? `${detailApartment.usableArea} m²` : "-",
               icon: Ruler,
          },
          { group: "Thông tin căn hộ", label: "Số phòng ngủ", value: detailApartment.numberOfBedrooms, icon: BedDouble },
          { group: "Thông tin căn hộ", label: "Số phòng tắm", value: detailApartment.numberOfBathrooms, icon: Bath },
          { group: "Thông tin căn hộ", label: "Số người ở tối đa", value: detailApartment.maxOccupants, icon: Users },
          { group: "Thông tin địa chỉ", label: "Địa chỉ đầy đủ", value: fullAddress, icon: MapPin },
          { group: "Thông tin địa chỉ", label: "Mã phường/xã", value: detailApartment.wardCode, icon: Hash },
          { group: "Thông tin địa chỉ", label: "Mã tỉnh/thành", value: detailApartment.provinceCode, icon: Hash },
          { group: "Tọa độ", label: "Vĩ độ", value: detailApartment.latitude, icon: MapPin },
          { group: "Tọa độ", label: "Kinh độ", value: detailApartment.longitude, icon: MapPin },
          { group: "Thông tin căn hộ", label: "Năm xây dựng", value: detailApartment.yearBuilt, icon: CalendarDays },
          {
               group: "Thông tin hệ thống",
               label: "Ngày duyệt",
               value: formatDateTime(detailApartment.approvedAt),
               icon: Clock3,
          },
          { group: "Thông tin hệ thống", label: "Ngày tạo", value: formatDateTime(detailApartment.createdAt), icon: Clock3 },
          {
               group: "Thông tin hệ thống",
               label: "Cập nhật lần cuối",
               value: formatDateTime(detailApartment.updatedAt),
               icon: Clock3,
          },
     ]
}
