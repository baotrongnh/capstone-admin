import {
     ApartmentDetailData,
     ApartmentStatus,
     FurnishingStatus,
     ApartmentUpdateRequestBody,
} from "@/types/apartment"

export type ApartmentForm = ApartmentUpdateRequestBody & {
     videoTourUrl?: string
}

export const parseNumber = (value: string) => {
     if (!value.trim()) return undefined
     const parsed = Number(value)
     return Number.isNaN(parsed) ? undefined : parsed
}

const toOptionalNumber = (value: unknown) => {
     if (value === undefined || value === null || value === "") return undefined
     const parsed = Number(value)
     return Number.isNaN(parsed) ? undefined : parsed
}

export const buildApartmentForm = (
     detail: ApartmentDetailData,
): ApartmentForm => ({
     buildingName: detail.buildingName || undefined,
     apartmentNumber: detail.apartmentNumber || undefined,
     floorNumber: detail.floorNumber || undefined,
     totalArea: toOptionalNumber(detail.totalArea),
     usableArea: toOptionalNumber(detail.usableArea),
     numberOfBedrooms: detail.numberOfBedrooms ?? undefined,
     numberOfBathrooms: detail.numberOfBathrooms ?? undefined,
     furnishingStatus: (detail.furnishingStatus as FurnishingStatus) || "unfurnished",
     status: (detail.status as ApartmentStatus) || "available",
     baseRentPrice: toOptionalNumber(detail.baseRentPrice),
     depositAmount: toOptionalNumber(detail.depositAmount),
     description: detail.description || undefined,
     amenityIds: detail.amenities?.map((amenity) => amenity.id) ?? [],
     images: detail.images || [],
     videoTourUrl: detail.videoTourUrl || undefined,
     yearBuilt: detail.yearBuilt || undefined,
     wardCode: detail.wardCode || undefined,
     streetAddress: detail.streetAddress || undefined,
     latitude: toOptionalNumber(detail.latitude),
     longitude: toOptionalNumber(detail.longitude),
     ownerId: detail.ownerId || undefined,
})
