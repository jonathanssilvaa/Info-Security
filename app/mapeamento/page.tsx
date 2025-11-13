"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Maximize2, Filter, TrendingUp } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/theme-context"
import { useTranslation } from "@/hooks/use-translation"
import { useGeolocation } from "@/hooks/use-geolocation"

const CrimeHeatmap = dynamic(
  () => import("@/components/crime-heatmap").then((mod) => ({ default: mod.CrimeHeatmap })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-[#1a1625]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#4aa3ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-sm">Carregando mapa...</p>
        </div>
      </div>
    ),
  },
)

export default function MapeamentoPage() {
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showStations, setShowStations] = useState(false)
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState<string[]>([])
  const [timePeriod, setTimePeriod] = useState<"24h" | "7d" | "30d">("7d")
  const [showStats, setShowStats] = useState(true)
  const { theme } = useTheme()
  const lightMode = theme === "light"
  const { t } = useTranslation()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { location: userLocation } = useGeolocation()

  const CRIME_TYPES = {
    roubo: { label: t("robbery"), color: "#ef4444", icon: "💰" },
    furto: { label: t("theft"), color: "#f97316", icon: "🎒" },
    assalto: { label: t("assault"), color: "#dc2626", icon: "🔫" },
    vandalismo: { label: t("vandalism"), color: "#eab308", icon: "🔨" },
    drogas: { label: t("drugs"), color: "#8b5cf6", icon: "💊" },
    violencia: { label: t("violence"), color: "#ec4899", icon: "⚠️" },
  }

  useEffect(() => {
    setSelectedCrimeTypes(Object.keys(CRIME_TYPES))
  }, [])

  const allCrimeData = userLocation
    ? [
        { lat: userLocation[0] + 0.005, lng: userLocation[1] + 0.005, intensity: 0.8, type: "roubo", time: "2h" },
        { lat: userLocation[0] - 0.003, lng: userLocation[1] + 0.007, intensity: 0.9, type: "assalto", time: "5h" },
        { lat: userLocation[0] + 0.008, lng: userLocation[1] - 0.004, intensity: 0.7, type: "furto", time: "1d" },
        { lat: userLocation[0] - 0.006, lng: userLocation[1] - 0.006, intensity: 0.6, type: "vandalismo", time: "3d" },
        { lat: userLocation[0] + 0.002, lng: userLocation[1] + 0.009, intensity: 0.85, type: "drogas", time: "12h" },
        { lat: userLocation[0] - 0.009, lng: userLocation[1] + 0.002, intensity: 0.75, type: "violencia", time: "1d" },
        { lat: userLocation[0] + 0.007, lng: userLocation[1] + 0.008, intensity: 0.65, type: "furto", time: "2d" },
        { lat: userLocation[0] - 0.004, lng: userLocation[1] - 0.008, intensity: 0.95, type: "roubo", time: "8h" },
        { lat: userLocation[0] + 0.004, lng: userLocation[1] + 0.003, intensity: 0.7, type: "assalto", time: "15h" },
        { lat: userLocation[0] - 0.007, lng: userLocation[1] + 0.005, intensity: 0.8, type: "drogas", time: "1d" },
        { lat: userLocation[0] + 0.006, lng: userLocation[1] - 0.007, intensity: 0.6, type: "vandalismo", time: "4d" },
        { lat: userLocation[0] - 0.002, lng: userLocation[1] - 0.003, intensity: 0.75, type: "furto", time: "6h" },
      ]
    : []

  const filteredCrimeData = allCrimeData.filter((crime) => selectedCrimeTypes.includes(crime.type))

  const crimeStats = Object.keys(CRIME_TYPES).map((type) => ({
    type,
    count: allCrimeData.filter((c) => c.type === type).length,
    ...CRIME_TYPES[type as keyof typeof CRIME_TYPES],
  }))

  const totalCrimes = filteredCrimeData.length

  const policeStations = userLocation
    ? [
        { name: "Delegacia Central", lat: userLocation[0], lng: userLocation[1] },
        { name: "Delegacia Norte", lat: userLocation[0] + 0.015, lng: userLocation[1] - 0.01 },
        { name: "Delegacia Sul", lat: userLocation[0] - 0.015, lng: userLocation[1] + 0.01 },
        { name: "Delegacia Leste", lat: userLocation[0] - 0.005, lng: userLocation[1] + 0.02 },
        { name: "Delegacia Oeste", lat: userLocation[0] + 0.005, lng: userLocation[1] - 0.02 },
      ]
    : []

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleCrimeType = (type: string) => {
    setSelectedCrimeTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <div className={`min-h-screen flex flex-col ${lightMode ? "bg-gray-50" : "bg-[#0f0b1a]"}`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${lightMode ? "border-gray-200 bg-white" : "border-[#2b2438]"}`}
      >
        <div className="flex items-center gap-3">
          <Link href="/home">
            <Button
              variant="ghost"
              size="icon"
              className={lightMode ? "text-gray-900 hover:bg-gray-100" : "text-white hover:bg-[#1a1625]"}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className={`text-lg font-bold ${lightMode ? "text-gray-900" : "text-white"}`}>{t("mapeamentoTitle")}</h1>
        </div>
      </div>

      {/* Controls */}
      <div
        className={`p-4 space-y-4 border-b max-h-[40vh] overflow-y-auto ${lightMode ? "border-gray-200 bg-white" : "border-[#2b2438]"}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${lightMode ? "text-gray-900" : "text-white"}`}>Mapa de Calor</span>
            <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${lightMode ? "text-gray-900" : "text-white"}`}>{t("policeStations")}</span>
            <Switch checked={showStations} onCheckedChange={setShowStations} />
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${lightMode ? "text-gray-900" : "text-white"}`}>{t("statistics")}</span>
            <Switch checked={showStats} onCheckedChange={setShowStats} />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className={`text-sm font-medium flex items-center gap-2 ${lightMode ? "text-gray-900" : "text-white"}`}
          >
            <Filter className="w-4 h-4" />
            {t("timePeriod")}
          </label>
          <div className="flex gap-2">
            {[
              { value: "24h", label: t("last24h") },
              { value: "7d", label: t("last7days") },
              { value: "30d", label: t("last30days") },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value as any)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timePeriod === period.value
                    ? "bg-gradient-to-r from-[#4aa3ff] to-[#2b6ef6] text-white"
                    : lightMode
                      ? "bg-white text-gray-700 border border-gray-300 hover:border-[#4aa3ff]"
                      : "bg-[#1a1625] text-muted-foreground border border-[#2b2438] hover:border-[#4aa3ff]"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className={`text-sm font-medium ${lightMode ? "text-gray-900" : "text-white"}`}>
            {t("crimeTypes")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(CRIME_TYPES).map(([type, info]) => (
              <button
                key={type}
                onClick={() => toggleCrimeType(type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedCrimeTypes.includes(type)
                    ? lightMode
                      ? "bg-white border-2 text-gray-900"
                      : "bg-[#1a1625] border-2 text-white"
                    : lightMode
                      ? "bg-white border border-gray-300 text-gray-500 opacity-50"
                      : "bg-[#1a1625] border border-[#2b2438] text-muted-foreground opacity-50"
                }`}
                style={{
                  borderColor: selectedCrimeTypes.includes(type) ? info.color : undefined,
                }}
              >
                <span className="text-lg">{info.icon}</span>
                <span className="text-xs font-medium">{info.label}</span>
                <span className="ml-auto text-xs font-bold">{allCrimeData.filter((c) => c.type === type).length}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div
        className={`flex-1 relative overflow-hidden ${lightMode ? "bg-gray-100" : "bg-[#1a1625]"}`}
        style={{ minHeight: "400px", height: "calc(100vh - 400px)" }}
      >
        {userLocation ? (
          <>
            <CrimeHeatmap
              center={userLocation}
              zoom={13}
              crimeData={filteredCrimeData}
              policeStations={policeStations}
              showHeatmap={showHeatmap}
              showStations={showStations}
              lightMode={lightMode}
              className="absolute inset-0"
            />

            {showStats && (
              <div
                className={`absolute top-4 left-4 backdrop-blur-sm border rounded-xl p-4 max-w-xs z-[1000] ${
                  lightMode ? "bg-white/95 border-gray-300 shadow-lg" : "bg-[#1a1625]/95 border-[#2b2438]"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-[#4aa3ff]" />
                  <h3 className={`font-semibold text-sm ${lightMode ? "text-gray-900" : "text-white"}`}>
                    {t("statistics")}
                  </h3>
                </div>
                <div className="space-y-2">
                  <div
                    className={`flex justify-between items-center pb-2 border-b ${lightMode ? "border-gray-200" : "border-[#2b2438]"}`}
                  >
                    <span className={`text-xs ${lightMode ? "text-gray-600" : "text-muted-foreground"}`}>
                      {t("total")}
                    </span>
                    <span className={`text-lg font-bold ${lightMode ? "text-gray-900" : "text-white"}`}>
                      {totalCrimes}
                    </span>
                  </div>
                  {crimeStats
                    .filter((stat) => stat.count > 0)
                    .sort((a, b) => b.count - a.count)
                    .map((stat) => (
                      <div key={stat.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                          <span className={`text-xs ${lightMode ? "text-gray-900" : "text-white"}`}>{stat.label}</span>
                        </div>
                        <span className={`text-sm font-semibold ${lightMode ? "text-gray-900" : "text-white"}`}>
                          {stat.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className={`absolute top-4 right-4 w-10 h-10 border rounded-lg flex items-center justify-center hover:border-[#4aa3ff] transition-colors z-[1000] ${
                lightMode ? "bg-white border-gray-300 shadow-lg" : "bg-[#1a1625] border-[#2b2438]"
              }`}
              aria-label="Fullscreen"
            >
              <Maximize2 className={`w-5 h-5 ${lightMode ? "text-gray-900" : "text-white"}`} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#4aa3ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={`text-sm ${lightMode ? "text-gray-900" : "text-white"}`}>{t("loading")}</p>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t space-y-3 ${lightMode ? "border-gray-200 bg-white" : "border-[#2b2438]"}`}>
        <div>
          <p className={`text-xs font-medium mb-2 ${lightMode ? "text-gray-700" : "text-muted-foreground"}`}>
            {t("intensity")}
          </p>
          <div
            className="h-3 rounded-full"
            style={{
              background: "linear-gradient(90deg, #22c55e 0%, #84cc16 20%, #eab308 40%, #f97316 70%, #ef4444 100%)",
            }}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${lightMode ? "text-gray-600" : "text-muted-foreground"}`}>{t("low")}</span>
            <span className={`text-xs ${lightMode ? "text-gray-600" : "text-muted-foreground"}`}>{t("medium")}</span>
            <span className={`text-xs ${lightMode ? "text-gray-600" : "text-muted-foreground"}`}>{t("high")}</span>
          </div>
        </div>

        <div>
          <p className={`text-xs font-medium mb-2 ${lightMode ? "text-gray-700" : "text-muted-foreground"}`}>
            {t("crimeTypes")}
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CRIME_TYPES).map(([type, info]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                <span className={`text-xs ${lightMode ? "text-gray-900" : "text-white"}`}>{info.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
