"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto p-6">
        <div className="rounded-md bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Panel</h2>
              <p className="text-sm text-muted-foreground mt-1">Usa las secciones para navegar por el sistema. Accesos rápidos abajo.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

