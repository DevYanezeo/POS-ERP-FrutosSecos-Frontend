"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("isAuthenticated", "true")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#8B5E3C] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#FDFCF9] rounded-xl overflow-hidden shadow-2xl flex border border-[#F5EDE4]">
        {/* Left side - Nuts background */}
        <div
          className="flex-1 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yjMEv08lTvoqlan6oqgXqjPm1JTF8J.png')",
          }}
        >
          <div className="absolute inset-0 bg-[#A0522D] bg-opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-[#FFFFFF]">
              <h2 className="text-4xl font-bold mb-4">Frutos Secos</h2>
              <p className="text-lg opacity-90">Sistema de Gestión de Inventario</p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-[#FFFFFF]">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#D4A373] rounded-lg" />
              <span className="text-[#7A6F66] text-sm font-medium">Sistema POS</span>
            </div>

            <div className="flex items-center justify-end mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#A0522D] rounded-lg" />
                <span className="text-[#7A6F66] text-sm font-medium">Panel Administrativo</span>
              </div>
            </div>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-3xl font-bold text-[#2E2A26] mb-8 text-center">Bienvenido</h1>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border border-[#F5EDE4] rounded-lg text-[#2E2A26] placeholder-[#7A6F66] focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border border-[#F5EDE4] rounded-lg text-[#2E2A26] placeholder-[#7A6F66] focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#A0522D] hover:bg-[#8B5E3C] text-[#FFFFFF] py-4 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
              >
                Iniciar Sesión
              </button>

              <div className="text-center">
                <a href="#" className="text-[#7A6F66] text-sm hover:text-[#A0522D] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
