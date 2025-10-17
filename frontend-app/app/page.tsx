"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (token && isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
      <div className="text-[#2E2A26] text-lg font-medium">Cargando...</div>
    </div>
  )
}
