"use client"

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { toast } from '@/hooks/use-toast'
import { findLotesVencimientoProximoDTO } from '@/lib/lotes'

// Alert DTO puede variar según backend; usamos `any` aquí para mayor flexibilidad

function daysUntil(dateStr?: string) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const diff = d.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function ExpirationAlert({ dias = 30 }: { dias?: number }) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function fetchAlerts() {
    try {
      const data = await findLotesVencimientoProximoDTO(dias)
      const arr = data || []
      setAlerts(arr)
      if (arr.length > 0) {
        toast({ title: `Vencimientos próximos: ${arr.length} lotes`, description: 'Revisa lotes con fecha de vencimiento cercana.' })
      }
    } catch (e:any) {
      // registrar error en consola para ayudar al debugging en dev
      console.error('Error fetching expiration alerts', e)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000)
    return () => clearInterval(interval)
  }, [dias])

  return (
    <>
      <button onClick={() => setOpen(true)} title="Lotes próximos a vencimiento" className="relative">
        <Bell className={`w-6 h-6 ${alerts.length > 0 ? 'text-red-600' : 'text-gray-400'}`} />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{alerts.length}</span>
        )}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent data-vaul-drawer-direction="right" className="data-[vaul-drawer-direction=right]:w-96">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>Lotes próximos a vencimiento</DrawerTitle>
                <p className="text-sm text-muted-foreground">Lotes con fecha de vencimiento en los próximos {dias} días</p>
              </div>
              <div>
                <button onClick={() => setOpen(false)} className="px-2 py-1 text-sm">Cerrar</button>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-4">
            {alerts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay lotes próximos a vencer.</div>
            ) : (
              <ul className="space-y-3">
                {alerts.map((a: any, idx: number) => {
                  const nombre = a.nombreProducto || a.nombre || a.productoNombre || a.producto?.nombre || 'Producto'
                  const productoId = a.idProducto || a.productoId || a.producto?.id
                  const fecha = a.fechaVencimiento || a.fecha_vencimiento || a.vencimiento || a.lote?.fechaVencimiento || a.loteFecha
                  const loteId = a.idLote || a.loteId || a.lote?.id || a.loteNumero
                  const diasRestantes = daysUntil(fecha)
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
                        <button onClick={() => { setOpen(false); if (productoId) router.push(`/inventario?view=${productoId}`) }} className="px-2 py-1 text-xs bg-[#A0522D] text-white rounded">Ver</button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
