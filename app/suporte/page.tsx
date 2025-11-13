"use client"

import type React from "react"

import { ArrowLeft, MessageCircle, Mail, Phone, Clock, Send } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTranslation } from "@/hooks/use-translation"
import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { SupportChat } from "@/components/support-chat"

export default function SuportePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        console.log("[v0] Support ticket created:", data.ticket)
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setFormData({ name: "", email: "", subject: "", message: "" })
        }, 5000)
      } else {
        setError(data.error || "Failed to submit ticket")
      }
    } catch (err) {
      console.error("[v0] Error submitting support ticket:", err)
      setError("Failed to submit ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const bgColor = theme === "light" ? "bg-white" : "bg-[#0f0b1a]"
  const cardBg = theme === "light" ? "bg-gray-50" : "bg-[#1a1625]"
  const borderColor = theme === "light" ? "border-gray-200" : "border-[#2b2438]"
  const textColor = theme === "light" ? "text-gray-900" : "text-white"
  const mutedColor = theme === "light" ? "text-gray-600" : "text-muted-foreground"

  return (
    <div className={`min-h-screen ${bgColor} p-6`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="ghost" size="icon" className={textColor}>
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className={`text-2xl font-bold ${textColor}`}>{t("supportTitle")}</h1>
        </div>

        {/* Description */}
        <div className={`${cardBg} rounded-3xl p-6 border ${borderColor} mb-6`}>
          <p className={`${mutedColor} leading-relaxed text-center`}>{t("supportDescription")}</p>
        </div>

        {/* Contact Options */}
        <div className="grid gap-4 mb-8">
          {/* Live Chat */}
          <div className={`${cardBg} rounded-2xl p-5 border ${borderColor}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-[#ef4444]" />
              </div>
              <div className="flex-1">
                <h3 className={`${textColor} font-semibold mb-1`}>{t("liveChat")}</h3>
                <p className={`${mutedColor} text-sm mb-3`}>{t("liveChatDesc")}</p>
                <Button onClick={() => setShowChat(true)} className="gradient-primary text-white">
                  {t("startChat")}
                </Button>
              </div>
            </div>
          </div>

          {/* Email Support */}
          <div className={`${cardBg} rounded-2xl p-5 border ${borderColor}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-[#ef4444]" />
              </div>
              <div className="flex-1">
                <h3 className={`${textColor} font-semibold mb-1`}>{t("emailSupport")}</h3>
                <p className={`${mutedColor} text-sm mb-3`}>{t("emailSupportDesc")}</p>
                <a href="mailto:suporte@infosecurity.com">
                  <Button className="gradient-primary text-white">{t("sendEmail")}</Button>
                </a>
              </div>
            </div>
          </div>

          {/* Phone Support */}
          <div className={`${cardBg} rounded-2xl p-5 border ${borderColor}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-[#ef4444]" />
              </div>
              <div className="flex-1">
                <h3 className={`${textColor} font-semibold mb-1`}>{t("phoneSupport")}</h3>
                <p className={`${mutedColor} text-sm mb-3`}>{t("phoneSupportDesc")}</p>
                <a href="tel:08007771234">
                  <Button className="gradient-primary text-white">{t("callNow")}</Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={`${cardBg} rounded-3xl p-6 border ${borderColor} mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Send className="w-5 h-5 text-[#ef4444]" />
            <h2 className={`text-xl font-semibold ${textColor}`}>{t("contactForm")}</h2>
          </div>
          <p className={`${mutedColor} text-sm mb-6`}>{t("contactFormDesc")}</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {submitted ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
              <p className="text-green-400 font-medium">{t("messageSent")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className={mutedColor}>
                  {t("yourName")}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className={theme === "light" ? "bg-white border-gray-300" : ""}
                />
              </div>

              <div>
                <Label htmlFor="email" className={mutedColor}>
                  {t("yourEmail")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className={theme === "light" ? "bg-white border-gray-300" : ""}
                />
              </div>

              <div>
                <Label htmlFor="subject" className={mutedColor}>
                  {t("subject")}
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  disabled={isSubmitting}
                  className={theme === "light" ? "bg-white border-gray-300" : ""}
                />
              </div>

              <div>
                <Label htmlFor="message" className={mutedColor}>
                  {t("message")}
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  disabled={isSubmitting}
                  rows={5}
                  className={theme === "light" ? "bg-white border-gray-300" : ""}
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full gradient-primary text-white">
                {isSubmitting ? t("sending") : t("sendMessage")}
              </Button>
            </form>
          )}
        </div>

        {/* Support Hours */}
        <div className={`${cardBg} rounded-2xl p-5 border ${borderColor} text-center`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-[#ef4444]" />
            <h3 className={`${textColor} font-semibold`}>{t("supportHours")}</h3>
          </div>
          <p className={`${mutedColor} text-sm`}>{t("supportHoursDesc")}</p>
        </div>
      </div>

      {showChat && <SupportChat onClose={() => setShowChat(false)} />}
    </div>
  )
}
