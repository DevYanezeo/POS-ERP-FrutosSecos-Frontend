"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"
import { getProductos, buscarProductos, deleteProducto, saveProducto, getProductoById, updateProducto, agregarStock, quitarStock } from "../../lib/productos"

export default function InventarioPage() {
  
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [productosError, setProductosError] = useState<string | null>(null)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("Frutos secos")
  const [precio, setPrecio] = useState<number | ''>("")
  const [unidad, setUnidad] = useState("")
  const [stockVal, setStockVal] = useState<number | ''>("")
  const [adding, setAdding] = useState(false)

  const fetchProductos = async () => {
    setLoading(true)
  setProductosError(null)
    try {
      const data = await getProductos()
      const mapped = (data || []).map((p: any) => ({
        id: p.idProducto || p.id || 0,
        name: p.nombre || p.name || 'Sin nombre',
        category: p.categoria || `ID:${p.categoriaId || ''}`,
        price: `CLP $${(p.precio ?? 0).toLocaleString()}`,
        unit: p.unidad || '',
        stock: `${p.stock ?? 0} unidades`,
        image: p.imagen || '/pile-of-almonds.png',
        raw: p,
      }))
  setProductos(mapped)
    } catch (e: any) {
      setProductosError(e?.message || 'Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProductos() }, [])

  

  return (
    <div className="min-h-screen p-6 bg-[#F9F6F3]">
      <h1 className="text-3xl font-bold mb-6">Inventario</h1>
      <div className="mb-6 flex items-center justify-end">
        <button onClick={() => setShowAddForm((s) => !s)} className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-medium transition-all duration-200 shadow-sm">
          <Plus className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-[#F5EDE4] shadow-sm">
          <h3 className="font-semibold mb-3">Agregar Producto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded" />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="px-3 py-2 border rounded">
              <option>Frutos secos</option>
              <option>Cereales</option>
              <option>Legumbres</option>
              <option>Semillas</option>
              <option>Endulzantes</option>
              <option>Especias</option>
            </select>
            <input value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Precio (número)" type="number" className="px-3 py-2 border rounded" />
            <input value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="Unidad (e.g. 200 gr)" className="px-3 py-2 border rounded" />
            <input value={stockVal} onChange={(e) => setStockVal(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Stock" type="number" className="px-3 py-2 border rounded" />
            <div className="flex items-center gap-2">
              <button disabled={adding} onClick={async () => {
                if (!nombre) return alert('Nombre requerido')
                setAdding(true)
                try {
                  await saveProducto({ nombre, categoria, precio: Number(precio || 0), unidad, stock: Number(stockVal || 0) })
                  setNombre('')
                  setCategoria('Frutos secos')
                  setPrecio('')
                  setUnidad('')
                  setStockVal('')
                  setShowAddForm(false)
                  await fetchProductos()
                } catch (e: any) {
                  alert(e?.message || 'Error agregando producto')
                } finally { setAdding(false) }
              }} className="px-4 py-2 bg-green-600 text-white rounded">{adding ? 'Guardando...' : 'Guardar'}</button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-[#7A6F66]">Cargando productos...</div>
      ) : productosError ? (
        <div className="py-8 text-center text-sm text-[#991B1B]">{productosError}</div>
      ) : productos.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#7A6F66]">No hay productos.</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {productos.map((product) => (
            <div key={product.id} className="bg-[#FFFFFF] rounded-xl p-4 shadow-sm border border-[#F5EDE4]">
              <div className="mb-3">
                <Image src={product.image} alt={product.name} width={100} height={100} className="object-cover rounded-lg" />
              </div>
              <h3 className="text-[#2E2A26] font-semibold text-sm mb-1">{product.name}</h3>
              <p className="text-[#A0522D] font-bold text-sm mb-1">{product.price}</p>
              <p className="text-[#7A6F66] text-xs mb-2">{product.unit} • {product.stock}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={async () => {
                    try {
                      const id = product.raw?.idProducto || product.id
                      const detalle = await getProductoById(id)
                      alert(JSON.stringify(detalle, null, 2))
                    } catch (e: any) {
                      alert(e?.message || 'Error cargando detalle')
                    }
                  }}
                  className="px-3 py-1 bg-[#6B7280] hover:bg-[#4B5563] text-white rounded-md text-xs"
                >
                  Ver
                </button>
+
                <button
                  onClick={async () => {
                    try {
                      const id = product.raw?.idProducto || product.id
                      const detalle = await getProductoById(id)
                      const nuevoNombre = prompt('Nombre', detalle?.nombre || detalle?.name || product.name)
                      if (nuevoNombre === null) return
                      const nuevoPrecioStr = prompt('Precio (número)', String(detalle?.precio ?? ''))
                      if (nuevoPrecioStr === null) return
                      const nuevoUnidad = prompt('Unidad', detalle?.unidad || product.unit) ?? ''
                      const nuevaCategoria = prompt('Categoría', detalle?.categoria || product.category) ?? ''
                      const nuevoStockStr = prompt('Stock', String(detalle?.stock ?? (product.raw?.stock ?? '0')))
                      if (nuevoStockStr === null) return

                      const payload: any = {
                        nombre: nuevoNombre,
                        precio: Number(nuevoPrecioStr || 0),
                        unidad: nuevoUnidad,
                        categoria: nuevaCategoria,
                        stock: Number(nuevoStockStr || 0),
                      }

                      await updateProducto(id, payload)
                      await fetchProductos()
                      alert('Producto actualizado')
                    } catch (e: any) {
                      alert(e?.message || 'Error actualizando producto')
                    }
                  }}
                  className="px-3 py-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-md text-xs"
                >
                  Editar
                </button>
+
                <button
                  onClick={async () => {
                    try {
                      const id = product.raw?.idProducto || product.id
                      const cantidadStr = prompt('Cantidad a agregar (número)', '1')
                      if (!cantidadStr) return
                      const cantidad = Number(cantidadStr)
                      if (isNaN(cantidad) || cantidad <= 0) return alert('Cantidad inválida')
                      await agregarStock(id, cantidad)
                      await fetchProductos()
                      alert('Stock agregado')
                    } catch (e: any) {
                      alert(e?.message || 'Error agregando stock')
                    }
                  }}
                  className="px-3 py-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-md text-xs"
                >
                  Agregar stock
                </button>
+
                <button
                  onClick={async () => {
                    try {
                      const id = product.raw?.idProducto || product.id
                      const cantidadStr = prompt('Cantidad a quitar (número)', '1')
                      if (!cantidadStr) return
                      const cantidad = Number(cantidadStr)
                      if (isNaN(cantidad) || cantidad <= 0) return alert('Cantidad inválida')
                      if (!confirm(`Quitar ${cantidad} unidades de ${product.name}?`)) return
                      await quitarStock(id, cantidad)
                      await fetchProductos()
                      alert('Stock actualizado')
                    } catch (e: any) {
                      alert(e?.message || 'Error quitando stock')
                    }
                  }}
                  className="px-3 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-md text-xs"
                >
                  Quitar stock
                </button>
+
                <button
                  onClick={async () => {
                    if (!confirm(`Eliminar producto \"${product.name}\"?`)) return
                    try {
                      await deleteProducto(product.raw?.idProducto || product.id)
                      await fetchProductos()
                    } catch (e: any) {
                      alert(e?.message || 'Error eliminando producto')
                    }
                  }}
                  className="px-3 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-md text-xs"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
