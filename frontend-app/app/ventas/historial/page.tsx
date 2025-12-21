"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE } from '@/lib/api'
import { Calendar, ChevronLeft, ChevronRight, Eye, DollarSign, CreditCard, Banknote } from 'lucide-react'

interface Venta {
  id: number
  fecha: string
  total: number
  metodoPago: 'EFECTIVO' | 'DEBITO' | 'TRANSFERENCIA'
  usuarioId: number
  detalles?: any[]
}

interface VentasPorDia {
  [dia: number]: {
    efectivo: number
    debito: number
    transferencia: number
    total: number
    ventas: Venta[]
  }
}

export default function HistorialVentasPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [ventasPorDia, setVentasPorDia] = useState<VentasPorDia>({})
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [detailVentas, setDetailVentas] = useState<Venta[]>([])
  const [showDetailModal, setShowDetailModal] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Función para convertir Date a formato dd/MM/yyyy (requerido por backend chileno)
  function formatDateToDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  useEffect(() => {
    fetchVentasDelMes()
  }, [currentDate])

  async function fetchVentasDelMes() {
    try {
      setLoading(true)

      // Obtener primer y último día del mes
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      // Convertir a formato dd/MM/yyyy (requerido por backend)
      const startDate = formatDateToDDMMYYYY(firstDay)
      const endDate = formatDateToDDMMYYYY(lastDay)

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No hay token de autenticación')
        return
      }

      const response = await fetch(
        `${API_BASE}/api/ventas/historial?desde=${startDate}&hasta=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Error al cargar ventas')
      }

      const ventas: Venta[] = await response.json()

      // Agrupar ventas por día
      const ventasAgrupadas: VentasPorDia = {}

      ventas.forEach(venta => {
        const fechaVenta = new Date(venta.fecha)
        const dia = fechaVenta.getDate()

        if (!ventasAgrupadas[dia]) {
          ventasAgrupadas[dia] = {
            efectivo: 0,
            debito: 0,
            transferencia: 0,
            total: 0,
            ventas: []
          }
        }

        ventasAgrupadas[dia].ventas.push(venta)
        ventasAgrupadas[dia].total += venta.total

        if (venta.metodoPago === 'EFECTIVO') {
          ventasAgrupadas[dia].efectivo += venta.total
        } else if (venta.metodoPago === 'DEBITO') {
          ventasAgrupadas[dia].debito += venta.total
        } else if (venta.metodoPago === 'TRANSFERENCIA') {
          ventasAgrupadas[dia].transferencia += venta.total
        }
      })

      setVentasPorDia(ventasAgrupadas)
    } catch (error: any) {
      console.error('Error fetchVentasDelMes:', error.message)
    } finally {
      setLoading(false)
    }
  }

  function getDaysInMonth() {
    return new Date(year, month + 1, 0).getDate()
  }

  function handlePreviousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function handleDayClick(dia: number) {
    if (ventasPorDia[dia]) {
      setSelectedDay(dia)
      setDetailVentas(ventasPorDia[dia].ventas)
      setShowDetailModal(true)
    }
  }

  function closeModal() {
    setShowDetailModal(false)
    setSelectedDay(null)
    setDetailVentas([])
  }

  async function handleViewVentaDetail(ventaId: number) {
    // Aquí podrías navegar a una página de detalle completo o mostrar un modal
    console.log('Ver detalle de venta:', ventaId)
  }

  const daysInMonth = getDaysInMonth()
  const monthName = currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  // Calcular totales del mes
  const totalMesEfectivo = Object.values(ventasPorDia).reduce((sum, dia) => sum + dia.efectivo, 0)
  const totalMesDebito = Object.values(ventasPorDia).reduce((sum, dia) => sum + dia.debito, 0)
  const totalMesTransferencia = Object.values(ventasPorDia).reduce((sum, dia) => sum + dia.transferencia, 0)
  const totalMes = totalMesEfectivo + totalMesDebito + totalMesTransferencia

  return (
    <main className="min-h-screen bg-[#F9F6F3] p-3">
      <div className="max-w-[95%] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-[#F5EDE4]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#A0522D] rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2E2A26]">Historial de Ventas</h1>
                <p className="text-[#7A6F66]">Registro contable mensual</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/ventas/fiados')}
                className="px-6 py-3 bg-[#D4A373] hover:bg-[#C29263] text-white font-semibold rounded-lg transition-colors"
              >
                Ver Fiados
              </button>
              <button
                onClick={() => router.push('/ventas')}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Ir a Ventas
              </button>
            </div>
          </div>

          {/* Navegación de mes */}
          <div className="flex items-center justify-between bg-[#FBF7F4] rounded-lg p-4 border border-[#F5EDE4]">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-[#F5EDE4] rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-6 h-6 text-[#7A6F66]" />
            </button>
            <h2 className="text-2xl font-bold text-[#2E2A26] capitalize">{monthName}</h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-[#F5EDE4] rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-6 h-6 text-[#7A6F66]" />
            </button>
          </div>

          {/* Resumen del mes */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white border border-[#F5EDE4] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-5 h-5 text-[#7A6F66]" />
                <p className="text-sm font-semibold text-[#7A6F66]">Efectivo</p>
              </div>
              <p className="text-2xl font-bold text-[#2E2A26]">${totalMesEfectivo.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-[#F5EDE4] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-[#7A6F66]" />
                <p className="text-sm font-semibold text-[#7A6F66]">Débito</p>
              </div>
              <p className="text-2xl font-bold text-[#2E2A26]">${totalMesDebito.toLocaleString()}</p>
            </div>
            <div className="bg-white border border-[#F5EDE4] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-[#7A6F66]" />
                <p className="text-sm font-semibold text-[#7A6F66]">Transferencia</p>
              </div>
              <p className="text-2xl font-bold text-[#2E2A26]">${totalMesTransferencia.toLocaleString()}</p>
            </div>
            <div className="bg-[#2E2A26] border border-[#2E2A26] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-white" />
                <p className="text-sm font-semibold text-[#E5DDD4]">Total Mes</p>
              </div>
              <p className="text-2xl font-bold text-white">${totalMes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tabla tipo cuaderno contable */}
        <div className="bg-white rounded-lg shadow-sm border border-[#F5EDE4] overflow-hidden">
          {/* Header de tabla */}
          <div className="grid grid-cols-5 bg-[#2E2A26] text-white font-bold text-center border-b border-[#2E2A26]">
            <div className="p-4 border-r border-[#4A443E]">Día</div>
            <div className="p-4 border-r border-[#4A443E]">Efectivo</div>
            <div className="p-4 border-r border-[#4A443E]">Débito</div>
            <div className="p-4 border-r border-[#4A443E]">Transferencia</div>
            <div className="p-4">Total Día</div>
          </div>

          {/* Filas de días */}
          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="text-gray-600 mt-4">Cargando ventas...</p>
              </div>
            ) : (
              Array.from({ length: daysInMonth }, (_, i) => i + 1).map(dia => {
                const dataDia = ventasPorDia[dia]
                const hasVentas = !!dataDia && dataDia.ventas.length > 0
                const isToday = new Date().getDate() === dia &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year

                return (
                  <div
                    key={dia}
                    className={`grid grid-cols-5 border-b border-[#F5EDE4] text-center transition-all ${hasVentas
                      ? 'hover:bg-[#FBF7F4]'
                      : 'bg-white'
                      } ${isToday ? 'bg-[#F5EDE4] border-[#D4A373] border-b' : ''}`}
                  >
                    <div className={`p-4 border-r border-[#F5EDE4] font-semibold ${hasVentas ? 'text-[#A0522D]' : 'text-[#9C9288]'
                      }`}>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-lg">{dia}</span>
                        <p className="text-xs text-[#7A6F66]">
                          {new Date(year, month, dia).toLocaleDateString('es-CL', { weekday: 'short' })}
                        </p>
                        {hasVentas && (
                          <button
                            onClick={() => handleDayClick(dia)}
                            className="mt-1 px-3 py-1 bg-[#A0522D] hover:bg-[#8B5E3C] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver Detalle
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border-r border-[#F5EDE4] text-[#7A6F66] font-semibold text-lg">
                      {dataDia ? `$${dataDia.efectivo.toLocaleString()}` : '-'}
                    </div>
                    <div className="p-4 border-r border-[#F5EDE4] text-[#7A6F66] font-semibold text-lg">
                      {dataDia ? `$${dataDia.debito.toLocaleString()}` : '-'}
                    </div>
                    <div className="p-4 border-r border-[#F5EDE4] text-[#7A6F66] font-semibold text-lg">
                      {dataDia ? `$${dataDia.transferencia.toLocaleString()}` : '-'}
                    </div>
                    <div className={`p-4 font-bold text-xl ${hasVentas ? 'text-[#2E2A26]' : 'text-[#E5DDD4]'
                      }`}>
                      {dataDia ? `$${dataDia.total.toLocaleString()}` : '-'}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer con totales */}
          <div className="grid grid-cols-5 bg-[#2E2A26] text-white font-bold text-center border-t-4 border-[#1a1816]">
            <div className="p-4 border-r border-[#4A443E] text-lg">TOTALES</div>
            <div className="p-4 border-r border-[#4A443E] text-[#E5DDD4] text-xl">
              ${totalMesEfectivo.toLocaleString()}
            </div>
            <div className="p-4 border-r border-[#4A443E] text-[#E5DDD4] text-xl">
              ${totalMesDebito.toLocaleString()}
            </div>
            <div className="p-4 border-r border-[#4A443E] text-[#E5DDD4] text-xl">
              ${totalMesTransferencia.toLocaleString()}
            </div>
            <div className="p-4 text-white text-2xl">
              ${totalMes.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle de ventas del día */}
      {showDetailModal && (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
          <div className="bg-white rounded-lg shadow-2xl w-[800px] max-h-[70vh] overflow-hidden pointer-events-auto">
            {/* Header del modal */}
            <div className="bg-[#2E2A26] text-white p-4 border-b border-[#4A443E]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    Ventas del {selectedDay} de {currentDate.toLocaleDateString('es-CL', { month: 'long' })}
                  </h3>
                  <p className="text-[#E5DDD4] mt-1 text-sm">
                    {detailVentas.length} venta{detailVentas.length !== 1 ? 's' : ''} registrada{detailVentas.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 overflow-y-auto max-h-[calc(70vh-180px)]">
              <div className="space-y-3">
                {detailVentas.map((venta, index) => (
                  <div
                    key={venta.id}
                    className="border border-[#F5EDE4] rounded-lg p-3 hover:border-[#A0522D] hover:bg-[#FBF7F4] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-[#2E2A26]">#{index + 1}</span>
                          <div>
                            <p className="text-sm text-[#7A6F66]">ID Venta: {venta.id}</p>
                            <p className="text-xs text-[#9C9288]">
                              {new Date(venta.fecha).toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-semibold text-[#7A6F66]`}>
                            {venta.metodoPago}
                          </p>
                          <p className="text-xl font-bold text-[#2E2A26]">
                            ${venta.total.toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => handleViewVentaDetail(venta.id)}
                          className="px-3 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalle
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del día */}
              {selectedDay && ventasPorDia[selectedDay] && (
                <div className="mt-4 pt-4 border-t border-[#F5EDE4]">
                  <h4 className="text-base font-bold text-[#2E2A26] mb-3">Resumen del Día</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[#FBF7F4] border border-[#F5EDE4] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#7A6F66] font-semibold mb-1">Efectivo</p>
                      <p className="text-lg font-bold text-[#2E2A26]">
                        ${ventasPorDia[selectedDay].efectivo.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#FBF7F4] border border-[#F5EDE4] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#7A6F66] font-semibold mb-1">Débito</p>
                      <p className="text-lg font-bold text-[#2E2A26]">
                        ${ventasPorDia[selectedDay].debito.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#FBF7F4] border border-[#F5EDE4] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#7A6F66] font-semibold mb-1">Transferencia</p>
                      <p className="text-lg font-bold text-[#2E2A26]">
                        ${ventasPorDia[selectedDay].transferencia.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-[#2E2A26] border border-[#2E2A26] rounded-lg p-2 text-center">
                      <p className="text-xs text-[#E5DDD4] font-semibold mb-1">Total</p>
                      <p className="text-lg font-bold text-white">
                        ${ventasPorDia[selectedDay].total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="bg-[#F9F6F3] px-4 py-3 border-t border-[#F5EDE4] flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-[#7A6F66] hover:bg-[#5D544D] text-white font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
