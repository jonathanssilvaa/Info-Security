"use client"

import { ArrowLeft, HelpCircle, Phone, FileText, User, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

export default function AjudaPage() {
  const { t } = useTranslation()

  const faqs = [
    {
      question: "Como registrar um boletim de ocorrência?",
      answer:
        'Acesse o menu "Boletim de Ocorrência", selecione o local no mapa, preencha os detalhes do incidente e envie. Você receberá um número de protocolo.',
      icon: FileText,
    },
    {
      question: "O que é o Retrato Falado com IA?",
      answer:
        "É uma ferramenta que usa inteligência artificial para gerar retratos baseados em descrições textuais de suspeitos.",
      icon: User,
    },
    {
      question: "Como funciona o mapeamento de crimes?",
      answer:
        "O mapa de calor mostra áreas com maior incidência de crimes, ajudando você a tomar decisões mais informadas sobre segurança.",
      icon: MapPin,
    },
    {
      question: "Posso fazer denúncias anônimas?",
      answer:
        "Sim! Ao registrar um boletim, você pode optar por não fornecer seus dados pessoais, mantendo total anonimato.",
      icon: HelpCircle,
    },
  ]

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
          <h1 className="text-2xl font-bold text-white">Central de Ajuda</h1>
        </div>

        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-[#ef4444] to-[#dc2626] rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Emergência?</h2>
          </div>
          <p className="text-white/90 mb-3">Em caso de emergência, ligue imediatamente:</p>
          <div className="flex gap-3">
            <a href="tel:190" className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-semibold">
              190 - Polícia
            </a>
            <a href="tel:192" className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white font-semibold">
              192 - SAMU
            </a>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-xl font-bold text-white mb-4">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#1a1625] rounded-2xl p-5 border border-[#2b2438]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                  <faq.icon className="w-5 h-5 text-[#ef4444]" />
                </div>
                <h3 className="text-white font-semibold pt-2">{faq.question}</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed pl-13">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-[#1a1625] rounded-3xl p-6 border border-[#2b2438] text-center">
          <h3 className="text-white font-semibold mb-2">{t("needHelp")}</h3>
          <p className="text-muted-foreground text-sm mb-4">{t("contactTeam")}</p>
          <Link href="/suporte">
            <Button className="gradient-primary text-white">{t("talkToSupport")}</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
