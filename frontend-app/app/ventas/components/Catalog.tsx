"use client"

import React, { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { listarLotesPorProducto } from '@/lib/lotes'

function resolvePid(prod: any) {
  return prod?.id ?? prod?.productoId ?? prod?.idProducto ?? prod?._id ?? null
}

export default function Catalog({ productos, query, setQuery, addToCart }: Readonly<{ productos: any[]; query: string; setQuery: (v:string)=>void; addToCart: (p:any, idLote:number|null)=>void }>) {
  const [modalOpenFor, setModalOpenFor] = useState<number | null>(null)
  const [lotes, setLotes] = useState<any[]>([])
  const [loadingLotes, setLoadingLotes] = useState(false)

  const productosFiltrados = productos.filter((p: any) => p.nombre?.toLowerCase().includes(query.toLowerCase()))

  

  async function openLotes(prod: any) {
    const pid = resolvePid(prod)
    setModalOpenFor(pid)
    setLoadingLotes(true)
    try {
      const res = await listarLotesPorProducto(pid)
      setLotes(res || [])
    } catch (err) {
      console.error('Error fetching lotes for producto', err)
      setLotes([])
    } finally {
      setLoadingLotes(false)
    }
  }

  function closeModal() {
    setModalOpenFor(null)
    setLotes([])
  }

  return (
    <section className="col-span-5 bg-white rounded border p-4 h-[75vh] overflow-y-auto">
      <div className="mb-4">
        <div className="relative">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar producto o código..." className="w-full border rounded px-3 py-2" />
          <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="space-y-3">
        {productosFiltrados.map((prod: any) => {
          const pid = resolvePid(prod)
          return (
          <div key={pid ?? prod.id} className="flex items-center justify-between p-3 border rounded-md">
            <div>
              <div className="font-semibold">{prod.nombre}</div>
              <div className="text-sm text-muted-foreground">{prod.peso || ''} — CLP ${prod.precio?.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Stock: {prod.stock ?? prod.cantidad ?? '-'}</div>
              <button onClick={() => addToCart(prod, null)} className="ml-2 px-3 py-1 rounded bg-green-500 text-white">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => openLotes(prod)} className="ml-2 px-3 py-1 rounded bg-gray-200 text-gray-800">Lotes</button>
            </div>
          </div>
          )
        })}
      </div>

      {/* modal for lotes selection */}
      {modalOpenFor !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-96">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Seleccionar lote</h3>
              <button onClick={closeModal} className="text-sm text-gray-500">Cerrar</button>
            </div>
            {loadingLotes ? <div>Cargando lotes...</div> : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 border rounded flex items-center justify-between">
                  <div>Sin lote</div>
                  <button onClick={() => { const prod = productos.find(p => (p.id ?? p.productoId ?? p.idProducto ?? p._id) === modalOpenFor); if (prod) { addToCart(prod, null); closeModal() } }} className="px-2 py-1 bg-green-500 text-white rounded">Agregar</button>
                </div>
                {lotes.map(l => (
                  <div key={l.id} className="p-2 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Lote #{l.numero ?? l.codigoLote}</div>
                      <div className="text-sm text-muted-foreground">Vence: {l.fechaVencimiento ?? l.fecha_vencimiento}</div>
                      <div className="text-sm text-muted-foreground">Stock: {l.cantidad ?? l.stock ?? '-'}</div>
                    </div>
                    <button onClick={() => { const prod = productos.find(p => (p.id ?? p.productoId ?? p.idProducto ?? p._id) === modalOpenFor); if (prod) { addToCart(prod, l.id); closeModal() } }} className="px-2 py-1 bg-green-500 text-white rounded">Agregar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
