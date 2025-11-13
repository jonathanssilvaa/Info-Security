"use client"

import { useEffect, useRef, useState } from "react"
import { useLeaflet } from "@/hooks/use-leaflet"

interface CrimeData {
  lat: number
  lng: number
  intensity: number
  type?: string
  time?: string
}

interface PoliceStation {
  name: string
  lat: number
  lng: number
}

interface CrimeHeatmapProps {
  center: [number, number]
  zoom?: number
  crimeData: CrimeData[]
  policeStations: PoliceStation[]
  showHeatmap: boolean
  showStations: boolean
  lightMode?: boolean
  className?: string
}

export function CrimeHeatmap({
  center,
  zoom = 13,
  crimeData,
  policeStations,
  showHeatmap,
  showStations,
  lightMode = false,
  className = "",
}: CrimeHeatmapProps) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const heatLayerRef = useRef<any>(null)
  const stationLayerRef = useRef<any>(null)
  const crimeMarkersRef = useRef<any>(null)
  const { leaflet: L, isLoading: isLeafletLoading, error } = useLeaflet()
  const [heatPluginLoaded, setHeatPluginLoaded] = useState(false)
  const [containerReady, setContainerReady] = useState(false)

  useEffect(() => {
    if (!L || heatPluginLoaded) return

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"
    script.async = true
    script.onload = () => setHeatPluginLoaded(true)
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [L, heatPluginLoaded])

  useEffect(() => {
    if (!containerRef.current) return

    const checkDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect && rect.width > 0 && rect.height > 0) {
        console.log("[v0] Container dimensions ready:", rect.width, "x", rect.height)
        setContainerReady(true)
        return true
      }
      return false
    }

    if (checkDimensions()) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          console.log("[v0] Container resized to:", entry.contentRect.width, "x", entry.contentRect.height)
          setContainerReady(true)
        }
      }
    })

    resizeObserver.observe(containerRef.current)

    const timeout = setTimeout(() => {
      if (checkDimensions()) {
        console.log("[v0] Container ready via timeout")
      }
    }, 100)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (!L || !heatPluginLoaded || !containerRef.current || mapRef.current || !containerReady) return

    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      console.log("[v0] Container not ready, dimensions:", rect.width, "x", rect.height)
      return
    }

    console.log("[v0] Initializing map with dimensions:", rect.width, "x", rect.height)

    let map: any

    try {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      })

      const tileUrl = lightMode
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

      L.tileLayer(tileUrl, {
        maxZoom: 19,
      }).addTo(map)

      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map)

      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `
          <div class="relative">
            <div class="w-4 h-4 bg-[#ef4444] rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <div class="absolute inset-0 w-4 h-4 bg-[#ef4444] rounded-full animate-ping opacity-75"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      L.marker(center, { icon: userIcon }).addTo(map)

      mapRef.current = map

      setTimeout(() => {
        if (map) {
          map.invalidateSize()
          console.log("[v0] Map size invalidated")
        }
      }, 100)
    } catch (err) {
      console.error("[v0] Error initializing map:", err)
    }

    return () => {
      if (map) {
        map.remove()
        mapRef.current = null
      }
    }
  }, [L, heatPluginLoaded, center, zoom, containerReady, lightMode])

  useEffect(() => {
    if (!mapRef.current || !L) return

    const tileUrl = lightMode
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer)
      }
    })

    L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(mapRef.current)
  }, [lightMode, L])

  useEffect(() => {
    if (!mapRef.current || !L || !heatPluginLoaded) return

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    if (showHeatmap && crimeData.length > 0) {
      try {
        const heatData: [number, number, number][] = crimeData.map((crime) => [crime.lat, crime.lng, crime.intensity])

        console.log("[v0] Creating heatmap with", heatData.length, "points")

        const heatLayer = (L as any).heatLayer(heatData, {
          radius: 40,
          blur: 50,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.0: "#22c55e",
            0.2: "#84cc16",
            0.4: "#eab308",
            0.7: "#f97316",
            1.0: "#ef4444",
          },
        })

        heatLayer.addTo(mapRef.current)
        heatLayerRef.current = heatLayer
        console.log("[v0] Heatmap added successfully")
      } catch (err) {
        console.error("[v0] Error creating heatmap:", err)
      }
    }
  }, [showHeatmap, crimeData, L, heatPluginLoaded])

  useEffect(() => {
    if (!mapRef.current || !L || !heatPluginLoaded) return

    if (stationLayerRef.current) {
      mapRef.current.removeLayer(stationLayerRef.current)
      stationLayerRef.current = null
    }

    if (showStations && policeStations.length > 0) {
      const stationLayer = L.layerGroup()

      policeStations.forEach((station: PoliceStation) => {
        const icon = L.divIcon({
          className: "police-station-marker",
          html: `
            <div class="w-12 h-12 bg-[#ef4444] rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5z" />
              </svg>
            </div>
          `,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        })

        const marker = L.marker([station.lat, station.lng], { icon })
        marker.bindPopup(
          `<div class="text-center p-2">
            <p class="font-semibold text-sm">${station.name}</p>
          </div>`,
          {
            className: "custom-popup",
          },
        )
        marker.addTo(stationLayer)
      })

      stationLayer.addTo(mapRef.current)
      stationLayerRef.current = stationLayer
    }
  }, [showStations, policeStations, L, heatPluginLoaded])

  useEffect(() => {
    if (!mapRef.current || !L || !heatPluginLoaded) return

    if (crimeMarkersRef.current) {
      mapRef.current.removeLayer(crimeMarkersRef.current)
      crimeMarkersRef.current = null
    }

    if (crimeData.length > 0) {
      const markersLayer = L.layerGroup()

      const crimeColors: Record<string, string> = {
        roubo: "#ef4444",
        furto: "#f97316",
        assalto: "#dc2626",
        vandalismo: "#eab308",
        drogas: "#8b5cf6",
        violencia: "#ec4899",
      }

      crimeData.forEach((crime: CrimeData) => {
        const color = crime.type ? crimeColors[crime.type] || "#4aa3ff" : "#4aa3ff"

        const icon = L.divIcon({
          className: "crime-marker",
          html: `
            <div class="relative">
              <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform" 
                   style="background-color: ${color}; opacity: ${crime.intensity}">
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        const marker = L.marker([crime.lat, crime.lng], { icon })

        const crimeTypeLabels: Record<string, string> = {
          roubo: "Roubo",
          furto: "Furto",
          assalto: "Assalto",
          vandalismo: "Vandalismo",
          drogas: "Drogas",
          violencia: "Violência",
        }

        marker.bindPopup(
          `<div class="p-3">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
              <p class="font-semibold text-sm">${crime.type ? crimeTypeLabels[crime.type] : "Ocorrência"}</p>
            </div>
            ${crime.time ? `<p class="text-xs text-gray-400">Há ${crime.time}</p>` : ""}
            <p class="text-xs text-gray-400 mt-1">Intensidade: ${Math.round(crime.intensity * 100)}%</p>
          </div>`,
          {
            className: "custom-popup",
          },
        )
        marker.addTo(markersLayer)
      })

      markersLayer.addTo(mapRef.current)
      crimeMarkersRef.current = markersLayer
    }
  }, [crimeData, L, heatPluginLoaded])

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
      <div className="relative w-full h-full min-h-[400px]">
        <div ref={containerRef} className={`w-full h-full min-h-[400px] ${className}`} />
        {(isLeafletLoading || !heatPluginLoaded || !containerReady) && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${lightMode ? "bg-gray-100" : "bg-[#1a1625]"}`}
          >
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className={`text-xs ${lightMode ? "text-gray-700" : "text-muted-foreground"}`}>Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .leaflet-container {
          background: ${lightMode ? "#f3f4f6" : "#1a1625"};
        }
        .user-location-marker,
        .police-station-marker,
        .crime-marker {
          background: transparent;
          border: none;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: ${lightMode ? "#ffffff" : "#1a1625"};
          color: ${lightMode ? "#111827" : "#ffffff"};
          border: 1px solid ${lightMode ? "#d1d5db" : "#4aa3ff"};
          border-radius: 8px;
        }
        .custom-popup .leaflet-popup-tip {
          background: ${lightMode ? "#ffffff" : "#1a1625"};
          border: 1px solid ${lightMode ? "#d1d5db" : "#4aa3ff"};
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: none !important;
        }
        .leaflet-control-zoom a {
          background: ${lightMode ? "#ffffff" : "#1a1625"} !important;
          border: 1px solid ${lightMode ? "#d1d5db" : "#2b2438"} !important;
          color: ${lightMode ? "#111827" : "#ffffff"} !important;
          width: 40px !important;
          height: 40px !important;
          line-height: 40px !important;
          border-radius: 8px !important;
          margin-bottom: 8px !important;
        }
        .leaflet-control-zoom a:hover {
          border-color: #ef4444 !important;
        }
      `}</style>
    </>
  )
}
