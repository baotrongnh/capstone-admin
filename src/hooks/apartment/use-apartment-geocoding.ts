import { useGeocodeAddress } from "@/hooks/query/useAddress"
import type { GeocodeStatus } from "@/types/apartment"
import type { ApartmentForm } from "@/types/apartment-modal"
import { useEffect, useMemo, useRef, useState } from "react"

type UseApartmentGeocodingParams = {
     editMode: boolean
     form: ApartmentForm | null
     fullAddress: string
     onAutoCoordinate: (value: { latitude: number; longitude: number }) => void
}

export function useApartmentGeocoding({
     editMode,
     form,
     fullAddress,
     onAutoCoordinate,
}: UseApartmentGeocodingParams) {
     const [debouncedGeocodeAddress, setDebouncedGeocodeAddress] = useState("")

     const lastAutoAddressRef = useRef<string | null>(null)
     const manualPickAddressRef = useRef<string | null>(null)
     const onAutoCoordinateRef = useRef(onAutoCoordinate)

     useEffect(() => {
          onAutoCoordinateRef.current = onAutoCoordinate
     }, [onAutoCoordinate])

     const geocodeAddress = useMemo(() => fullAddress.trim(), [fullAddress])

     const geocodeEnabled =
          editMode &&
          !!form &&
          !!form.streetAddress?.trim() &&
          !!form.wardCode &&
          geocodeAddress.length >= 10

     const geocodeQuery = useGeocodeAddress(debouncedGeocodeAddress || undefined, geocodeEnabled)

     useEffect(() => {
          const timerId = window.setTimeout(() => {
               setDebouncedGeocodeAddress(geocodeEnabled ? geocodeAddress : "")
          }, 700)

          return () => {
               window.clearTimeout(timerId)
          }
     }, [geocodeAddress, geocodeEnabled])

     const geocodeStatus: GeocodeStatus = useMemo(() => {
          if (!geocodeEnabled || !debouncedGeocodeAddress) {
               return "idle"
          }

          if (geocodeQuery.isFetching) {
               return "loading"
          }

          if (geocodeQuery.isError) {
               return "error"
          }

          if (geocodeQuery.data) {
               return "success"
          }

          if (geocodeQuery.isSuccess) {
               return "not_found"
          }

          return "idle"
     }, [
          debouncedGeocodeAddress,
          geocodeEnabled,
          geocodeQuery.data,
          geocodeQuery.isError,
          geocodeQuery.isFetching,
          geocodeQuery.isSuccess,
     ])

     const geocodeErrorMessage =
          geocodeStatus === "error"
               ? "Không thể gọi dịch vụ định vị tự động. Vui lòng thử lại."
               : null

     useEffect(() => {
          if (!form || !geocodeEnabled || !debouncedGeocodeAddress) {
               return
          }

          const geocodeData = geocodeQuery.data
          if (!geocodeData) {
               return
          }

          if (manualPickAddressRef.current === debouncedGeocodeAddress) {
               return
          }

          if (lastAutoAddressRef.current === debouncedGeocodeAddress) {
               return
          }

          onAutoCoordinateRef.current({
               latitude: geocodeData.latitude,
               longitude: geocodeData.longitude,
          })
          lastAutoAddressRef.current = debouncedGeocodeAddress
     }, [debouncedGeocodeAddress, form, geocodeEnabled, geocodeQuery.data])

     const markManualCoordinatePick = () => {
          manualPickAddressRef.current = debouncedGeocodeAddress || geocodeAddress || null
     }

     const resetGeocodeTracking = () => {
          lastAutoAddressRef.current = null
          manualPickAddressRef.current = null
     }

     return {
          geocodeStatus,
          geocodeErrorMessage,
          markManualCoordinatePick,
          resetGeocodeTracking,
     }
}
