import type { paths } from "@/types/api"

export type AmenityListResponse = paths["/api/v1/amenities"]["get"]["responses"]["200"]["content"]["application/json"]
export type AmenityDetailResponse = paths["/api/v1/amenities/{id}"]["get"]["responses"]["200"]["content"]["application/json"]
export type AmenityCreateRequestBody = paths["/api/v1/amenities"]["post"]["requestBody"]["content"]["application/json"]
export type AmenityCreateResponse = paths["/api/v1/amenities"]["post"]["responses"]["201"]["content"]["application/json"]
export type AmenityUpdateRequestBody = paths["/api/v1/amenities/{id}"]["patch"]["requestBody"]["content"]["application/json"]
export type AmenityUpdateResponse = paths["/api/v1/amenities/{id}"]["patch"]["responses"]["200"]["content"]["application/json"]
export type AmenityDeactivateResponse = paths["/api/v1/amenities/{id}"]["delete"]["responses"]["200"]["content"]["application/json"]

export type AmenityItem = NonNullable<AmenityListResponse["data"]>[number]
export type AmenityDetailData = NonNullable<AmenityDetailResponse["data"]>
