"use client"

import { useState, useEffect, useRef } from "react"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/hooks/use-translation"
import { useTheme } from "@/contexts/theme-context"

interface Message {
  id: string
  message: string
  sender: "user" | "support"
  timestamp: string
}

interface SupportChatProps {
  onClose: () => void
}

export function SupportChat({ onClose }: SupportChatProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      message: t("chatWelcome"),
      sender: "support",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      message: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSessionId(data.sessionId)
        setMessages((prev) => [...prev, data.response])
      }
    } catch (error) {
      console.error("[v0] Error sending chat message:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          message: t("chatError"),
          sender: "support",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const bgColor = theme === "light" ? "bg-white" : "bg-[#1a1625]"
  const borderColor = theme === "light" ? "border-gray-200" : "border-[#2b2438]"
  const textColor = theme === "light" ? "text-gray-900" : "text-white"
  const mutedColor = theme === "light" ? "text-gray-600" : "text-gray-400"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative ${bgColor} rounded-t-3xl sm:rounded-3xl border ${borderColor} w-full max-w-md h-[600px] flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2b2438]">
          <div>
            <h3 className={`font-semibold ${textColor}`}>{t("liveChat")}</h3>
            <p className={`text-sm ${mutedColor}`}>{t("chatSubtitle")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-[#4aa3ff] to-[#2b6ef6] text-white"
                    : theme === "light"
                      ? "bg-gray-100 text-gray-900"
                      : "bg-[#2b2438] text-white"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-white/70" : mutedColor}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-2xl px-4 py-2 ${theme === "light" ? "bg-gray-100" : "bg-[#2b2438]"}`}>
                <Loader2 className="w-5 h-5 animate-spin text-[#4aa3ff]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${borderColor}`}>
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={t("typeMessage")}
              disabled={isLoading}
              className={theme === "light" ? "bg-white border-gray-300 text-gray-900" : "text-white"}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} size="icon">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
