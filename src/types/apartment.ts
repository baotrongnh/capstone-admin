import type { paths } from "@/types/api"
import type { UserListItem } from "@/types/user"

export type ApartmentListResponse = paths["/api/v1/apartments/search"]["get"]["responses"]["200"]["content"]["application/json"];
export type ApartmentDetailResponse = paths["/api/v1/apartments/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type ApartmentUpdateRequestBody = paths["/api/v1/apartments/{id}"]["patch"]["requestBody"]["content"]["multipart/form-data"];
export type ApartmentUpdateResponse = paths["/api/v1/apartments/{id}"]["patch"]["responses"]["200"]["content"]["application/json"];
export type ApartmentCreateRequestBody = paths["/api/v1/apartments"]["post"]["requestBody"]["content"]["multipart/form-data"];
export type ApartmentCreateResponse = paths["/api/v1/apartments"]["post"]["responses"]["201"]["content"]["application/json"];
export type ApartmentSearchQueryParams = paths["/api/v1/apartments/search"]["get"]["parameters"]["query"]

export type ApartmentItem = NonNullable<ApartmentListResponse['data']>[number]
export type ApartmenList = ApartmentItem[]
export type ApartmentDetailData = NonNullable<ApartmentDetailResponse["data"]>
export type ApartmentRooms = ApartmentDetailData["rooms"]
export type ApartmentTenants = ApartmentDetailData["userApartments"]

export type ApartmentQueryParams = NonNullable<ApartmentSearchQueryParams>
export type FurnishingType = NonNullable<ApartmentQueryParams['furnishingStatus']>
export type ApartmentCreateFurnishingType = ApartmentCreateRequestBody['furnishingStatus']
export type ApartmentStatus = NonNullable<ApartmentUpdateRequestBody["status"]>
export type FurnishingStatus = ApartmentUpdateRequestBody["furnishingStatus"]

export type ApartmentOwnerOption = Pick<UserListItem, "id" | "fullName" | "email">
export type ApartmentOwnerSummary = {
     id?: string | null
     fullName?: string | null
     companyName?: string | null
}

export type GeocodeStatus = "idle" | "loading" | "success" | "not_found" | "error"

export type ApartmentValidationField =
     | "buildingName"
     | "apartmentNumber"
     | "status"
     | "totalArea"
     | "numberOfBedrooms"
     | "numberOfBathrooms"
     | "maxOccupants"
     | "baseRentPrice"
     | "depositAmount"
     | "furnishingStatus"
     | "wardCode"
     | "streetAddress"

export type ApartmentFilterPatch = paths["/api/v1/apartments/search"]["get"]["parameters"]["query"]

export type ApartmentPayload = Partial<ApartmentCreateRequestBody & ApartmentUpdateRequestBody> & {
     videoTourUrl?: string
}

export type ViewingRequestBody = paths['/api/v1/viewing-requests/user/book']['post']['requestBody']['content']['application/json']
export type ViewingRequestRespone = paths['/api/v1/viewing-requests/user/book']['post']['responses']['201']['content']['application/json']