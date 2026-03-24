export type Province = {
     code: number
     name: string
}

export type Division = {
     code: number
     name: string
}

export type ProvinceDetailResponse = {
     districts?: Division[]
     wards?: Division[]
}

export type DistrictDetailResponse = {
     wards?: Division[]
}
