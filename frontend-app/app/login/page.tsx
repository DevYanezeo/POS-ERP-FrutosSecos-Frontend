"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { login } from "../../lib/api"
import RegisterForm from '../../components/RegisterForm'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false)
  const [loggedInUserName, setLoggedInUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    const token = localStorage.getItem('token')
    const userName = localStorage.getItem('user_nombre') || localStorage.getItem('user_email') || 'Usuario'
    if (isAuthenticated && token) {
      setIsAlreadyLoggedIn(true)
      setLoggedInUserName(userName)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!email || !password) {
      setError('Por favor completa correo y contraseña')
      setLoading(false)
      return
    }
    try {
      const resp = await login({ email, password })
      localStorage.setItem('token', resp.token)
      localStorage.setItem('user_email', resp.email)
      localStorage.setItem('user_nombre', resp.nombre || '')
      localStorage.setItem('user_rol', resp.rol || '')
      localStorage.setItem('isAuthenticated', 'true')
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.message || err?.error || 'Error de autenticación'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div data-page="login" className="min-h-screen bg-[#8B5E3C] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[#FDFCF9] rounded-xl overflow-hidden shadow-2xl flex border border-[#F5EDE4]">
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
              <h2 className="text-4xl font-bold mb-4">MSM</h2>
              <p className="text-lg opacity-90">Mil Sabores Manager</p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-[#FFFFFF]">

          <div className="max-w-sm mx-auto w-full">
            {!showRegister ? (
              <>
                {isAlreadyLoggedIn ? (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold text-[#2E2A26] mb-2">¡Hola, {loggedInUserName}!</h1>
                      <p className="text-[#7A6F66] text-sm">Ya estás autenticado en el sistema</p>
                    </div>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-[#A0522D] hover:bg-[#8B5E3C] text-[#FFFFFF] py-4 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                    >
                      Ir al Dashboard
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-[#2E2A26] mb-8 text-center">Bienvenido!</h1>

                    <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null) }}
                  className="w-full px-4 py-4 border border-[#F5EDE4] rounded-lg text-[#2E2A26] placeholder-[#7A6F66] focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(null) }}
                  className="w-full px-4 py-4 border border-[#F5EDE4] rounded-lg text-[#2E2A26] placeholder-[#7A6F66] focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#A0522D] hover:bg-[#8B5E3C] text-[#FFFFFF] py-4 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : null}
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>

              {error && (
                <div className="mt-3 p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
                  {error}
                </div>
              )}

              <div className="text-center">
                <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true) }} className="text-[#7A6F66] text-sm hover:text-[#A0522D] transition-colors">
                  ¿No tienes cuenta? Crear cuenta
                </a>
              </div>
                </form>
                  </>
                )}
              </>
            ) : (
              <RegisterForm onCancel={() => setShowRegister(false)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
