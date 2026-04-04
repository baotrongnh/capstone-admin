import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_PROVINCES_API_URL


type ProvinceResponse = {
     code: number,
     codename: string,
     division_type: string,
     name: string,
     phone_code: number
}

type WardResponse = {
     code: number,
     codename: string,
     division_type: string,
     name: string,
     province_code: number
}


export const provincesService = {
     getAll: async (): Promise<ProvinceResponse[]> => {
          const data = await axios.get(`${BASE}/v2/p/`)
          return data.data
     },

     getProvince: async (provinceCode: number): Promise<ProvinceResponse> => {
          const data = await axios.get(`${BASE}/v2/p/${provinceCode}`)
          return data.data
     },

     getWards: async (provinceCode: number): Promise<WardResponse[]> => {
          const url = `${BASE}/v2/p/${provinceCode}?depth=2`
          const data = await axios.get(url)
          return data.data.wards
     },

     getWard: async (wardCode: number): Promise<WardResponse> => {
          const url = `${BASE}/v2/w/${wardCode}?depth=2`
          const data = await axios.get(url)
          return await data.data
     }
}
