"use client"

import { ArrowLeft, Bell, Lock, Globe, Moon, Sun, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/contexts/theme-context"
import { useSettings, type Language } from "@/contexts/settings-context"
import { useTranslation } from "@/hooks/use-translation"

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const { settings, updateNotifications, updatePrivacy, setLanguage } = useSettings()
  const { t } = useTranslation()
  const isDark = theme === "dark"

  const languageLabels: Record<Language, string> = {
    "pt-BR": t("portuguese"),
    en: t("english"),
    es: t("spanish"),
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-[#0f0b1a]" : "bg-gray-50"}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/policia-civil">
            <Button variant="ghost" size="icon" className={isDark ? "text-white" : "text-gray-900"}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {t("configurationsTitle")}
          </h1>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notifications */}
          <div
            className={`rounded-3xl p-6 border ${isDark ? "bg-[#1a1625] border-[#2b2438]" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-[#4aa3ff]" />
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {t("notifications")}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{t("securityAlerts")}</span>
                <Switch
                  checked={settings.notifications.securityAlerts}
                  onCheckedChange={(checked) => updateNotifications({ securityAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{t("bulletinUpdates")}</span>
                <Switch
                  checked={settings.notifications.bulletinUpdates}
                  onCheckedChange={(checked) => updateNotifications({ bulletinUpdates: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{t("pushNotifications")}</span>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateNotifications({ pushNotifications: checked })}
                />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div
            className={`rounded-3xl p-6 border ${isDark ? "bg-[#1a1625] border-[#2b2438]" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-[#4aa3ff]" />
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t("privacy")}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{t("anonymousByDefault")}</span>
                <Switch
                  checked={settings.privacy.anonymousByDefault}
                  onCheckedChange={(checked) => updatePrivacy({ anonymousByDefault: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{t("shareLocation")}</span>
                <Switch
                  checked={settings.privacy.shareLocation}
                  onCheckedChange={(checked) => updatePrivacy({ shareLocation: checked })}
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div
            className={`rounded-3xl p-6 border ${isDark ? "bg-[#1a1625] border-[#2b2438]" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              {isDark ? <Moon className="w-5 h-5 text-[#4aa3ff]" /> : <Sun className="w-5 h-5 text-[#4aa3ff]" />}
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Aparência</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Tema</span>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {isDark ? t("darkMode") : "Modo Claro"}
                  </span>
                </div>
                <Switch checked={isDark} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
              </div>
            </div>
          </div>

          {/* Language */}
          <div
            className={`rounded-3xl p-6 border ${isDark ? "bg-[#1a1625] border-[#2b2438]" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[#4aa3ff]" />
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t("language")}</h2>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={`w-full border rounded-xl p-3 ${isDark ? "bg-[#2b2438] border-[#2b2438] text-white" : "bg-white border-gray-300 text-gray-900"}`}
            >
              <option value="pt-BR">{languageLabels["pt-BR"]}</option>
              <option value="en">{languageLabels.en}</option>
              <option value="es">{languageLabels.es}</option>
            </select>
          </div>

          <div
            className={`rounded-3xl p-6 border text-center ${isDark ? "bg-[#1a1625] border-[#2b2438]" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-[#4aa3ff]" />
              <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{t("needHelp")}</h3>
            </div>
            <p className={`text-sm mb-4 ${isDark ? "text-muted-foreground" : "text-gray-600"}`}>{t("contactTeam")}</p>
            <Link href="/suporte">
              <Button className="gradient-primary text-white">{t("talkToSupport")}</Button>
            </Link>
          </div>

          {/* About */}
          <div
            className={`rounded-3xl p-6 border text-center ${isDark ? "bg-[#1a1625] border-[#2b2438]" : "bg-white border-gray-200"}`}
          >
            <p className={`text-sm mb-1 ${isDark ? "text-muted-foreground" : "text-gray-600"}`}>
              Info Security {t("version")} 1.0.0
            </p>
            <p className={`text-xs ${isDark ? "text-muted-foreground" : "text-gray-500"}`}>
              © 2025 Info Security. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
