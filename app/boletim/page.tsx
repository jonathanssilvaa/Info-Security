"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, MapPin, Calendar, Upload, User, Phone, Mail, CreditCard, X } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useAddressSearch } from "@/hooks/use-address-search"

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((mod) => ({ default: mod.LocationPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 bg-[#1a1625] rounded-2xl border border-[#2b2438] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#4aa3ff] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Carregando mapa...</p>
        </div>
      </div>
    ),
  },
)

export default function BoletimPage() {
  const [anonymous, setAnonymous] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { suggestions, searchAddress } = useAddressSearch()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        () => {
          setUserLocation([-23.5505, -46.6333])
        },
      )
    } else {
      setUserLocation([-23.5505, -46.6333])
    }
  }, [])

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedCoords({ lat, lng })
    setLocation(address)
  }

  const handleAddressChange = (value: string) => {
    setLocation(value)
    setShowAddressSuggestions(true)
    searchAddress(value)
    if (errors.location) {
      setErrors({ ...errors, location: "" })
    }
  }

  const handleSelectSuggestion = (suggestion: any) => {
    setLocation(suggestion.address)
    setSelectedCoords({ lat: suggestion.lat, lng: suggestion.lng })
    setShowAddressSuggestions(false)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!location.trim()) {
      newErrors.location = "Endereço aproximado é obrigatório"
    }

    if (!date) {
      newErrors.date = "Data é obrigatória"
    }

    if (!description.trim()) {
      newErrors.description = "Descrição detalhada é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setShowSuccess(true)
  }

  return (
    <div className="min-h-screen bg-[#0f0b1a] pb-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 pb-4">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="text-white hover:bg-[#1a1625]">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">Boletim de Ocorrência</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 space-y-6">
          <div className="relative h-48 rounded-2xl overflow-hidden border border-[#2b2438]">
            {userLocation ? (
              <LocationPicker center={userLocation} zoom={15} onLocationSelect={handleLocationSelect} />
            ) : (
              <div className="h-full bg-[#1a1625] flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-[#4aa3ff] mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground px-4">Obtendo localização...</p>
                </div>
              </div>
            )}
          </div>

          {/* Address with Search */}
          <div className="relative">
            <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Endereço aproximado
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                value={location}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => setShowAddressSuggestions(true)}
                placeholder="Toque no mapa ou digite o endereço..."
                className={`bg-[#1a1625] border-[#2b2438] text-white ${errors.location ? "border-red-500" : ""}`}
              />
              {location && (
                <button
                  type="button"
                  onClick={() => {
                    setLocation("")
                    setShowAddressSuggestions(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {showAddressSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1625] border border-[#2b2438] rounded-xl overflow-hidden z-10 shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#2b2438] transition-colors border-b border-[#2b2438] last:border-b-0"
                  >
                    <div className="font-medium truncate">{suggestion.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{suggestion.address}</div>
                  </button>
                ))}
              </div>
            )}

            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data Completo
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                if (errors.date) {
                  setErrors({ ...errors, date: "" })
                }
              }}
              className={`bg-[#1a1625] border-[#2b2438] text-white ${errors.date ? "border-red-500" : ""}`}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-white mb-2 block flex items-center gap-2">
              Descrição Detalhada da Ocorrência
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="Descreva o que aconteceu com o máximo de detalhes possível..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) {
                  setErrors({ ...errors, description: "" })
                }
              }}
              className={`bg-[#1a1625] border-[#2b2438] text-white min-h-32 ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Fotos (opcional)
            </label>
            <div className="bg-[#1a1625] border-2 border-dashed border-[#2b2438] rounded-xl p-6 text-center hover:border-[#4aa3ff] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Toque para adicionar fotos</p>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between bg-[#1a1625] rounded-2xl p-4 border border-[#2b2438]">
            <span className="text-white">Nome Dados (Opcional)</span>
            <Switch checked={!anonymous} onCheckedChange={(checked) => setAnonymous(!checked)} />
          </div>

          {!anonymous && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="bg-[#1a1625] rounded-2xl p-4 border border-[#2b2438] space-y-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dados Pessoais
                </h3>

                {/* Full Name */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Nome Completo</label>
                  <Input
                    type="text"
                    placeholder="Digite seu nome completo"
                    className="bg-[#0f0b1a] border-[#2b2438] text-white"
                    required={!anonymous}
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    CPF
                  </label>
                  <Input
                    type="text"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="bg-[#0f0b1a] border-[#2b2438] text-white"
                    required={!anonymous}
                  />
                </div>

                {/* RG */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">RG</label>
                  <Input
                    type="text"
                    placeholder="00.000.000-0"
                    maxLength={12}
                    className="bg-[#0f0b1a] border-[#2b2438] text-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </label>
                  <Input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="bg-[#0f0b1a] border-[#2b2438] text-white"
                    required={!anonymous}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="bg-[#0f0b1a] border-[#2b2438] text-white"
                    required={!anonymous}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full gradient-primary text-white btn-touch text-lg font-semibold">
            Registrar Boletim
          </Button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-[#1a1625] rounded-3xl p-8 max-w-sm w-full border border-[#2b2438]">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center">Boletim Registrado</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Protocolo: <span className="text-[#4aa3ff] font-mono">BO-2025-{Math.floor(Math.random() * 10000)}</span>
            </p>
            <Button onClick={() => setShowSuccess(false)} className="w-full gradient-primary text-white">
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
