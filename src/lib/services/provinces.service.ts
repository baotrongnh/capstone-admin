import axios from 'axios'
import {
     DistrictDetailResponse,
     Division,
     Province,
     ProvinceDetailResponse,
} from '@/types/provinces'

const BASE = process.env.NEXT_PUBLIC_PROVINCES_API_URL

export const provincesService = {
     getAll: (afterMerge: boolean): Promise<Province[]> => {
          const url = afterMerge ? `${BASE}/v2/p/` : `${BASE}/v1/p/`
          return axios.get<Province[]>(url).then(r => r.data)
     },

     // Dùng cho danh sách cấp quận/huyện theo tỉnh của cả v1 và v2.
     getDistricts: (provinceCode: number, afterMerge: boolean): Promise<Division[]> => {
          const url = afterMerge
               ? `${BASE}/v2/p/${provinceCode}?depth=2`
               : `${BASE}/v1/p/${provinceCode}?depth=2`

          return axios
               .get<ProvinceDetailResponse>(url)
               .then(r => (afterMerge ? r.data.wards : r.data.districts) ?? [])
     },

     getWards: (districtCode: number): Promise<Division[]> => {
          const url = `${BASE}/v1/d/${districtCode}?depth=2`

          return axios
               .get<DistrictDetailResponse>(url)
               .then(r => r.data.wards ?? [])
     },
}
