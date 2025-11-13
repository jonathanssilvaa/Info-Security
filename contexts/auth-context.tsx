"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("infosecurity-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("infosecurity-users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (foundUser) {
      const userData = { name: foundUser.name, email: foundUser.email }
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem("infosecurity-user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const register = (name: string, email: string, password: string): boolean => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem("infosecurity-users") || "[]")

    // Check if email already exists
    if (users.some((u: any) => u.email === email)) {
      return false
    }

    // Add new user
    users.push({ name, email, password })
    localStorage.setItem("infosecurity-users", JSON.stringify(users))

    // Auto login after registration
    const userData = { name, email }
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("infosecurity-user", JSON.stringify(userData))
    return true
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("infosecurity-user")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
