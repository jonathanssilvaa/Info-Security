"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { InfoSecurityLogo } from "@/components/InfoSecurity-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated, login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home")
    }
  }, [isAuthenticated, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (isLogin) {
      const success = login(formData.email, formData.password)
      if (success) {
        router.push("/home")
      } else {
        setError("Email ou senha incorretos")
      }
    } else {
      if (!formData.name) {
        setError("Por favor, preencha o nome")
        return
      }
      const success = register(formData.name, formData.email, formData.password)
      if (success) {
        router.push("/home")
      } else {
        setError("Email já cadastrado")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0b1a]">
      <div className="w-full max-w-md p-8 space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <InfoSecurityLogo size="medium" useIconLogo />
        </div>

        {/* Auth Form */}
        <div className="bg-[#1a1625] border border-[#2a2435] rounded-lg p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white">{isLogin ? "Entrar" : "Criar Conta"}</h1>
            <p className="text-gray-400 text-sm">
              {isLogin ? "Entre com suas credenciais" : "Cadastre-se para começar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#0f0b1a] border-[#2a2435] text-white"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-[#0f0b1a] border-[#2a2435] text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-[#0f0b1a] border-[#2a2435] text-white"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white">
              {isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setFormData({ name: "", email: "", password: "" })
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
