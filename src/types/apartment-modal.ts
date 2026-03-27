import {
     ApartmentDetailResponse,
     ApartmentUpdateRequestBody,
} from "@/types/apartment"

export type ApartmentForm = ApartmentUpdateRequestBody
export type ApartmentStatus = NonNullable<ApartmentUpdateRequestBody["status"]>
export type FurnishingStatus = ApartmentUpdateRequestBody["furnishingStatus"]

const STATUS_LABELS: Record<string, string> = {
     available: "Còn trống",
     occupied: "Đang thuê",
     maintenance: "Bảo trì",
     reserved: "Đã giữ chỗ",
     inactive: "Ngừng hoạt động",
}

export const formatStatus = (status?: string | null) => {
     if (!status) return "-"
     return STATUS_LABELS[status] || status
}

export const formatDateTime = (value?: string | null) => {
     if (!value) return "-"

     const date = new Date(value)
     if (Number.isNaN(date.getTime())) return "-"

     return date.toLocaleString("vi-VN")
}

export const parseNumber = (value: string) => {
     if (!value.trim()) return undefined
     const parsed = Number(value)
     return Number.isNaN(parsed) ? undefined : parsed
}

export const buildApartmentForm = (
     detail: NonNullable<ApartmentDetailResponse["data"]>,
): ApartmentForm => ({
     buildingName: detail.buildingName || undefined,
     apartmentNumber: detail.apartmentNumber || undefined,
     floorNumber: detail.floorNumber || undefined,
     totalArea: detail.totalArea ? Number(detail.totalArea) : undefined,
     usableArea: detail.usableArea ? Number(detail.usableArea) : undefined,
     numberOfBedrooms: detail.numberOfBedrooms || undefined,
     numberOfBathrooms: detail.numberOfBathrooms || undefined,
     furnishingStatus: (detail.furnishingStatus as FurnishingStatus) || "unfurnished",
     status: (detail.status as ApartmentStatus) || "available",
     baseRentPrice: detail.baseRentPrice ? Number(detail.baseRentPrice) : undefined,
     depositAmount: detail.depositAmount ? Number(detail.depositAmount) : undefined,
     description: detail.description || undefined,
     amenities: detail.amenities || [],
     images: detail.images || [],
     videoTourUrl: detail.videoTourUrl || undefined,
     yearBuilt: detail.yearBuilt || undefined,
     wardCode: detail.wardCode || undefined,
     streetAddress: detail.streetAddress || undefined,
     ownerId: detail.ownerId || undefined,
})
