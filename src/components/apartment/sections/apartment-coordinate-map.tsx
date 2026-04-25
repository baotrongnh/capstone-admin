"use client"

import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet"
import { useEffect, useRef } from "react"

type ApartmentCoordinateMapProps = {
     latitude?: number
     longitude?: number
     disabled?: boolean
     onPickCoordinate: (value: { latitude: number; longitude: number }) => void
}

// Trung tâm TP HCM
const DEFAULT_LAT = 10.7769
const DEFAULT_LNG = 106.7009

const roundCoordinate = (value: number) => Number(value.toFixed(6))

const normalizeLeafletLayering = (map: LeafletMap) => {
     // Keep Leaflet internal layers under form overlays (select/popover/dialog).
     map.getContainer().style.zIndex = "0"

     const panes = map.getPanes()
     if (panes.tilePane) panes.tilePane.style.zIndex = "1"
     if (panes.overlayPane) panes.overlayPane.style.zIndex = "2"
     if (panes.shadowPane) panes.shadowPane.style.zIndex = "3"
     if (panes.markerPane) panes.markerPane.style.zIndex = "4"
     if (panes.tooltipPane) panes.tooltipPane.style.zIndex = "5"
     if (panes.popupPane) panes.popupPane.style.zIndex = "6"

     const controls = map.getContainer().querySelectorAll(".leaflet-top, .leaflet-bottom")
     controls.forEach((control) => {
          (control as HTMLElement).style.zIndex = "7"
     })
}

const MAP_INTERACTIONS = ["dragging", "scrollWheelZoom", "doubleClickZoom", "boxZoom", "keyboard", "touchZoom"] as const

export function ApartmentCoordinateMap({
     latitude,
     longitude,
     disabled,
     onPickCoordinate,
}: ApartmentCoordinateMapProps) {
     const mapContainerRef = useRef<HTMLDivElement | null>(null)
     const mapRef = useRef<LeafletMap | null>(null)
     const markerRef = useRef<LeafletMarker | null>(null)
     const onPickRef = useRef(onPickCoordinate)
     const disabledRef = useRef(disabled)
     useEffect(() => {
          onPickRef.current = onPickCoordinate
          disabledRef.current = disabled
     }, [onPickCoordinate, disabled])

     const lat = latitude || DEFAULT_LAT
     const lng = longitude || DEFAULT_LNG

     // Track latest coords for async init to read
     const coordRef = useRef({ lat, lng })
     useEffect(() => {
          coordRef.current = { lat, lng }
     }, [lat, lng])

     // Initialize map once
     useEffect(() => {
          let disposed = false

          const init = async () => {
               if (!mapContainerRef.current || mapRef.current) return

               const L = await import("leaflet")
               if (disposed || !mapContainerRef.current || mapRef.current) return

               const map = L.map(mapContainerRef.current, {
                    zoomControl: true,
                    attributionControl: true,
               }).setView([coordRef.current.lat, coordRef.current.lng], 15)

               normalizeLeafletLayering(map)

               L.tileLayer(`https://maps.vietmap.vn/api/tm/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_VIETMAP_KEY}`, {
                    maxZoom: 19
               }).addTo(map)

               const marker = L.marker([coordRef.current.lat, coordRef.current.lng], {
                    draggable: !disabledRef.current,
                    icon: L.icon({
                         iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                         iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                         shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                         iconSize: [25, 41],
                         iconAnchor: [12, 41],
                    }),
               }).addTo(map).bindPopup("Có thể di chuyển vị trí cho chính xác ngoài thực tế.")

               const handlePick = (latlng: { lat: number; lng: number }) => {
                    onPickRef.current({
                         latitude: roundCoordinate(latlng.lat),
                         longitude: roundCoordinate(latlng.lng),
                    })
               }

               marker.on("dragend", () => handlePick(marker.getLatLng()))
               map.on("click", (e) => {
                    if (disabledRef.current) return
                    marker.setLatLng(e.latlng)
                    handlePick(e.latlng)
               })

               mapRef.current = map
               markerRef.current = marker

               // Ensure tiles render correctly
               setTimeout(() => map.invalidateSize(), 250)

               // Auto-resize when container changes
               const observer = new ResizeObserver(() => map.invalidateSize())
               observer.observe(mapContainerRef.current!)

               // Extend cleanup to include observer
               const originalCleanup = () => observer.disconnect()
               ;(map as unknown as { _resizeCleanup: () => void })._resizeCleanup = originalCleanup
          }

          void init()

          return () => {
               disposed = true
               const map = mapRef.current
               if (map) {
                    ;(map as unknown as { _resizeCleanup?: () => void })._resizeCleanup?.()
                    map.remove()
               }
               mapRef.current = null
               markerRef.current = null
          }
     }, [])

     // Sync marker + view when coordinates change
     useEffect(() => {
          const marker = markerRef.current
          const map = mapRef.current
          if (!marker || !map) return

          const next: [number, number] = [lat, lng]
          marker.setLatLng(next)

          if (!map.getBounds().pad(-0.25).contains(next)) {
               map.panTo(next)
          }
     }, [lat, lng])

     // Toggle map interactions when disabled changes
     useEffect(() => {
          const marker = markerRef.current
          const map = mapRef.current
          if (!marker || !map) return

          marker.dragging?.[disabled ? "disable" : "enable"]()

          const method = disabled ? "disable" : "enable"
          for (const interaction of MAP_INTERACTIONS) {
               map[interaction]?.[method]()
          }
     }, [disabled])

     return (
          <div className="relative z-0 isolate overflow-hidden rounded-lg border">
               <div
                    ref={mapContainerRef}
                    className="h-72 w-full"
                    aria-label="Bản đồ chọn tọa độ căn hộ"
               />
          </div>
     )
}
