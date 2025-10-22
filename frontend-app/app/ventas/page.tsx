"use client"

import React, { useEffect, useState } from 'react'
import { getProductos } from '@/lib/productos'
import { getLoteByCodigo } from '@/lib/lotes'
import { confirmarVenta } from '@/lib/ventas'
import { useRouter } from 'next/navigation'
import Catalog from './components/Catalog'
import ScanLoteInput from './components/ScanLoteInput'
import Cart from './components/Cart'

function calcularIVA(subtotal: number) {
  return Math.round(subtotal * 0.19)
}

// types: using any for now to match project style
// using implicit any for Producto and Lote to match project style
export default function VentasPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [scanCode, setScanCode] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProductos()
  }, [])

  async function fetchProductos() {
    try {
      const res = await getProductos()
      setProductos(res || [])
    } catch (err: any) {
      console.error('Error fetching productos', err.message)
    }
  }

  function addToCart(producto: any, loteId: number | null = null) {
    // normalize product id: backend shape may vary (id | productoId | idProducto | _id)
    const pid = producto?.id ?? producto?.productoId ?? producto?.idProducto ?? producto?._id ?? null
    console.log('[VENTAS] addToCart called', { producto, resolvedId: pid, loteId })
    setCart(prev => {
      const existing = prev.find((p: any) => p.productoId === pid && p.idLote === loteId)
      if (existing) {
        return prev.map(p => p === existing ? { ...p, cantidad: p.cantidad + 1 } : p)
      }
      return [...prev, {
        productoId: pid,
        nombre: producto?.nombre ?? producto?.titulo ?? 'Producto',
        cantidad: 1,
        precioUnitario: producto?.precio ?? producto?.precioUnitario ?? 0,
        idLote: loteId,
      }]
    })
  }

  function changeCantidad(index: number, delta: number) {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item))
  }

  function removeItem(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  function calcularSubtotal() {
    return cart.reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0)
  }


  async function handleScan() {
    if (!scanCode) return
    try {
  const lote = await getLoteByCodigo(scanCode)
      if (!lote) {
        alert('Lote no encontrado')
        return
      }
      // obtener producto del lote (productos may use id, productoId or idProducto)
      const producto = productos.find(p => (p.id ?? p.productoId ?? p.idProducto ?? p._id) === lote.productoId)
      if (!producto) {
        alert('Producto del lote no está cargado en catálogo')
        return
      }
      addToCart(producto, lote.id)
      setScanCode('')
    } catch (err: any) {
      console.error(err)
      alert('Error al buscar lote: ' + err.message)
    }
  }

  async function handleConfirm(metodoPago: string) {
    if (cart.length === 0) return alert('Carrito vacío')
    setLoading(true)
    const subtotal = calcularSubtotal()
    const iva = calcularIVA(subtotal)
    const total = subtotal + iva

    // usuarioId: intentar leer de localStorage o extraer desde token JWT
    // helper: resolve usuarioId and token from localStorage / token
    function resolveUsuarioFromStorage(): { usuarioId: number | null; token: string | null } {
      const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).localStorage !== undefined
      let usuarioId: number | null = null
      let token: string | null = null
      if (!hasWindow) return { usuarioId, token }

      const raw = (globalThis as any).localStorage.getItem('user_id')
      token = (globalThis as any).localStorage.getItem('token')

      if (raw !== null && raw !== undefined && String(raw).trim() !== '' && String(raw) !== 'null' && String(raw) !== 'undefined') {
        const n = Number(raw)
        if (!Number.isNaN(n)) usuarioId = n
      }

      if (usuarioId == null && token) {
        try {
          const parts = token.split('.')
          if (parts.length >= 2) {
            const b64 = parts[1].replaceAll('-', '+').replaceAll('_', '/')
            // pad
            const pad = (4 - (b64.length % 4)) % 4
            const padded = b64 + '='.repeat(pad)
            const decoded = JSON.parse(atob(padded))
            const candidate = decoded.user_id || decoded.sub || decoded.id
            const n = Number(candidate)
            if (!Number.isNaN(n)) usuarioId = n
          }
        } catch (e) {
          console.debug('[VENTAS] token parse error extracting usuarioId', e)
        }
      }

      return { usuarioId, token }
    }

    const resolved = resolveUsuarioFromStorage()
    console.log('[VENTAS] usuarioId resolved', resolved.usuarioId, 'token present:', !!resolved.token)

    if (!resolved.token) {
      setLoading(false)
      return alert('No autenticado: por favor inicia sesión antes de confirmar la venta')
    }

    if (resolved.usuarioId == null) {
      setLoading(false)
      return alert('Usuario inválido: no se pudo determinar el usuario. Reingresa sesión o contacta al administrador.')
    }

    const usuarioId = Number(resolved.usuarioId)

    // Construir payload exactamente con los tipos esperados por backend (enteros / null para idLote)
    const payload = {
      usuarioId: Number(usuarioId),
      metodoPago: String(metodoPago),
      subtotal: Math.round(Number(subtotal)),
      iva: Math.round(Number(iva)),
      total: Math.round(Number(total)),
      detalles: cart.map((it: any) => ({
        productoId: Number(it.productoId),
        cantidad: Math.round(Number(it.cantidad)),
        precioUnitario: Math.round(Number(it.precioUnitario)),
        idLote: it.idLote == null ? null : Number(it.idLote),
      }))
    }

    console.log('[VENTAS] confirmarVenta payload', payload)

    try {
      const res = await confirmarVenta(payload)
      alert('Venta confirmada: id ' + (res?.id || '---'))
      // opcional: limpiar carrito
      setCart([])
      // redirigir a vista de recibo o listar ventas
      router.replace('/ventas')
    } catch (err: any) {
      console.error('Error confirmar venta', err.message)
      alert('Error al confirmar venta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // productos filtered handled by Catalog component

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-12 gap-6">
        <Catalog productos={productos} query={query} setQuery={setQuery} addToCart={addToCart} />

        <section className="col-span-7 bg-white rounded border p-4 h-[75vh] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Nueva Venta</h2>
            <div className="flex items-center gap-2">
              <ScanLoteInput scanCode={scanCode} setScanCode={setScanCode} onSearch={handleScan} />
              <button onClick={() => setCart([])} className="px-3 py-1 rounded bg-red-500 text-white">Limpiar</button>
            </div>
          </div>

          <Cart cart={cart} changeCantidad={changeCantidad} removeItem={removeItem} />

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between mb-2">
              <div>Subtotal:</div>
              <div className="font-semibold">CLP ${calcularSubtotal().toLocaleString()}</div>
            </div>
            <div className="flex justify-between mb-2">
              <div>IVA (19%):</div>
              <div className="font-semibold">CLP ${calcularIVA(calcularSubtotal()).toLocaleString()}</div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                <div className="text-lg font-semibold">Total:</div>
                <div className="text-2xl text-green-600 font-bold">CLP ${(calcularSubtotal() + calcularIVA(calcularSubtotal())).toLocaleString()}</div>
              </div>
              <div className="flex gap-3">
                <button disabled={loading} onClick={() => handleConfirm('EFECTIVO')} className="px-6 py-3 bg-green-500 text-white rounded">Efectivo</button>
                <button disabled={loading} onClick={() => handleConfirm('DEBITO')} className="px-6 py-3 bg-blue-500 text-white rounded">Tarjeta</button>
                <button disabled={loading} onClick={() => handleConfirm('TRANSFERENCIA')} className="px-6 py-3 bg-amber-500 text-white rounded">Transferencia</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
