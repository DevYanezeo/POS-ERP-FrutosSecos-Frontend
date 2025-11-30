"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import StockAlert from "./components/StockAlert"
import ExpirationAlert from "./components/ExpirationAlert"
import { Alert } from "@/components/ui/alert"
import Alerts from "./components/Alerts"


export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push('/login')
  }, [router])

  // Fecha de hoy formateada en español (ej: "Miércoles, 11 Sep 2024")
  const getFechaHoy = () => {
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    const d = new Date()
    return `${dias[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')} ${meses[d.getMonth()]} ${d.getFullYear()}`
  }
  const fechaHoyStr = getFechaHoy()

  return (
    <div className="min-h-screen bg-[#F9F6F3] ">
      <main className="max-w-6xl mx-auto p-6 ">
        <div className="rounded-md bg-[#F9F6F3] p-6  mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">¡Bienvenid@ {localStorage.getItem("user_nombre")}! <span className="ml-2">👋</span></h1>
              <p className="text-sm text-muted-foreground mt-1">Aquí tienes un resumen de tu negocio hoy</p>
            </div>
            <div className="text-sm text-muted-foreground">{fechaHoyStr}</div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-md border shadow-sm">
              <div className="text-sm text-[#7A6F66]">Ventas de Hoy</div>
              <div className="text-xl font-bold mt-2">$125,840</div>
              <div className="text-xs text-green-600 mt-1">+18% vs ayer</div>
            </div>
            <div className="bg-white p-4 rounded-md border shadow-sm">
              <div className="text-sm text-[#7A6F66]">Productos Vendidos</div>
              <div className="text-xl font-bold mt-2">47</div>
              <div className="text-xs text-[#7A6F66] mt-1">12 productos únicos</div>
            </div>
            <div className="bg-white p-4 rounded-md border shadow-sm">
              <div className="text-sm text-[#7A6F66]">Venta Promedio</div>
              <div className="text-xl font-bold mt-2">$8,950</div>
              <div className="text-xs text-[#7A6F66] mt-1">14 transacciones</div>
            </div>
            <div className="bg-white p-4 rounded-md border shadow-sm">
              <div className="text-sm text-[#7A6F66]">Stock Total</div>
              <div className="text-xl font-bold mt-2">1,247</div>
              <div className="text-xs text-red-600 mt-1">3 productos bajos</div>
            </div>
          </div>
        </div>

        {/* Alerts (stock bajo + vencimientos) */}
        <div className="mb-6">
          <Alerts />
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-md p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Top Productos del Mes</h3>
              <div className="text-sm text-[#7A6F66]">Ver todos</div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-[#FBF6F2] rounded-md">Placeholder: lista de top productos</div>
              <div className="p-3 bg-[#FBF6F2] rounded-md">Placeholder: producto #2</div>
              <div className="p-3 bg-[#FBF6F2] rounded-md">Placeholder: producto #3</div>
            </div>
          </div>

          <div className="bg-white rounded-md p-4 border shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ventas de la Semana</h3>
              <div className="text-sm text-[#7A6F66]">—</div>
            </div>
            <div className="mt-6 h-40 bg-[#FBF6F2] rounded-md flex items-center justify-center text-sm text-[#7A6F66]">Placeholder: gráfico</div>
          </div>
        </div>
      </main>
    </div>
  )
}

