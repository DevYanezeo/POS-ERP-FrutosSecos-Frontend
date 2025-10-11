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

interface ViewProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
}

export default function ViewProductDialog({ open, onOpenChange, product }: ViewProductDialogProps) {
  if (!product) return null

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
                <span className="text-sm text-[#7A6F66]">ID</span>
                <span className="text-sm text-[#2E2A26]">{product.idProducto ?? product.id ?? '-'}</span>
              </div>
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Código</span>
                <span className="text-sm text-[#2E2A26]">{product.codigo ?? '-'}</span>
              </div>
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Categoría ID</span>
                <span className="text-sm text-[#2E2A26]">{product.categoriaId ?? product.categoria ?? '-'}</span>
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
              <div className="flex justify-between bg-[#FBF7F4] p-2 rounded">
                <span className="text-sm text-[#7A6F66]">Vencimiento</span>
                <span className="text-sm text-[#2E2A26]">
                  {product.fechaVencimiento ?? product.fecha_vencimiento ?? '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose className="px-3 py-2 bg-white border rounded">Cerrar</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
