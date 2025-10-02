"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen">
      <header className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="logo" width={40} height={40} />
            <h1 className="font-bold">FRUTOS SECOS</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/inventario')} className="px-3 py-1 bg-blue-600 text-white rounded">Inventario</button>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white"><User className="w-4 h-4"/></div>
          </div>
        </div>
      </header>

      <main className="p-8 text-center">
        <h2 className="text-2xl mb-4">Panel</h2>
        <p className="mb-6">Usa la vista de Inventario para administrar productos.</p>
        <button onClick={() => router.push('/inventario')} className="px-6 py-2 bg-green-600 text-white rounded">Ir a Inventario</button>
      </main>
    </div>
  )
}

