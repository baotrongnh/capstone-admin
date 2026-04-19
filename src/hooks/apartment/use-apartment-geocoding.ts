import { useGeocodeAddress } from "@/hooks/query/useAddress"
import type { GeocodeStatus } from "@/types/apartment"
import type { ApartmentForm } from "@/types/apartment-form"
import { useEffect, useRef, useState } from "react"

type UseApartmentGeocodingParams = {
     editMode: boolean
     form: ApartmentForm | null
     fullAddress: string
     onAutoCoordinate: (value: { latitude: number; longitude: number }) => void
}

export function useApartmentGeocoding({ editMode, form, fullAddress, onAutoCoordinate }: UseApartmentGeocodingParams) {
     const [debouncedAddress, setDebouncedAddress] = useState("")
     const lastAppliedAddressRef = useRef<string | null>(null)
     const hasSkippedInitialRef = useRef(false)
     const onAutoCoordinateRef = useRef(onAutoCoordinate)
     useEffect(() => {
          onAutoCoordinateRef.current = onAutoCoordinate
     }, [onAutoCoordinate])

     const geocodeEnabled =
          editMode &&
          !!form &&
          !!form.streetAddress?.trim() &&
          !!form.wardCode

     const trimmedAddress = fullAddress.trim()

     // Debounce address 2s
     useEffect(() => {
          const timerId = setTimeout(() => {
               setDebouncedAddress(geocodeEnabled ? trimmedAddress : "")
          }, 2000)
          return () => clearTimeout(timerId)
     }, [trimmedAddress, geocodeEnabled])

     const geocodeQuery = useGeocodeAddress(debouncedAddress || undefined, geocodeEnabled)

     const geocodeStatus: GeocodeStatus = (() => {
          if (!geocodeEnabled || !debouncedAddress) return "idle"
          if (geocodeQuery.isFetching) return "loading"
          if (geocodeQuery.isError) return "error"
          if (geocodeQuery.data) return "success"
          if (geocodeQuery.isSuccess) return "not_found"
          return "idle"
     })()

     const geocodeErrorMessage = (geocodeStatus === "error") ? 'Không thể gọi dịch vụ định vị tự động. Vui lòng thử lại.' : ''

     // Auto-apply geocode result to form
     useEffect(() => {
          if (!form || !geocodeEnabled || !debouncedAddress) return

          const geocodeData = geocodeQuery.data
          if (!geocodeData) return

          // Skip first time if form already has coordinates (edit mode)
          if (!hasSkippedInitialRef.current && form.latitude && form.longitude) {
               hasSkippedInitialRef.current = true
               lastAppliedAddressRef.current = debouncedAddress
               return
          }
          hasSkippedInitialRef.current = true

          // Don't re-apply for the same address
          if (lastAppliedAddressRef.current === debouncedAddress) return

          onAutoCoordinateRef.current({
               latitude: geocodeData.latitude,
               longitude: geocodeData.longitude,
          })
          lastAppliedAddressRef.current = debouncedAddress
     }, [debouncedAddress, form, geocodeEnabled, geocodeQuery.data])

     const markManualCoordinatePick = () => {
          lastAppliedAddressRef.current = debouncedAddress || trimmedAddress || null
     }

     const resetGeocodeTracking = () => {
          lastAppliedAddressRef.current = null
     }

     return {
          geocodeStatus,
          geocodeErrorMessage,
          markManualCoordinatePick,
          resetGeocodeTracking,
     }
}
