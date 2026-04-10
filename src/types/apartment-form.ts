import {
     ApartmentDetailData,
     ApartmentUpdateRequestBody,
} from "@/types/apartment"
import { toOptionalNumber } from "@/utils/number"

export type ApartmentForm = ApartmentUpdateRequestBody & {
     videoTourUrl?: string
}

const DEFAULT_STATUS: NonNullable<ApartmentUpdateRequestBody["status"]> = "available"
const DEFAULT_FURNISHING_STATUS: NonNullable<ApartmentUpdateRequestBody["furnishingStatus"]> = "unfurnished"

export const buildApartmentForm = (detail: ApartmentDetailData): ApartmentForm => ({
     buildingName: detail.buildingName || undefined,
     apartmentNumber: detail.apartmentNumber || undefined,
     floorNumber: detail.floorNumber || undefined,
     totalArea: toOptionalNumber(detail.totalArea),
     usableArea: toOptionalNumber(detail.usableArea),
     numberOfBedrooms: detail.numberOfBedrooms ?? undefined,
     numberOfBathrooms: detail.numberOfBathrooms ?? undefined,
     maxOccupants: toOptionalNumber(detail.maxOccupants),
     furnishingStatus:
          (detail.furnishingStatus as ApartmentForm["furnishingStatus"]) || DEFAULT_FURNISHING_STATUS,
     status: (detail.status as ApartmentForm["status"]) || DEFAULT_STATUS,
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
