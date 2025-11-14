"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { getCategorias } from '@/lib/productos'
import { printLotes, printLote, buildLabelsHtml } from './PrintLotes'
import { Printer } from 'lucide-react'

interface ViewProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
}

function CategoriaName({ product }: { product: any }) {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        // If backend already provided a category name, use it
        if (product?.categoria && typeof product.categoria === 'string') {
          if (mounted) setName(product.categoria)
          return
        }

        const id = product?.categoriaId ?? product?.categoria
        if (!id) {
          if (mounted) setName(null)
          return
        }

        const cats = await getCategorias()
        if (!mounted) return
        if (Array.isArray(cats)) {
          const found = cats.find((c: any) => c.idCategoria === id || c.idCategoria === Number(id) || c.id === Number(id) || c.nombre === id)
          if (found && found.nombre) {
            setName(found.nombre)
            return
          }
        }
        // Fallback: show the raw id
        setName(String(id))
      } catch (e) {
        if (mounted) setName(String(product?.categoriaId ?? product?.categoria ?? '-'))
      }
    }
    init()
    return () => { mounted = false }
  }, [product])

  return <span className="text-sm text-[#2E2A26]">{name ?? '-'}</span>
}

export default function ViewProductDialog({ open, onOpenChange, product }: ViewProductDialogProps) {
  if (!product) return null

  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printTarget, setPrintTarget] = useState<any | 'all' | null>(null)
  const [printQuantity, setPrintQuantity] = useState<number>(1)

  const lotes = Array.isArray(product.lotes) ? product.lotes : []
  const stockFromLotes = lotes.reduce((s: number, l: any) => s + (Number(l.cantidad) || 0), 0)
  const formatDate = (d: string | undefined) => {
    try {
      if (!d) return '-'
      const dt = new Date(d)
      if (isNaN(dt.getTime())) return d
      return dt.toLocaleDateString('es-CL')
    } catch {
      return d || '-'
    }
  }

  return (
    
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle del Producto</DialogTitle>
          <DialogDescription>Información detallada del producto</DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-2">
          <div>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-[#F3F2F1] rounded overflow-hidden">
                <img 
                  src={product.imagen || '/imagenes-productos/Almendras Orgánica.png'} 
                  alt={product.nombre || product.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <div className="text-lg font-semibold">{product.nombre || product.name}</div>
                <div className="text-sm text-[#A0522D]">Precio: CLP ${product.precio ?? product.price}</div>
                <div className="text-sm text-[#7A6F66]">Presentación: {product.unidad || product.unit}</div>
                <div className="text-sm text-[#7A6F66]">
                  Stock: {product.stock ?? product.stockActual ?? (product.cantidad ?? '0')} paquetes
                </div>
              </div>
            </div>
            {product.descripcion && <p className="mt-3 text-sm">{product.descripcion}</p>}

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
              
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Código</span>
                <span className="text-sm text-[#2E2A26]">{product.codigo ?? '-'}</span>
              </div>
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Categoría</span>
                <CategoriaName product={product} />
              </div>
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Precio</span>
                <span className="text-sm text-[#2E2A26]">
                  CLP ${String(product.precio ?? product.price ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Presentación</span>
                <span className="text-sm text-[#2E2A26]">{product.unidad ?? product.unit ?? '-'}</span>
              </div>
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Stock</span>
                <span className="text-sm text-[#2E2A26]">{product.stock ?? product.cantidad ?? 0} paquetes</span>
              </div>
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Estado</span>
                <span className="text-sm text-[#2E2A26]">
                  {typeof product.estado !== 'undefined' ? (product.estado ? 'Activo' : 'Inactivo') : '-'}
                </span>
              </div>
              
            </div>
          </div>
        </div>
  {/* Lotes */}
        <div className="mt-4">
            <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#2E2A26] mb-2">Lotes</h4>
            <div>
              <button onClick={() => { setPrintTarget('all'); setPrintQuantity(1); setPrintDialogOpen(true) }} className="px-3 py-1 rounded bg-[#A0522D] text-white text-xs flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span>Imprimir etiquetas</span>
              </button>
            </div>
          </div>
          {lotes.length === 0 ? (
            <div className="text-sm text-[#7A6F66]">No hay lotes asociados a este producto.</div>
          ) : (
            <div className="space-y-2">
              {lotes.map((l: any) => (
                <div key={l.idLote ?? l.codigoLote ?? Math.random()} className="bg-white border border-[#F5EDE4] p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-[#2E2A26]">{l.codigoLote ?? `Lote ${l.idLote ?? '-'}`}</div>
                        <button onClick={() => { setPrintTarget(l); setPrintQuantity(1); setPrintDialogOpen(true) }} title="Imprimir etiqueta" className="text-xs px-2 py-1 bg-[#F5EDE4] rounded hover:bg-[#E5DDD4] flex items-center gap-2">
                          <Printer className="w-3 h-3" />
                          <span>Imprimir</span>
                        </button>
                      </div>
                      <div className="text-xs text-[#7A6F66]">ID lote: {l.idLote ?? '-'}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-sm text-[#2E2A26] font-semibold">{Number(l.cantidad || 0)} u</div>
                      <div className="text-xs text-[#7A6F66]">Ingreso: {formatDate(l.fechaIngreso || l.fecha_ingreso)}</div>
                      <div className="text-xs text-[#7A6F66]">Venc.: {formatDate(l.fechaVencimiento || l.fecha_vencimiento)}</div>
                      <div className={`text-xs font-medium mt-1 ${l.estado ? 'text-emerald-700' : 'text-red-600'}`}>{l.estado ? 'Activo' : 'Inactivo'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Print dialog */}
        <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Imprimir etiquetas</DialogTitle>
              <DialogDescription>
                {printTarget === 'all' ? '¿Cuántas etiquetas por lote quieres imprimir?' : `¿Cuántas etiquetas quieres imprimir para ${printTarget?.codigoLote ?? `lote ${printTarget?.idLote ?? ''}` }?`}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              <label className="text-sm text-[#7A6F66] block mb-2">Copias por lote</label>
              <input type="number" min={1} value={printQuantity} onChange={(e) => setPrintQuantity(Math.max(1, Number(e.target.value || 1)))} className="w-full px-3 py-2 border rounded" />
            </div>

            <DialogFooter>
              <DialogClose className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border rounded text-[#7A6F66]">Cancelar</DialogClose>
              <button onClick={async () => {
                try {
                  const qty = Number(printQuantity) || 1
                  let expanded: any[] = []
                  if (printTarget === 'all') {
                    for (const l of lotes) for (let i=0;i<qty;i++) expanded.push(l)
                  } else if (printTarget) {
                    for (let i=0;i<qty;i++) expanded.push(printTarget)
                  }

                  // Build printable HTML string (client-side). This avoids opening a new window immediately.
                  const html = await buildLabelsHtml(expanded, product)
                  if (!html) {
                    console.warn('No HTML generated for labels')
                    return
                  }

                  // Create a hidden iframe, write the HTML into it, then call print on its window.
                  const iframe = document.createElement('iframe')
                  iframe.style.position = 'fixed'
                  iframe.style.right = '0'
                  iframe.style.bottom = '0'
                  iframe.style.width = '0'
                  iframe.style.height = '0'
                  iframe.style.border = '0'
                  iframe.style.visibility = 'hidden'
                  document.body.appendChild(iframe)

                  const doc = iframe.contentWindow?.document
                  if (doc) {
                    doc.open()
                    doc.write(html)
                    doc.close()
                    const win = iframe.contentWindow
                    // Wait a bit for resources to render, then print
                    win?.focus()
                    setTimeout(() => {
                      try {
                        win?.print()
                      } catch (err) {
                        console.error('Print iframe error', err)
                        // fallback to opening a new window
                        printLotes(expanded, product)
                      } finally {
                        // remove iframe after a short delay
                        setTimeout(() => { try { document.body.removeChild(iframe) } catch {} }, 500)
                      }
                    }, 300)
                  } else {
                    // fallback
                    await printLotes(expanded, product)
                  }
                } catch (e) {
                  console.error('print error', e)
                } finally {
                  setPrintDialogOpen(false)
                }
              }} className="px-3 py-2 bg-[#A0522D] text-white rounded">Imprimir</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <DialogFooter>
          <DialogClose className="px-3 py-2 bg-white border rounded">Cerrar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
