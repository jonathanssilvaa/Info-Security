"use client"

import { useState, useCallback, useRef } from "react"

interface AddressSuggestion {
  id: string
  name: string
  lat: number
  lng: number
  address: string
}

export function useAddressSearch() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const searchAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        // Usar Nominatim (OpenStreetMap) para buscar endereços
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=br&limit=5`,
          {
            headers: {
              Accept: "application/json",
            },
          },
        )

        if (!response.ok) throw new Error("Erro na busca")

        const results = await response.json()

        const formatted = results.map((result: any, index: number) => ({
          id: `${result.lat}-${result.lon}-${index}`,
          name: result.address?.road || result.name || "",
          lat: Number.parseFloat(result.lat),
          lng: Number.parseFloat(result.lon),
          address: result.display_name,
        }))

        setSuggestions(formatted)
      } catch (error) {
        console.error("[v0] Erro ao buscar endereços:", error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300) // Debounce de 300ms
  }, [])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
  }, [])

  return {
    suggestions,
    loading,
    searchAddress,
    clearSuggestions,
  }
}
