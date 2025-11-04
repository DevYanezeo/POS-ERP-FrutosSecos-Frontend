"use client"

import React, { useEffect, useState } from 'react'
import { Bell, Package, Calendar, AlertTriangle, X, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { toast } from '@/hooks/use-toast'
import { findLotesVencimientoProximoDTO } from '@/lib/lotes'
import { getProductosStockBajo } from '@/lib/productos'

type Producto = {
  idProducto: number
  nombre: string
  stock: number
}

export default function StockAlert() {
  const [lowStock, setLowStock] = useState<Producto[]>([])
  const [expirations, setExpirations] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()

  // Función para eliminar duplicados por ID
  function removeDuplicates<T extends Record<string, any>>(items: T[], keyField: string): T[] {
    const seen = new Set()
    return items.filter(item => {
      const key = item[keyField]
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  async function fetchLowStock() {
    try {
      const data = await getProductosStockBajo()
      // Eliminar duplicados por idProducto
      const uniqueData = removeDuplicates(data || [], 'idProducto') as Producto[]
      setLowStock(uniqueData)
      
      if (uniqueData && uniqueData.length > 0) {
        toast({ 
          title: `${uniqueData.length} producto${uniqueData.length > 1 ? 's' : ''} con stock bajo`,
          description: 'Revisa el inventario para reabastecer.',
          variant: 'destructive'
        })
      }
    } catch (e) {
      console.error('Error fetching low stock', e)
    }
  }

  async function fetchExpirations(dias = 30) {
    try {
      const data = await findLotesVencimientoProximoDTO(dias)
      // Eliminar duplicados por idLote
      const uniqueData = removeDuplicates(data || [], 'idLote')
      setExpirations(uniqueData)
      
      if (uniqueData && uniqueData.length > 0) {
        toast({ 
          title: `${uniqueData.length} lote${uniqueData.length > 1 ? 's' : ''} próximo${uniqueData.length > 1 ? 's' : ''} a vencer`,
          description: 'Revisa lotes con fecha de vencimiento cercana.',
          variant: 'destructive'
        })
      }
    } catch (e) {
      console.error('Error fetching expirations', e)
    }
  }

  useEffect(() => {
    fetchLowStock()
    fetchExpirations()
    const interval = setInterval(() => { 
      fetchLowStock()
      fetchExpirations()
    }, 60000) // Cada 1 minuto
    return () => clearInterval(interval)
  }, [])

  const totalAlerts = lowStock.length + expirations.length

  return (
    <>
      {/* Botón de notificaciones */}
      <button 
        onClick={() => setOpen(true)} 
        title="Notificaciones" 
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors group"
      >
        <Bell className={`w-6 h-6 transition-colors ${
          totalAlerts > 0 ? 'text-yellow-600 group-hover:text-yellow-700' : 'text-gray-400 group-hover:text-gray-500'
        }`} />
        
        {totalAlerts > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
            {totalAlerts > 99 ? '99+' : totalAlerts}
          </span>
        )}
      </button>

      {/* Drawer lateral */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent 
          data-vaul-drawer-direction="right" 
          className="data-[vaul-drawer-direction=right]:w-96 data-[vaul-drawer-direction=right]:max-w-full"
        >
          {/* Header mejorado */}
          <DrawerHeader className="border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <DrawerTitle className="text-lg font-bold text-gray-900">
                    Alertas del Sistema
                  </DrawerTitle>
                  <p className="text-sm text-gray-600">
                    {totalAlerts} alerta{totalAlerts !== 1 ? 's' : ''} activa{totalAlerts !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </DrawerHeader>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-6">
            
            {/* Sección: Stock Bajo */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-red-600" />
                <h4 className="text-base font-bold text-gray-900">
                  Stock Bajo
                </h4>
                <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                  {lowStock.length}
                </span>
              </div>

              {lowStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-white rounded-lg border border-gray-200">
                  <Package className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    ✅ Todos los productos tienen stock suficiente
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {lowStock.map((p) => (
                    <li 
                      key={p.idProducto}
                      className="group bg-white rounded-lg border-2 border-red-200 hover:border-red-400 p-3 transition-all cursor-pointer"
                      onClick={() => { 
                        setOpen(false)
                        router.push(`/inventario?view=${p.idProducto}`)
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-900 truncate">
                            {p.nombre}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${
                              p.stock === 0 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {p.stock === 0 ? 'SIN STOCK' : `${p.stock} unidades`}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Sección: Vencimientos Próximos */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h4 className="text-base font-bold text-gray-900">
                  Vencimientos Próximos
                </h4>
                <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                  {expirations.length}
                </span>
              </div>

              {expirations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-white rounded-lg border border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    ✅ No hay lotes próximos a vencer
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {expirations.map((a: any, idx: number) => {
                    const nombre = a.nombreProducto || a.nombre || a.productoNombre || a.producto?.nombre || 'Producto'
                    const productoId = a.idProducto || a.productoId || a.producto?.id
                    const fecha = a.fechaVencimiento || a.fecha_vencimiento || a.vencimiento || a.lote?.fechaVencimiento || a.loteFecha
                    const loteId = a.idLote || a.loteId || a.lote?.id || a.loteNumero
                    const diasRestantes = fecha ? Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                    
                    const isUrgent = diasRestantes !== null && diasRestantes <= 7
                    const isCritical = diasRestantes !== null && diasRestantes <= 3

                    return (
                      <li 
                        key={loteId ?? idx}
                        className={`group bg-white rounded-lg border-2 p-3 transition-all cursor-pointer ${
                          isCritical 
                            ? 'border-red-200 hover:border-red-400' 
                            : isUrgent 
                            ? 'border-orange-200 hover:border-orange-400' 
                            : 'border-yellow-200 hover:border-yellow-400'
                        }`}
                        onClick={() => { 
                          setOpen(false)
                          if (productoId) router.push(`/inventario?view=${productoId}`)
                        }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 truncate">
                              {nombre}
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="text-xs text-gray-600">
                                Lote: <span className="font-mono font-semibold">{loteId ?? '-'}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500">
                                  📅 {fecha ? new Date(fecha).toLocaleDateString('es-CL') : 'Fecha desconocida'}
                                </span>
                                {diasRestantes !== null && (
                                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${
                                    isCritical 
                                      ? 'bg-red-100 text-red-700 animate-pulse' 
                                      : isUrgent 
                                      ? 'bg-orange-100 text-orange-700' 
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {diasRestantes} día{diasRestantes !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-${isCritical ? 'red' : isUrgent ? 'orange' : 'yellow'}-600 transition-colors flex-shrink-0`} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Footer con acciones rápidas */}
          <div className="border-t border-gray-200 bg-white p-4">
            <button
              onClick={() => {
                setOpen(false)
                router.push('/inventario')
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Ir a Inventario
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
