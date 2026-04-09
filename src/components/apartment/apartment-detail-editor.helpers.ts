import type { ApartmentDetailData } from "@/types/apartment"
import type { ApartmentForm } from "@/types/apartment-form"
import {
     APARTMENT_FURNITURE_LABELS,
     formatDateTime,
     formatStatus,
     formatVND,
} from "@/utils/format"
import {
     Bath,
     BedDouble,
     Building2,
     CalendarDays,
     CircleDollarSign,
     Clock3,
     Hash,
     Home,
     Info,
     Landmark,
     MapPin,
     Ruler,
     Star,
     Users,
} from "lucide-react"

export const DEFAULT_CREATE_FORM: ApartmentForm = {
     furnishingStatus: "unfurnished",
     status: "available",
     amenityIds: [],
     images: [],
     maxOccupants: undefined,
}

export const DEFAULT_SECTION_VISIBILITY = {
     showDetailsSection: true,
     showOwnerSection: true,
     showAmenitySection: true,
     showMediaSection: true,
     showRentalSummarySection: true,
     showIotSection: true,
     showRoomsSection: true,
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

export const buildApartmentDetailItems = (
     detailApartment: ApartmentDetailData,
     fullAddress: string,
) => {
     return [
          { label: "ID", value: detailApartment.id, icon: Hash },
          { label: "Mã căn hộ", value: detailApartment.apartmentNumber, icon: Home },
          { label: "Tên tòa nhà", value: detailApartment.buildingName, icon: Building2 },
          { label: "Tầng", value: detailApartment.floorNumber, icon: Building2 },
          { label: "Trạng thái", value: formatStatus(detailApartment.status), icon: Info },
          { label: "Đánh giá trung bình", value: detailApartment.rating, icon: Star },
          { label: "Nội thất", value: APARTMENT_FURNITURE_LABELS[detailApartment.furnishingStatus], icon: Home },
          {
               label: "Giá thuê",
               value: formatVND(detailApartment.baseRentPrice, true),
               icon: CircleDollarSign,
          },
          {
               label: "Tiền cọc",
               value: detailApartment.depositAmount
                    ? formatVND(detailApartment.depositAmount, true)
                    : "-",
               icon: Landmark,
          },
          { label: "Diện tích tổng", value: `${detailApartment.totalArea} m²`, icon: Ruler },
          {
               label: "Diện tích sử dụng",
               value: detailApartment.usableArea ? `${detailApartment.usableArea} m²` : "-",
               icon: Ruler,
          },
          { label: "Số phòng ngủ", value: detailApartment.numberOfBedrooms, icon: BedDouble },
          { label: "Số phòng tắm", value: detailApartment.numberOfBathrooms, icon: Bath },
          { label: "Số người ở tối đa", value: detailApartment.maxOccupants, icon: Users },
          { label: "Địa chỉ đầy đủ", value: fullAddress, icon: MapPin },
          { label: "Mã phường/xã", value: detailApartment.wardCode, icon: Hash },
          { label: "Mã tỉnh/thành", value: detailApartment.provinceCode, icon: Hash },
          { label: "Vĩ độ", value: detailApartment.latitude, icon: MapPin },
          { label: "Kinh độ", value: detailApartment.longitude, icon: MapPin },
          { label: "Năm xây dựng", value: detailApartment.yearBuilt, icon: CalendarDays },
          {
               label: "Ngày duyệt",
               value: formatDateTime(detailApartment.approvedAt),
               icon: Clock3,
          },
          { label: "Ngày tạo", value: formatDateTime(detailApartment.createdAt), icon: Clock3 },
          {
               label: "Cập nhật lần cuối",
               value: formatDateTime(detailApartment.updatedAt),
               icon: Clock3,
          },
     ]
}
