"use client"

import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from "react"

export type Language = "pt-BR" | "en" | "es"

interface NotificationSettings {
  securityAlerts: boolean
  bulletinUpdates: boolean
  pushNotifications: boolean
}

interface PrivacySettings {
  anonymousByDefault: boolean
  shareLocation: boolean
}

interface Settings {
  notifications: NotificationSettings
  privacy: PrivacySettings
  language: Language
}

interface SettingsContextType {
  settings: Settings
  updateNotifications: (notifications: Partial<NotificationSettings>) => void
  updatePrivacy: (privacy: Partial<PrivacySettings>) => void
  setLanguage: (language: Language) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  notifications: {
    securityAlerts: true,
    bulletinUpdates: true,
    pushNotifications: false,
  },
  privacy: {
    anonymousByDefault: true,
    shareLocation: true,
  },
  language: "pt-BR",
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

function settingsToKey(settings: Settings): string {
  return JSON.stringify(settings)
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const isInitialLoad = useRef(true)
  const lastSavedKey = useRef<string>(settingsToKey(defaultSettings))
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const updatePendingRef = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("infosecurity-settings")
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          const merged = { ...defaultSettings, ...parsed }
          lastSavedKey.current = settingsToKey(merged)
          setSettings(merged)
          console.log("[v0] Settings loaded from localStorage")
        } catch (error) {
          console.error("[v0] Failed to parse settings:", error)
          lastSavedKey.current = settingsToKey(defaultSettings)
        }
      }
    }

    // Mark initial load complete after a brief delay
    const timer = setTimeout(() => {
      isInitialLoad.current = false
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isInitialLoad.current || typeof window === "undefined") {
      return
    }

    const settingsKey = settingsToKey(settings)

    // Only schedule save if settings have actually changed
    if (settingsKey === lastSavedKey.current) {
      console.log("[v0] Settings unchanged, skipping save")
      return
    }

    // Prevent multiple rapid updates
    if (updatePendingRef.current) {
      console.log("[v0] Save already pending, skipping")
      return
    }

    updatePendingRef.current = true

    // Clear existing save timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // Schedule save after 300ms of inactivity
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("infosecurity-settings", JSON.stringify(settings))
        lastSavedKey.current = settingsKey
        updatePendingRef.current = false
        console.log("[v0] Settings saved to localStorage")
      } catch (error) {
        console.error("[v0] Failed to save settings:", error)
        updatePendingRef.current = false
      }
    }, 300)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [settings])

  const updateNotifications = useCallback((notifications: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        notifications: { ...prev.notifications, ...notifications },
      }
      // Only update if actually changed
      if (settingsToKey(updated) === settingsToKey(prev)) {
        return prev
      }
      return updated
    })
  }, [])

  const updatePrivacy = useCallback((privacy: Partial<PrivacySettings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        privacy: { ...prev.privacy, ...privacy },
      }
      // Only update if actually changed
      if (settingsToKey(updated) === settingsToKey(prev)) {
        return prev
      }
      return updated
    })
  }, [])

  const setLanguage = useCallback((language: Language) => {
    setSettings((prev) => {
      if (prev.language === language) {
        return prev
      }
      return { ...prev, language }
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    lastSavedKey.current = settingsToKey(defaultSettings)
    updatePendingRef.current = false
    if (typeof window !== "undefined") {
      localStorage.removeItem("infosecurity-settings")
      console.log("[v0] Settings reset to defaults")
    }
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateNotifications,
        updatePrivacy,
        setLanguage,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
