"use client"

import { useEffect, useRef, useState } from "react"
import { useLeaflet } from "@/hooks/use-leaflet"

interface LocationPickerProps {
  center: [number, number]
  zoom?: number
  onLocationSelect: (lat: number, lng: number, address: string) => void
  className?: string
}

export function LocationPicker({ center, zoom = 15, onLocationSelect, className = "" }: LocationPickerProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { leaflet: L, isLoading: isLeafletLoading, error } = useLeaflet()

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return

    let map: any

    try {
      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Initialize map
      map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false,
      })

      // Add tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map)

      // Create custom marker icon
      const markerIcon = L.divIcon({
        className: "location-marker",
        html: `
          <div class="relative">
            <svg class="w-12 h-12 text-[#4aa3ff] drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div class="absolute top-0 left-0 w-12 h-12 animate-ping opacity-75">
              <svg class="w-12 h-12 text-[#4aa3ff]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
      })

      // Add click handler
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }

        // Add new marker
        const marker = L.marker([lat, lng], { icon: markerIcon })
        marker.addTo(map)
        markerRef.current = marker

        // Reverse geocode
        setIsLoading(true)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          )
          const data = await response.json()
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          onLocationSelect(lat, lng, address)
        } catch (error) {
          console.error("Geocoding error:", error)
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        } finally {
          setIsLoading(false)
        }
      })

      mapRef.current = map
    } catch (err) {
      console.error("Error initializing map:", err)
    }

    return () => {
      if (map) {
        map.remove()
        mapRef.current = null
      }
    }
  }, [L, center, zoom, onLocationSelect])

  if (error) {
    return (
      <div className="w-full h-full bg-[#1a1625] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-sm">Erro ao carregar o mapa</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative w-full h-full">
        <div ref={containerRef} className={`w-full h-full ${className}`} />
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 border-4 border-[#4aa3ff] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isLeafletLoading && (
          <div className="absolute inset-0 bg-[#1a1625] flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#4aa3ff] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .leaflet-container {
          background: #1a1625;
        }
        .location-marker {
          background: transparent;
          border: none;
        }
        .leaflet-control-zoom a {
          background: #1a1625 !important;
          border: 1px solid #2b2438 !important;
          color: white !important;
        }
        .leaflet-control-zoom a:hover {
          border-color: #4aa3ff !important;
        }
      `}</style>
    </>
  )
}
