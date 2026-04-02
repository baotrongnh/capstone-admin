import axios from "axios"

const NOMINATIM_ENV_KEY = "NEXT_PUBLIC_NOMINATIM_BASE_URL"
const REQUEST_TIMEOUT_MS = 10000

let cachedNominatimBaseUrl: string | null = null

type NominatimSearchItem = {
     lat: string
     lon: string
     display_name: string
}

export type GeocodeResult = {
     latitude: number
     longitude: number
     displayName: string
}

const getNominatimBaseUrl = () => {
     if (cachedNominatimBaseUrl) {
          return cachedNominatimBaseUrl
     }

     const envValue = process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL?.trim()
     if (!envValue) {
          throw new Error(`Missing required env: ${NOMINATIM_ENV_KEY}`)
     }

     cachedNominatimBaseUrl = envValue.replace(/\/+$/, "")
     return cachedNominatimBaseUrl
}

const compactAddress = (value: string) =>
     value
          .replace(/\s+/g, " ")
          .replace(/\s*,\s*/g, ", ")
          .replace(/,+/g, ",")
          .replace(/^,|,$/g, "")
          .trim()

const removeVietnamesePrefix = (value: string) =>
     value
          .replace(/^(tỉnh|thành phố|tp\.?|quận|huyện|phường|xã|thị trấn|tinh|thanh pho|quan|huyen|phuong|xa|thi tran)\s+/i, "")
          .trim()

const splitAddressParts = (value: string) => {
     const parts = compactAddress(value)
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)

     const province = parts.length > 0 ? removeVietnamesePrefix(parts[parts.length - 1]) : ""
     const ward = parts.length > 1 ? removeVietnamesePrefix(parts[parts.length - 2]) : ""
     const street = parts.length > 2 ? compactAddress(parts.slice(0, -2).join(", ")) : parts[0] || ""

     return {
          street,
          ward,
          province,
     }
}

const dedupeQueries = (queries: string[]) => Array.from(new Set(queries.map(compactAddress).filter(Boolean)))

const buildCandidateQueries = (address: string) => {
     const normalizedAddress = compactAddress(address)
     const { street, ward, province } = splitAddressParts(normalizedAddress)

     return dedupeQueries([
          normalizedAddress,
          `${normalizedAddress}, Vietnam`,
          street && province ? `${street}, ${province}, Vietnam` : "",
          ward && province ? `${ward}, ${province}, Vietnam` : "",
     ])
}

const mapSearchItem = (value: NominatimSearchItem): GeocodeResult | null => {
     const latitude = Number(value.lat)
     const longitude = Number(value.lon)

     if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null
     }

     return {
          latitude,
          longitude,
          displayName: value.display_name,
     }
}

const requestGeocode = async (query: string) => {
     const response = await axios.get<NominatimSearchItem[]>(`${getNominatimBaseUrl()}/search`, {
          params: {
               q: query,
               format: "jsonv2",
               addressdetails: 0,
               limit: 1,
               countrycodes: "vn",
          },
          headers: {
               "Accept-Language": "vi",
          },
          timeout: REQUEST_TIMEOUT_MS,
     })

     const firstResult = response.data?.[0]
     return firstResult ? mapSearchItem(firstResult) : null
}

export const geocodeService = {
     geocodeAddress: async (address: string): Promise<GeocodeResult | null> => {
          const trimmedAddress = address.trim()
          if (!trimmedAddress) {
               return null
          }

          const queries = buildCandidateQueries(trimmedAddress)
          let hasSuccessfulRequest = false
          let lastError: unknown = null

          for (const query of queries) {
               try {
                    const result = await requestGeocode(query)
                    hasSuccessfulRequest = true

                    if (result) {
                         return result
                    }
               } catch (error) {
                    lastError = error
               }
          }

          if (!hasSuccessfulRequest && lastError) {
               throw lastError
          }

          return null
     },
}
