"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
        `http://localhost:8080/api/ventas/historial?desde=${startDate}&hasta=${endDate}`,
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
    <main className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-[95%] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Historial de Ventas</h1>
                <p className="text-gray-600">Registro contable mensual</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/ventas')}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              Ir a Ventas
            </button>
          </div>

          {/* Navegación de mes */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{monthName}</h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Resumen del mes */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Banknote className="w-5 h-5 text-gray-700" />
                <p className="text-sm font-semibold text-gray-700">Efectivo</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">${totalMesEfectivo.toLocaleString()}</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-gray-700" />
                <p className="text-sm font-semibold text-gray-700">Débito</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">${totalMesDebito.toLocaleString()}</p>
            </div>
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-gray-700" />
                <p className="text-sm font-semibold text-gray-700">Transferencia</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">${totalMesTransferencia.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 border-2 border-gray-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-white" />
                <p className="text-sm font-semibold text-gray-200">Total Mes</p>
              </div>
              <p className="text-2xl font-bold text-white">${totalMes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Tabla tipo cuaderno contable */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header de tabla */}
          <div className="grid grid-cols-5 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold text-center border-b-2 border-gray-900">
            <div className="p-4 border-r border-gray-600">Día</div>
            <div className="p-4 border-r border-gray-600">Efectivo</div>
            <div className="p-4 border-r border-gray-600">Débito</div>
            <div className="p-4 border-r border-gray-600">Transferencia</div>
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
                    className={`grid grid-cols-5 border-b border-gray-200 text-center transition-all ${
                      hasVentas 
                        ? 'hover:bg-blue-50' 
                        : 'bg-gray-50'
                    } ${isToday ? 'bg-yellow-50 border-yellow-300 border-2' : ''}`}
                  >
                    <div className={`p-4 border-r border-gray-200 font-semibold ${
                      hasVentas ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-lg">{dia}</span>
                        <p className="text-xs text-gray-500">
                          {new Date(year, month, dia).toLocaleDateString('es-CL', { weekday: 'short' })}
                        </p>
                        {hasVentas && (
                          <button
                            onClick={() => handleDayClick(dia)}
                            className="mt-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver Detalle
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 border-r border-gray-200 text-gray-700 font-semibold text-lg">
                      {dataDia ? `$${dataDia.efectivo.toLocaleString()}` : '-'}
                    </div>
                    <div className="p-4 border-r border-gray-200 text-gray-700 font-semibold text-lg">
                      {dataDia ? `$${dataDia.debito.toLocaleString()}` : '-'}
                    </div>
                    <div className="p-4 border-r border-gray-200 text-gray-700 font-semibold text-lg">
                      {dataDia ? `$${dataDia.transferencia.toLocaleString()}` : '-'}
                    </div>
                    <div className={`p-4 font-bold text-xl ${
                      hasVentas ? 'text-gray-900' : 'text-gray-300'
                    }`}>
                      {dataDia ? `$${dataDia.total.toLocaleString()}` : '-'}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer con totales */}
          <div className="grid grid-cols-5 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold text-center border-t-4 border-gray-900">
            <div className="p-4 border-r border-gray-600 text-lg">TOTALES</div>
            <div className="p-4 border-r border-gray-600 text-gray-100 text-xl">
              ${totalMesEfectivo.toLocaleString()}
            </div>
            <div className="p-4 border-r border-gray-600 text-gray-100 text-xl">
              ${totalMesDebito.toLocaleString()}
            </div>
            <div className="p-4 border-r border-gray-600 text-gray-100 text-xl">
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    Ventas del {selectedDay} de {currentDate.toLocaleDateString('es-CL', { month: 'long' })}
                  </h3>
                  <p className="text-blue-100 mt-1 text-sm">
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
                    className="border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-800">#{index + 1}</span>
                          <div>
                            <p className="text-sm text-gray-500">ID Venta: {venta.id}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(venta.fecha).toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-sm font-semibold text-gray-700`}>
                            {venta.metodoPago}
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            ${venta.total.toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => handleViewVentaDetail(venta.id)}
                          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
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
                <div className="mt-4 pt-4 border-t-2 border-gray-300">
                  <h4 className="text-base font-bold text-gray-800 mb-3">Resumen del Día</h4>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-700 font-semibold mb-1">Efectivo</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${ventasPorDia[selectedDay].efectivo.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-700 font-semibold mb-1">Débito</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${ventasPorDia[selectedDay].debito.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-700 font-semibold mb-1">Transferencia</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${ventasPorDia[selectedDay].transferencia.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800 border-2 border-gray-900 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-200 font-semibold mb-1">Total</p>
                      <p className="text-lg font-bold text-white">
                        ${ventasPorDia[selectedDay].total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="bg-gray-50 px-4 py-3 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
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
