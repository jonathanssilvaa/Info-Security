"use client"

import { useEffect, useState } from "react"

export function useLeaflet() {
  const [leaflet, setLeaflet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Leaflet is already loaded
    if (typeof window !== "undefined" && (window as any).L) {
      setLeaflet((window as any).L)
      setIsLoading(false)
      return
    }

    // Load Leaflet CSS
    const cssLink = document.createElement("link")
    cssLink.rel = "stylesheet"
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    cssLink.crossOrigin = ""
    document.head.appendChild(cssLink)

    // Load Leaflet JS
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    script.crossOrigin = ""
    script.async = true

    script.onload = () => {
      if ((window as any).L) {
        setLeaflet((window as any).L)
        setIsLoading(false)
      } else {
        setError("Failed to load Leaflet")
        setIsLoading(false)
      }
    }

    script.onerror = () => {
      setError("Failed to load Leaflet script")
      setIsLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
      if (cssLink.parentNode) {
        cssLink.parentNode.removeChild(cssLink)
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return { leaflet, isLoading, error }
}
