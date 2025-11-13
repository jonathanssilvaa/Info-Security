"use client"

import Link from "next/link"
import { Phone, FileText, User, MapPin, LogOut, HelpCircle } from "lucide-react"
import { InfoSecurityLogo } from "@/components/InfoSecurity-logo"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { t } = useTranslation()
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [showPhoneDialer, setShowPhoneDialer] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handlePhoneClick = (num: string) => {
    if (num === "call") {
      window.location.href = `tel:${phoneNumber}`
      setShowPhoneDialer(false)
      setPhoneNumber("")
    } else if (num === "clear") {
      setPhoneNumber("")
    } else {
      setPhoneNumber((prev) => prev + num)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0b1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const menuItems = [
    {
      title: t("policiaCall"),
      icon: Phone,
      action: () => setShowPhoneDialer(true),
      description: "Contato direto com autoridades",
    },
    {
      title: t("boletim"),
      icon: FileText,
      href: "/boletim",
      description: "Registre uma ocorrência",
    },
    {
      title: t("retratoFalado"),
      icon: User,
      href: "/retrato-falado",
      description: "Gere retrato com IA",
    },
    {
      title: t("mapeamento"),
      icon: MapPin,
      href: "/mapeamento",
      description: "Visualize crimes na região",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f0b1a] p-6 relative flex flex-col">
      <div className="absolute top-4 right-6 flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-gray-500">Olá,</p>
          <p className="text-sm font-medium text-white">{user?.name}</p>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-[#ef4444] hover:bg-[#1a1625] p-2"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      <div className="max-w-md mx-auto pt-4 flex-1">
        <div className="flex flex-col items-center mb-12">
          <InfoSecurityLogo size="medium" useIconLogo />
        </div>

        <div className="space-y-4">
          {menuItems.map((item, idx) => {
            const content = (
              <div
                className="bg-[#1a1625] rounded-3xl p-6 border border-[#2b2438] hover:border-[#ef4444] transition-all duration-300 cursor-pointer flex items-center gap-4 group"
                key={idx}
              >
                <div className="w-12 h-12 rounded-xl bg-[#ef4444] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            )

            if (item.href) {
              return (
                <Link href={item.href} key={idx}>
                  {content}
                </Link>
              )
            }

            return (
              <div onClick={item.action} key={idx}>
                {content}
              </div>
            )
          })}
        </div>

        <div className="mt-8 bg-[#1a1625] rounded-2xl p-5 border border-[#2b2438]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#ef4444]/20 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-[#ef4444]" />
            </div>
            <h3 className="text-white font-semibold text-sm">Precisa de Ajuda?</h3>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed mb-3">
            Tire suas dúvidas sobre boletins, retrato falado e mapeamento de crimes.
          </p>
          <div className="flex gap-2 text-xs">
            <Link href="/ajuda" className="text-[#ef4444] hover:underline">
              Ver perguntas frequentes
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/suporte" className="text-[#ef4444] hover:underline">
              Falar com suporte
            </Link>
          </div>
        </div>
      </div>

      {showPhoneDialer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-[#1a1625] rounded-3xl p-6 max-w-sm w-full border border-[#2b2438]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Ligar para Polícia</h2>
              <Button
                onClick={() => {
                  setShowPhoneDialer(false)
                  setPhoneNumber("")
                }}
                variant="ghost"
                size="sm"
                className="text-gray-400"
              >
                ✕
              </Button>
            </div>

            <div className="bg-[#0f0b1a] rounded-xl p-4 mb-6 min-h-[60px] flex items-center justify-center">
              <p className="text-2xl text-white font-mono">{phoneNumber || "___"}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePhoneClick(num)}
                  className="bg-[#2b2438] hover:bg-[#ef4444] text-white font-semibold text-xl py-4 rounded-xl transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handlePhoneClick("clear")}
                className="flex-1 border-[#2b2438] text-white hover:bg-[#ef4444]"
              >
                Limpar
              </Button>
              <Button
                onClick={() => handlePhoneClick("call")}
                disabled={!phoneNumber}
                className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Ligar
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-[#2b2438]">
              <p className="text-xs text-muted-foreground text-center mb-2">Números de emergência:</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setPhoneNumber("190")}
                  className="text-xs px-3 py-1 bg-[#ef4444]/20 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/30"
                >
                  190 - Polícia
                </button>
                <button
                  onClick={() => setPhoneNumber("192")}
                  className="text-xs px-3 py-1 bg-[#ef4444]/20 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/30"
                >
                  192 - SAMU
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="max-w-md mx-auto w-full mt-12 pt-8 border-t border-[#2b2438]">
        <div className="text-center space-y-3">
          <h3 className="text-white font-semibold text-sm">Sobre Nós</h3>
          <p className="text-muted-foreground text-xs leading-relaxed px-4">
            O Info Security é uma plataforma que conecta cidadãos e autoridades, promovendo segurança através da
            tecnologia e inteligência artificial.
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link href="/sobre" className="text-[#ef4444] hover:underline">
              Saiba mais
            </Link>
            <Link href="/suporte" className="text-[#ef4444] hover:underline">
              Suporte
            </Link>
          </div>
          <p className="text-muted-foreground text-xs pt-2">© 2025 Info Security. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
