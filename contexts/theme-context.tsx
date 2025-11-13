"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)
  const lastSavedThemeRef = useRef<Theme>("dark")

  useEffect(() => {
    setMounted(true)

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("infosecurity-theme") as Theme | null
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setThemeState(savedTheme)
        lastSavedThemeRef.current = savedTheme
        console.log("[v0] Theme loaded:", savedTheme)
      }
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== theme) {
      setThemeState(newTheme)
      if (typeof window !== "undefined") {
        localStorage.setItem("infosecurity-theme", newTheme)
        lastSavedThemeRef.current = newTheme
        console.log("[v0] Theme saved:", newTheme)
      }
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
