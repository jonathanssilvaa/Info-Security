"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Sparkles, Download, Share2, RefreshCw, AlertCircle, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface PortraitData {
  sex: "masculino" | "feminino" | ""
  age: string
  skinTone: string
  faceShape: string
  hairColor: string
  hairLength: string
  hairStyle: string
  eyeColor: string
  eyeShape: string
  noseShape: string
  mouthShape: string
  facialHair: string
  build: string
  height: string
  distinctiveFeatures: string
  clothing: string
  location: string
}

export default function RetratoFaladoPage() {
  const [generating, setGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<PortraitData>({
    sex: "",
    age: "",
    skinTone: "",
    faceShape: "",
    hairColor: "",
    hairLength: "",
    hairStyle: "",
    eyeColor: "",
    eyeShape: "",
    noseShape: "",
    mouthShape: "",
    facialHair: "",
    build: "",
    height: "",
    distinctiveFeatures: "",
    clothing: "",
    location: "",
  })

  const handleInputChange = (field: keyof PortraitData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" })
    }
  }

  const validateRequiredFields = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.sex) newErrors.sex = "Sexo é obrigatório"
    if (!formData.skinTone) newErrors.skinTone = "Tom de pele é obrigatório"
    if (!formData.faceShape) newErrors.faceShape = "Formato do rosto é obrigatório"
    if (!formData.eyeColor) newErrors.eyeColor = "Cor dos olhos é obrigatória"
    if (!formData.eyeShape) newErrors.eyeShape = "Formato dos olhos é obrigatório"
    if (!formData.noseShape) newErrors.noseShape = "Formato do nariz é obrigatório"
    if (!formData.mouthShape) newErrors.mouthShape = "Formato da boca é obrigatório"

    setFieldErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildPrompt = (): string => {
    const parts: string[] = []

    if (formData.sex) parts.push(`${formData.sex} person`)
    if (formData.age) parts.push(`approximately ${formData.age} years old`)
    if (formData.skinTone) parts.push(`${formData.skinTone} skin tone`)
    if (formData.faceShape) parts.push(`${formData.faceShape} face shape`)
    if (formData.hairColor && formData.hairLength) {
      parts.push(`${formData.hairLength} ${formData.hairColor} hair`)
    }
    if (formData.hairStyle) parts.push(`${formData.hairStyle} hairstyle`)
    if (formData.eyeColor) parts.push(`${formData.eyeColor} eyes`)
    if (formData.eyeShape) parts.push(`${formData.eyeShape} eye shape`)
    if (formData.noseShape) parts.push(`${formData.noseShape} nose`)
    if (formData.mouthShape) parts.push(`${formData.mouthShape} mouth`)
    if (formData.facialHair && formData.sex === "masculino") parts.push(formData.facialHair)
    if (formData.build) parts.push(`${formData.build} build`)
    if (formData.height) parts.push(`${formData.height} height`)
    if (formData.distinctiveFeatures) parts.push(formData.distinctiveFeatures)
    if (formData.clothing) parts.push(`wearing ${formData.clothing}`)

    return `Professional police sketch portrait, realistic facial features, front-facing view, neutral expression, high detail, ${parts.join(", ")}, photorealistic style, clear facial details`
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!validateRequiredFields()) {
      setError("Por favor, preencha todos os campos obrigatórios marcados com *")
      return
    }

    setGenerating(true)
    setGenerationProgress(0)

    try {
      const prompt = buildPrompt()
      console.log("[v0] Generated prompt:", prompt)

      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch("/api/generate-portrait", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, formData }),
      })

      clearInterval(progressInterval)

      console.log("[v0] API Response status:", response.status)
      console.log("[v0] API Response ok:", response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] API Error response:", errorData)
        throw new Error(errorData.error || `Erro ao gerar retrato (Status: ${response.status})`)
      }

      const data = await response.json()
      console.log("[v0] Response data received:", { success: data.success, hasImageUrl: !!data.imageUrl })

      setGenerationProgress(100)

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl)
        setSuccessMessage("Retrato gerado com sucesso!")
      } else {
        throw new Error(data.error || "Resposta inválida do servidor")
      }
    } catch (err: any) {
      console.error("[v0] Error generating portrait:", err.message)
      console.error("[v0] Full error:", err)
      setError(
        err.message ||
          "Não foi possível gerar o retrato. Verifique se a chave da API está configurada e tente novamente.",
      )
      setGenerationProgress(0)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `retrato-falado-infosecurity-${timestamp}.png`

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setSuccessMessage("Retrato baixado com sucesso!")
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleShare = async () => {
    if (!generatedImage) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Retrato Falado - Info Security",
          text: "Retrato gerado pelo sistema Info Security de identificação criminal",
          url: window.location.href,
        })
        setSuccessMessage("Compartilhado com sucesso!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (err) {
        console.log("[v0] Share cancelled or failed:", err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        setSuccessMessage("Link copiado para a área de transferência!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (err) {
        setError("Não foi possível compartilhar")
      }
    }
  }

  const handleReset = () => {
    setGeneratedImage(null)
    setError(null)
    setSuccessMessage(null)
    setGenerationProgress(0)
  }

  if (generatedImage) {
    return (
      <div className="min-h-screen bg-[#0f0b1a] p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" className="text-white" onClick={handleReset}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-xl font-bold text-white">Retrato Gerado</h1>
          </div>

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-500">{successMessage}</p>
            </div>
          )}

          <div className="bg-[#1a1625] border border-[#2b2438] rounded-2xl p-6 mb-6">
            <div className="relative aspect-square w-full mb-4 rounded-xl overflow-hidden bg-[#0f0b1a] border border-[#2b2438]">
              <Image src={generatedImage || "/logo.png"} alt="Retrato Falado Gerado" fill className="object-cover" />
            </div>

            <div className="bg-[#0f0b1a] border border-[#2b2438] rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-white font-semibold mb-1">Retrato Gerado por IA</p>
                  <p className="text-xs text-muted-foreground">
                    Este retrato foi gerado com base nas características fornecidas. Pode ser usado para fins de
                    identificação e investigação criminal.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleDownload}
                className="bg-[#2b2438] hover:bg-[#3a3147] text-white flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar
              </Button>
              <Button
                onClick={handleShare}
                className="bg-[#2b2438] hover:bg-[#3a3147] text-white flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>

          <Button
            onClick={handleReset}
            className="w-full gradient-primary text-white btn-touch text-lg font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Gerar Novo Retrato
          </Button>

          <Link href="/home">
            <Button variant="ghost" className="w-full mt-4 text-white">
              Voltar ao Menu
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0b1a] p-6 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">Retrato Falado (IA)</h1>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {generating && (
          <div className="bg-[#1a1625] border border-[#2b2438] rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">Gerando Retrato...</p>
                <p className="text-xs text-muted-foreground">A IA está processando as características fornecidas</p>
              </div>
            </div>

            <div className="w-full bg-[#0f0b1a] rounded-full h-2 overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-300 ease-out"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">{generationProgress}% concluído</p>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <Label className="text-sm text-white mb-3 block">
              Sexo <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange("sex", "masculino")}
                className={`bg-[#1a1625] border rounded-xl p-4 text-white transition-colors ${
                  formData.sex === "masculino"
                    ? "border-[#ef4444] bg-[#ef4444]/10"
                    : "border-[#2b2438] hover:border-[#ef4444]/50"
                } ${fieldErrors.sex ? "border-red-500" : ""}`}
              >
                Masculino
              </button>
              <button
                type="button"
                onClick={() => handleInputChange("sex", "feminino")}
                className={`bg-[#1a1625] border rounded-xl p-4 text-white transition-colors ${
                  formData.sex === "feminino"
                    ? "border-[#ef4444] bg-[#ef4444]/10"
                    : "border-[#2b2438] hover:border-[#ef4444]/50"
                } ${fieldErrors.sex ? "border-red-500" : ""}`}
              >
                Feminino
              </button>
            </div>
            {fieldErrors.sex && <p className="text-xs text-red-500 mt-1">{fieldErrors.sex}</p>}
          </div>

          <div>
            <Label htmlFor="age" className="text-sm text-white mb-2 block">
              Idade Aproximada
            </Label>
            <Input
              id="age"
              type="text"
              placeholder="Ex: 25-30 anos"
              value={formData.age}
              onChange={(e) => handleInputChange("age", e.target.value)}
              className="bg-[#1a1625] border-[#2b2438] text-white placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="skinTone" className="text-sm text-white mb-2 block">
              Tom de Pele <span className="text-red-500">*</span>
            </Label>
            <select
              id="skinTone"
              value={formData.skinTone}
              onChange={(e) => handleInputChange("skinTone", e.target.value)}
              className={`w-full bg-[#1a1625] border text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444] ${
                fieldErrors.skinTone ? "border-red-500" : "border-[#2b2438]"
              }`}
            >
              <option value="">Selecione...</option>
              <option value="muito clara">Muito Clara</option>
              <option value="clara">Clara</option>
              <option value="média">Média</option>
              <option value="morena">Morena</option>
              <option value="escura">Escura</option>
              <option value="muito escura">Muito Escura</option>
            </select>
            {fieldErrors.skinTone && <p className="text-xs text-red-500 mt-1">{fieldErrors.skinTone}</p>}
          </div>

          <div>
            <Label htmlFor="faceShape" className="text-sm text-white mb-2 block">
              Formato do Rosto <span className="text-red-500">*</span>
            </Label>
            <select
              id="faceShape"
              value={formData.faceShape}
              onChange={(e) => handleInputChange("faceShape", e.target.value)}
              className={`w-full bg-[#1a1625] border text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444] ${
                fieldErrors.faceShape ? "border-red-500" : "border-[#2b2438]"
              }`}
            >
              <option value="">Selecione...</option>
              <option value="oval">Oval</option>
              <option value="redondo">Redondo</option>
              <option value="quadrado">Quadrado</option>
              <option value="triangular">Triangular</option>
              <option value="alongado">Alongado</option>
              <option value="coração">Coração</option>
            </select>
            {fieldErrors.faceShape && <p className="text-xs text-red-500 mt-1">{fieldErrors.faceShape}</p>}
          </div>

          <div className="space-y-4 bg-[#1a1625] border border-[#2b2438] rounded-xl p-4">
            <h3 className="text-white font-semibold">Cabelo</h3>

            <div>
              <Label htmlFor="hairColor" className="text-sm text-white mb-2 block">
                Cor do Cabelo
              </Label>
              <select
                id="hairColor"
                value={formData.hairColor}
                onChange={(e) => handleInputChange("hairColor", e.target.value)}
                className="w-full bg-[#0f0b1a] border border-[#2b2438] text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444]"
              >
                <option value="">Selecione...</option>
                <option value="preto">Preto</option>
                <option value="castanho escuro">Castanho Escuro</option>
                <option value="castanho">Castanho</option>
                <option value="castanho claro">Castanho Claro</option>
                <option value="loiro">Loiro</option>
                <option value="ruivo">Ruivo</option>
                <option value="grisalho">Grisalho</option>
                <option value="branco">Branco</option>
                <option value="colorido">Colorido (tingido)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="hairLength" className="text-sm text-white mb-2 block">
                Comprimento
              </Label>
              <select
                id="hairLength"
                value={formData.hairLength}
                onChange={(e) => handleInputChange("hairLength", e.target.value)}
                className="w-full bg-[#0f0b1a] border border-[#2b2438] text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444]"
              >
                <option value="">Selecione...</option>
                <option value="careca">Careca</option>
                <option value="muito curto">Muito Curto</option>
                <option value="curto">Curto</option>
                <option value="médio">Médio</option>
                <option value="longo">Longo</option>
                <option value="muito longo">Muito Longo</option>
              </select>
            </div>

            <div>
              <Label htmlFor="hairStyle" className="text-sm text-white mb-2 block">
                Estilo
              </Label>
              <Input
                id="hairStyle"
                type="text"
                placeholder="Ex: liso, ondulado, cacheado, crespo, raspado"
                value={formData.hairStyle}
                onChange={(e) => handleInputChange("hairStyle", e.target.value)}
                className="bg-[#0f0b1a] border-[#2b2438] text-white placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-4 bg-[#1a1625] border border-[#2b2438] rounded-xl p-4">
            <h3 className="text-white font-semibold">Olhos</h3>

            <div>
              <Label htmlFor="eyeColor" className="text-sm text-white mb-2 block">
                Cor dos Olhos <span className="text-red-500">*</span>
              </Label>
              <select
                id="eyeColor"
                value={formData.eyeColor}
                onChange={(e) => handleInputChange("eyeColor", e.target.value)}
                className={`w-full bg-[#1a1625] border text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444] ${
                  fieldErrors.eyeColor ? "border-red-500" : "border-[#2b2438]"
                }`}
              >
                <option value="">Selecione...</option>
                <option value="castanhos escuros">Castanhos Escuros</option>
                <option value="castanhos">Castanhos</option>
                <option value="castanhos claros">Castanhos Claros</option>
                <option value="verdes">Verdes</option>
                <option value="azuis">Azuis</option>
                <option value="cinzas">Cinzas</option>
                <option value="mel">Mel</option>
              </select>
              {fieldErrors.eyeColor && <p className="text-xs text-red-500 mt-1">{fieldErrors.eyeColor}</p>}
            </div>

            <div>
              <Label htmlFor="eyeShape" className="text-sm text-white mb-2 block">
                Formato dos Olhos <span className="text-red-500">*</span>
              </Label>
              <select
                id="eyeShape"
                value={formData.eyeShape}
                onChange={(e) => handleInputChange("eyeShape", e.target.value)}
                className={`w-full bg-[#1a1625] border text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444] ${
                  fieldErrors.eyeShape ? "border-red-500" : "border-[#2b2438]"
                }`}
              >
                <option value="">Selecione...</option>
                <option value="amendoados">Amendoados</option>
                <option value="redondos">Redondos</option>
                <option value="puxados">Puxados</option>
                <option value="caídos">Caídos</option>
                <option value="encapuzados">Encapuzados</option>
              </select>
              {fieldErrors.eyeShape && <p className="text-xs text-red-500 mt-1">{fieldErrors.eyeShape}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="noseShape" className="text-sm text-white mb-2 block">
              Formato do Nariz <span className="text-red-500">*</span>
            </Label>
            <select
              id="noseShape"
              value={formData.noseShape}
              onChange={(e) => handleInputChange("noseShape", e.target.value)}
              className={`w-full bg-[#1a1625] border text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444] ${
                fieldErrors.noseShape ? "border-red-500" : "border-[#2b2438]"
              }`}
            >
              <option value="">Selecione...</option>
              <option value="fino">Fino</option>
              <option value="médio">Médio</option>
              <option value="largo">Largo</option>
              <option value="aquilino">Aquilino</option>
              <option value="arrebitado">Arrebitado</option>
              <option value="achatado">Achatado</option>
            </select>
            {fieldErrors.noseShape && <p className="text-xs text-red-500 mt-1">{fieldErrors.noseShape}</p>}
          </div>

          <div>
            <Label htmlFor="mouthShape" className="text-sm text-white mb-2 block">
              Formato da Boca <span className="text-red-500">*</span>
            </Label>
            <select
              id="mouthShape"
              value={formData.mouthShape}
              onChange={(e) => handleInputChange("mouthShape", e.target.value)}
              className={`w-full bg-[#1a1625] border text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444] ${
                fieldErrors.mouthShape ? "border-red-500" : "border-[#2b2438]"
              }`}
            >
              <option value="">Selecione...</option>
              <option value="lábios finos">Lábios Finos</option>
              <option value="lábios médios">Lábios Médios</option>
              <option value="lábios carnudos">Lábios Carnudos</option>
              <option value="boca pequena">Boca Pequena</option>
              <option value="boca grande">Boca Grande</option>
            </select>
            {fieldErrors.mouthShape && <p className="text-xs text-red-500 mt-1">{fieldErrors.mouthShape}</p>}
          </div>

          {formData.sex === "masculino" && (
            <div>
              <Label htmlFor="facialHair" className="text-sm text-white mb-2 block">
                Barba/Bigode
              </Label>
              <select
                id="facialHair"
                value={formData.facialHair}
                onChange={(e) => handleInputChange("facialHair", e.target.value)}
                className="w-full bg-[#1a1625] border border-[#2b2438] text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444]"
              >
                <option value="">Selecione...</option>
                <option value="sem barba">Sem Barba</option>
                <option value="barba por fazer">Barba por Fazer</option>
                <option value="barba curta">Barba Curta</option>
                <option value="barba média">Barba Média</option>
                <option value="barba longa">Barba Longa</option>
                <option value="cavanhaque">Cavanhaque</option>
                <option value="bigode">Bigode</option>
                <option value="barba e bigode">Barba e Bigode</option>
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="build" className="text-sm text-white mb-2 block">
              Estrutura Corporal
            </Label>
            <select
              id="build"
              value={formData.build}
              onChange={(e) => handleInputChange("build", e.target.value)}
              className="w-full bg-[#1a1625] border border-[#2b2438] text-white rounded-xl p-3 focus:outline-none focus:border-[#ef4444]"
            >
              <option value="">Selecione...</option>
              <option value="magro">Magro</option>
              <option value="esbelto">Esbelto</option>
              <option value="atlético">Atlético</option>
              <option value="médio">Médio</option>
              <option value="robusto">Robusto</option>
              <option value="forte">Forte</option>
              <option value="acima do peso">Acima do Peso</option>
            </select>
          </div>

          <div>
            <Label htmlFor="height" className="text-sm text-white mb-2 block">
              Altura Aproximada
            </Label>
            <Input
              id="height"
              type="text"
              placeholder="Ex: 1,75m ou baixo/médio/alto"
              value={formData.height}
              onChange={(e) => handleInputChange("height", e.target.value)}
              className="bg-[#1a1625] border-[#2b2438] text-white placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="distinctiveFeatures" className="text-sm text-white mb-2 block">
              Características Distintivas
            </Label>
            <Textarea
              id="distinctiveFeatures"
              placeholder="Cicatrizes, tatuagens, piercings, marcas de nascença, óculos, etc."
              value={formData.distinctiveFeatures}
              onChange={(e) => handleInputChange("distinctiveFeatures", e.target.value)}
              className="bg-[#1a1625] border-[#2b2438] text-white placeholder:text-muted-foreground min-h-24"
            />
          </div>

          <div>
            <Label htmlFor="clothing" className="text-sm text-white mb-2 block">
              Vestimenta
            </Label>
            <Input
              id="clothing"
              type="text"
              placeholder="Ex: camiseta preta, jaqueta jeans"
              value={formData.clothing}
              onChange={(e) => handleInputChange("clothing", e.target.value)}
              className="bg-[#1a1625] border-[#2b2438] text-white placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-sm text-white mb-2 block">
              Local do Incidente
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="Onde a pessoa foi vista?"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className="bg-[#1a1625] border-[#2b2438] text-white placeholder:text-muted-foreground"
            />
          </div>

          <Button
            type="submit"
            disabled={generating}
            className="w-full gradient-primary text-white btn-touch text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gerando Retrato...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Gerar Retrato
              </>
            )}
          </Button>

          <div className="bg-[#1a1625] border border-[#2b2438] rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#ef4444] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white font-semibold mb-1">Como funciona</p>
                <p className="text-xs text-muted-foreground">
                  Nossa IA utiliza as características fornecidas para gerar um retrato realista. Quanto mais detalhes
                  você fornecer, mais preciso será o resultado.
                </p>
              </div>
            </div>

            <div className="border-t border-[#2b2438] pt-3">
              <p className="text-xs text-muted-foreground">
                <strong className="text-white">Dica:</strong> Preencha os campos obrigatórios (marcados com{" "}
                <span className="text-red-500">*</span>), especialmente sexo, tom de pele, formato do rosto, cores e
                formatos dos olhos e nariz para obter os melhores resultados.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
