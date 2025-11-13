"use client"

import { ArrowLeft, Shield, Brain, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

export default function SobrePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-[#0f0b1a] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Sobre o Info Security</h1>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-[#1a1625] rounded-3xl p-6 border border-[#2b2438]">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#ef4444]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Nossa Missão</h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Info Security é uma plataforma inovadora que conecta cidadãos e autoridades policiais, facilitando o
                  registro de ocorrências e promovendo maior segurança pública através da tecnologia e inteligência
                  artificial.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1625] rounded-3xl p-6 border border-[#2b2438]">
            <h2 className="text-xl font-semibold text-white mb-4">Recursos Principais</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#ef4444] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-medium mb-1">Contato Direto</h3>
                  <p className="text-sm text-muted-foreground">Acesso rápido às autoridades através do número 197</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#ef4444] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-medium mb-1">Mapeamento de Crimes</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize áreas de maior incidência criminal em tempo real
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-[#ef4444] mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-medium mb-1">IA Avançada</h3>
                  <p className="text-sm text-muted-foreground">
                    Geração de retratos falados com inteligência artificial
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1625] rounded-3xl p-6 border border-[#2b2438]">
            <h2 className="text-xl font-semibold text-white mb-2">Nossa Missão</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Info Security é uma plataforma inovadora que conecta cidadãos e autoridades policiais, facilitando o
              registro de ocorrências e promovendo maior segurança pública através da tecnologia e inteligência
              artificial.
            </p>
          </div>

          <div className="mt-6 bg-[#1a1625] rounded-3xl p-6 border border-[#2b2438] text-center">
            <h3 className="text-white font-semibold mb-2">{t("needHelp")}</h3>
            <p className="text-muted-foreground text-sm mb-4">{t("contactTeam")}</p>
            <Link href="/suporte">
              <Button className="gradient-primary text-white">{t("talkToSupport")}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
