"use client"

import { useEffect, useMemo, useRef } from "react"
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet"

type ApartmentCoordinateMapProps = {
     latitude?: number
     longitude?: number
     disabled?: boolean
     onPickCoordinate: (value: { latitude: number; longitude: number }) => void
}

//Trung tâm TP HCM
const DEFAULT_COORDINATE = {
     latitude: 10.7769,
     longitude: 106.7009,
}

const normalizeCoordinate = (value: number | undefined, fallback: number) => {
     if (typeof value !== "number" || !Number.isFinite(value)) {
          return fallback
     }
     return value
}

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
     const initialCoordinateRef = useRef(DEFAULT_COORDINATE)
     const disabledRef = useRef(disabled)

     onPickRef.current = onPickCoordinate
     disabledRef.current = disabled

     const activeCoordinate = useMemo(
          () => ({
               latitude: normalizeCoordinate(latitude, DEFAULT_COORDINATE.latitude),
               longitude: normalizeCoordinate(longitude, DEFAULT_COORDINATE.longitude),
          }),
          [latitude, longitude],
     )

     initialCoordinateRef.current = activeCoordinate

     useEffect(() => {
          let isDisposed = false

          const initializeMap = async () => {
               if (!mapContainerRef.current || mapRef.current) {
                    return
               }

               const L = await import("leaflet")

               if (isDisposed || !mapContainerRef.current || mapRef.current) {
                    return
               }

               const markerIcon = L.icon({
                    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
               })

               const map = L.map(mapContainerRef.current, {
                    zoomControl: true,
                    attributionControl: true,
               }).setView(
                    [initialCoordinateRef.current.latitude, initialCoordinateRef.current.longitude],
                    15,
               )

               normalizeLeafletLayering(map)

               L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
               }).addTo(map)

               const marker = L.marker(
                    [initialCoordinateRef.current.latitude, initialCoordinateRef.current.longitude],
                    {
                         draggable: !disabledRef.current,
                         icon: markerIcon,
                    },
               ).addTo(map).bindPopup('Có thể di chuyển vị trí cho chính xác ngoài thực tế.')

               marker.on("dragend", () => {
                    const position = marker.getLatLng()
                    onPickRef.current({
                         latitude: roundCoordinate(position.lat),
                         longitude: roundCoordinate(position.lng),
                    })
               })

               map.on("click", (event) => {
                    if (disabledRef.current) return

                    marker.setLatLng(event.latlng)
                    onPickRef.current({
                         latitude: roundCoordinate(event.latlng.lat),
                         longitude: roundCoordinate(event.latlng.lng),
                    })
               })

               mapRef.current = map
               markerRef.current = marker

               // Ensure map tiles are laid out correctly after first render.
               requestAnimationFrame(() => {
                    map.invalidateSize()
               })
               setTimeout(() => {
                    map.invalidateSize()
               }, 250)
          }

          void initializeMap()

          return () => {
               isDisposed = true
               markerRef.current = null
               mapRef.current?.remove()
               mapRef.current = null
          }
     }, [])

     useEffect(() => {
          const marker = markerRef.current
          const map = mapRef.current
          if (!marker || !map) return

          const nextCoordinate: [number, number] = [
               activeCoordinate.latitude,
               activeCoordinate.longitude,
          ]

          marker.setLatLng(nextCoordinate)

          if (!map.getBounds().pad(-0.25).contains(nextCoordinate)) {
               map.panTo(nextCoordinate)
          }
     }, [activeCoordinate.latitude, activeCoordinate.longitude])

     useEffect(() => {
          const marker = markerRef.current
          const map = mapRef.current
          if (!marker || !map) return

          marker.dragging?.[disabled ? "disable" : "enable"]()

          if (disabled) {
               map.dragging.disable()
               map.scrollWheelZoom.disable()
               map.doubleClickZoom.disable()
               map.boxZoom.disable()
               map.keyboard.disable()
               map.touchZoom.disable()
          } else {
               map.dragging.enable()
               map.scrollWheelZoom.enable()
               map.doubleClickZoom.enable()
               map.boxZoom.enable()
               map.keyboard.enable()
               map.touchZoom.enable()
          }
     }, [disabled])

     useEffect(() => {
          const map = mapRef.current
          const container = mapContainerRef.current
          if (!map || !container || typeof ResizeObserver === "undefined") return

          const observer = new ResizeObserver(() => {
               map.invalidateSize()
          })

          observer.observe(container)

          return () => {
               observer.disconnect()
          }
     }, [activeCoordinate.latitude, activeCoordinate.longitude])

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
