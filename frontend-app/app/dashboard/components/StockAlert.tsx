"use client"

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
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

  async function fetchLowStock() {
    try {
      const data = await getProductosStockBajo()
      setLowStock(data || [])
      if (data && data.length > 0) {
        toast({ title: `Stock bajo: ${data.length} productos`, description: 'Revisa inventario para reabastecer.' })
      }
    } catch (e) {
      console.error('Error fetching low stock', e)
    }
  }

  async function fetchExpirations(dias = 30) {
    try {
      const data = await findLotesVencimientoProximoDTO(dias)
      setExpirations(data || [])
      if (data && data.length > 0) {
        toast({ title: `Vencimientos próximos: ${data.length} lotes`, description: 'Revisa lotes con fecha de vencimiento cercana.' })
      }
    } catch (e) {
      console.error('Error fetching expirations', e)
    }
  }

  useEffect(() => {
    fetchLowStock()
    fetchExpirations()
    const interval = setInterval(() => { fetchLowStock(); fetchExpirations() }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <button onClick={() => setOpen(true)} title="Notificaciones" className="relative">
        <Bell className={`w-6 h-6 ${(lowStock.length > 0 || expirations.length > 0) ? 'text-yellow-600' : 'text-gray-400'}`} />
        { (lowStock.length + expirations.length) > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{lowStock.length + expirations.length}</span>
        )}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent data-vaul-drawer-direction="right" className="data-[vaul-drawer-direction=right]:w-80">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>Notificaciones</DrawerTitle>
                <p className="text-sm text-muted-foreground">Alertas de stock y vencimientos</p>
              </div>
              <div>
                <button onClick={() => setOpen(false)} className="px-2 py-1 text-sm">Cerrar</button>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <section>
              <h4 className="text-sm font-semibold mb-2">Productos con stock bajo</h4>
              {lowStock.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay productos con stock bajo.</div>
              ) : (
                <ul className="space-y-3">
                  {lowStock.map((p) => (
                    <li key={p.idProducto} className="flex items-center justify-between gap-2 p-2 rounded border border-gray-100 bg-white">
                      <div>
                        <div className="font-semibold text-sm">{p.nombre}</div>
                        <div className="text-xs text-muted-foreground">{p.stock} unidades</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setOpen(false); router.push(`/inventario?view=${p.idProducto}`); }} className="px-2 py-1 text-xs bg-[#A0522D] text-white rounded">Ver</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h4 className="text-sm font-semibold mb-2">Lotes próximos a vencimiento</h4>
              {expirations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No hay lotes próximos a vencer.</div>
              ) : (
                <ul className="space-y-3">
                  {expirations.map((a: any, idx: number) => {
                    const nombre = a.nombreProducto || a.nombre || a.productoNombre || a.producto?.nombre || 'Producto'
                    const productoId = a.idProducto || a.productoId || a.producto?.id
                    const fecha = a.fechaVencimiento || a.fecha_vencimiento || a.vencimiento || a.lote?.fechaVencimiento || a.loteFecha
                    const loteId = a.idLote || a.loteId || a.lote?.id || a.loteNumero
                    const diasRestantes = fecha ? Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
                    return (
                      <li key={loteId ?? idx} className="flex items-center justify-between gap-2 p-2 rounded border border-gray-100 bg-white">
                        <div>
                          <div className="font-semibold text-sm">{nombre}</div>
                          <div className="text-xs text-muted-foreground">Lote: {loteId ?? '-'} • {fecha ? new Date(fecha).toLocaleDateString() : 'Fecha desconocida'}</div>
                          {diasRestantes !== null && (
                            <div className={`text-xs ${diasRestantes <= 3 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>{diasRestantes} día(s) restantes</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setOpen(false); if (productoId) router.push(`/inventario?view=${productoId}`); }} className="px-2 py-1 text-xs bg-[#A0522D] text-white rounded">Ver</button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
