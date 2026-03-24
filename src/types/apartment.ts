import type { paths } from "@/types/api"

export type ApartmentListResponse = paths["/api/v1/apartments/search"]["get"]["responses"]["200"]["content"]["application/json"];
export type ApartmentDetailResponse = paths["/api/v1/apartments/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type ApartmentUpdateRequestBody = paths["/api/v1/apartments/{id}"]["patch"]["requestBody"]["content"]["application/json"];
export type ApartmentUpdateResponse = paths["/api/v1/apartments/{id}"]["patch"]["responses"]["200"]["content"]["application/json"];
export type ApartmentSearchQueryParams = paths["/api/v1/apartments/search"]["get"]["parameters"]["query"]

export type ApartmentItem = NonNullable<ApartmentListResponse['data']>[number]
export type ApartmenList = ApartmentItem[]
export type ApartmentQueryParams = NonNullable<ApartmentSearchQueryParams>
export type FurnishingType = NonNullable<ApartmentQueryParams['furnishingStatus']>

export type ApartmentFilterPatch = paths["/api/v1/apartments/search"]["get"]["parameters"]["query"]

export type ViewingRequestBody = paths['/api/v1/viewing-requests/user/book']['post']['requestBody']['content']['application/json']
export type ViewingRequestRespone = paths['/api/v1/viewing-requests/user/book']['post']['responses']['201']['content']['application/json']