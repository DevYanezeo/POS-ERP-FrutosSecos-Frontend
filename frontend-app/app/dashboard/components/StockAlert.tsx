"use client"

import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { toast } from '@/hooks/use-toast'

type Producto = {
  idProducto: number
  nombre: string
  stock: number
}

export default function StockAlert() {
  const [lowStock, setLowStock] = useState<Producto[]>([])
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function fetchLowStock() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'}/api/productos/stock-bajo`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': typeof window !== 'undefined' ? (localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '') : '' }
      })
      if (!res.ok) return
      const data = await res.json()
      setLowStock(data || [])
      if (data && data.length > 0) {
        toast({ title: `Stock bajo: ${data.length} productos`, description: 'Revisa inventario para reabastecer.' })
      }
    } catch (e) {
    }
  }

  useEffect(() => {
    fetchLowStock()
    const interval = setInterval(fetchLowStock, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <button onClick={() => setOpen(true)} title="Productos con stock bajo" className="relative">
        <Bell className={`w-6 h-6 ${lowStock.length > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
        {lowStock.length > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{lowStock.length}</span>
        )}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent data-vaul-drawer-direction="right" className="data-[vaul-drawer-direction=right]:w-80">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle>Productos con stock bajo</DrawerTitle>
                <p className="text-sm text-muted-foreground">Productos con 5 unidades o menos</p>
              </div>
              <div>
                <button onClick={() => setOpen(false)} className="px-2 py-1 text-sm">Cerrar</button>
              </div>
            </div>
          </DrawerHeader>

          <div className="p-4">
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
                      <button onClick={() => { setOpen(false); router.push(`/inventario`); }} className="px-2 py-1 text-xs bg-[#F5EDE4] rounded">Ir a Inventario</button>
                      <button onClick={() => { setOpen(false); router.push(`/inventario?view=${p.idProducto}`); }} className="px-2 py-1 text-xs bg-[#A0522D] text-white rounded">Ver</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
