"use client"

import { useState, useEffect, useRef } from "react"
import { geolocationManager } from "@/utils/geolocation-manager"

export function useGeolocation() {
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple loads with ref
    if (hasLoadedRef.current) {
      return
    }
    hasLoadedRef.current = true

    let isMounted = true

    geolocationManager
      .getLocation()
      .then((loc) => {
        if (isMounted) {
          setLocation(loc)
          console.log("[v0] Location set:", loc)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message)
          console.error("[v0] Geolocation hook error:", err)
        }
      })

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - runs only once

  return { location, error }
}
