"use client"

import React, { useEffect, useState } from 'react'
import { Bell, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getProductos } from '@/lib/productos'
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

  if (lowStock.length === 0) return null

  return (
    <button onClick={() => router.push('/inventario')} title="Productos con stock bajo" className="relative">
      <Bell className="w-6 h-6 text-yellow-600" />
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{lowStock.length}</span>
    </button>
  )
}
