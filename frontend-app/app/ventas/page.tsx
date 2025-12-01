"use client"

import React, { useEffect, useState } from 'react'
import { getProductos, buscarProductos, getCategorias, getProductoByCodigo } from '@/lib/productos'
import { getLoteByCodigo } from '@/lib/lotes'
import { confirmarVenta } from '@/lib/ventas'
import { useRouter } from 'next/navigation'
import ScanProductoInput from './components/ScanProductoInput'
import { Loader2, ShoppingCart, Edit2, Trash2 } from 'lucide-react'

function calcularIVA(subtotal: number) {
  // IVA removed per client request: always 0
  return 0
}

// Generate printable boleta (opens print dialog). Uses /logo.png from public.
function generarBoletaVenta(cart: any[], saleId?: any) {
  try {
    const subtotal = cart.reduce((s, it) => s + (Number(it.precioUnitario) * Number(it.cantidad)), 0)
    const logoUrl = '/logo.png'
    const title = 'RESUMEN DE COMPRA - DETALLE DE VENTA'
    const footerNote = `Documento no válido como venta`

    const rows = (cart || []).map((it: any) => `
      <tr>
        <td style="padding:6px 0">${it.nombre || it.name}</td>
        <td style="text-align:center">${it.cantidad}</td>
        <td style="text-align:right">${Number(it.precioUnitario || it.price).toLocaleString()}</td>
        <td style="text-align:right">${(Number(it.precioUnitario || it.price) * Number(it.cantidad)).toLocaleString()}</td>
      </tr>
    `).join('\n')

    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Boleta</title>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>
        body{font-family:Arial,Helvetica,sans-serif;margin:0;padding:10px;color:#222}
        /* increased width so columns can separate */
        .receipt{width:420px;margin:0 auto}
        .logo{width:90px;margin:0 auto;display:block}
        h1{font-size:14px;text-align:center;margin:8px 0}
        table{width:100%;font-size:13px;border-collapse:collapse}
        td{padding:6px 4px;vertical-align:top}
        thead td{font-weight:700;padding-bottom:8px}
        /* column widths: product flexible, others fixed */
        td:nth-child(1){width:56%;}
        td:nth-child(2){width:14%;text-align:center}
        td:nth-child(3){width:15%;text-align:right}
        td:nth-child(4){width:15%;text-align:right}
        .right{text-align:right}
        .tot{border-top:1px dashed #ccc;margin-top:10px;padding-top:10px;font-weight:700}
        .footer{font-size:10px;color:#555;margin-top:10px}
        .note{color:#a00;font-weight:600;font-size:11px}
      </style>
      </head><body><div class="receipt"><img src="${logoUrl}" class="logo" alt="logo"/><h1>${title}</h1>
      <table><thead><tr><td>Producto</td><td>Cant.</td><td>P.Unit</td><td>Total</td></tr></thead><tbody>${rows}</tbody></table>
      <div class="tot"><div style="display:flex;justify-content:space-between">SUBTOTAL<span>${subtotal.toLocaleString()}</span></div><div style="display:flex;justify-content:space-between;margin-top:8px">TOTAL<span>${subtotal.toLocaleString()}</span></div></div>
      <div class="footer"><p class="note">Este documento NO es válido como comprobante fiscal.</p><p>${footerNote}</p>${saleId ? `<p>ID venta: ${saleId}</p>` : ''}</div></div>
      <script>window.onload=function(){setTimeout(()=>window.print(),200)}</script></body></html>`

    const w = window.open('', '_blank', 'width=420,height=800')
    if (!w) { console.warn('No se pudo abrir ventana de impresión'); return }
    w.document.open()
    w.document.write(html)
    w.document.close()
  } catch (e) { console.error('Error generando boleta', e) }
}

// types: using any for now to match project style
// using implicit any for Producto and Lote to match project style
export default function VentasPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)
  const [searchCategory, setSearchCategory] = useState<string>('')
  const [editingItem, setEditingItem] = useState<number | null>(null)
  // keep edit fields as strings while typing to avoid Number('') => 0 behaviour
  const [editCantidad, setEditCantidad] = useState<string>('1')
  const [editPrecio, setEditPrecio] = useState<string>('0')
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showFiadoModal, setShowFiadoModal] = useState(false)
  const [clienteNombre, setClienteNombre] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')

  useEffect(() => {
    fetchProductos()
    fetchCategorias()
  }, [])

  async function fetchProductos() {
    try {
      setLoading(true)
      const res = await getProductos()
      setProductos(res || [])
    } catch (err: any) {
      showNotification('error', 'Error cargando productos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategorias() {
    try {
      const res = await getCategorias()
      setCategorias(res || [])
    } catch (err: any) {
      console.error('Error cargando categorías', err.message)
    }
  }

  function showNotification(type: 'success' | 'error' | 'warning', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  function handleProductoScanned(producto: any) {
    addToCart(producto, null)
    showNotification('success', `${producto.nombre} agregado al carrito`)
  }

  function handleScanError(message: string) {
    showNotification('error', message)
  }

  function addToCart(producto: any, loteId: number | null = null) {
    // normalize product id: backend shape may vary (id | productoId | idProducto | _id)
    const pid = producto?.id ?? producto?.productoId ?? producto?.idProducto ?? producto?._id ?? null
    const stockDisponible = producto?.stock ?? 0

    console.log('[VENTAS] addToCart called', { producto, resolvedId: pid, loteId, stock: stockDisponible })

    // Validar stock disponible
    if (stockDisponible <= 0) {
      showNotification('error', `Sin stock disponible para ${producto?.nombre || 'este producto'}`)
      return
    }

    setCart(prev => {
      const existing = prev.find((p: any) => p.productoId === pid && p.idLote === loteId)

      if (existing) {
        // Verificar que no exceda el stock al incrementar
        const nuevaCantidad = existing.cantidad + 1
        if (nuevaCantidad > stockDisponible) {
          showNotification('warning', `Stock insuficiente. Disponible: ${stockDisponible} unidades`)
          return prev // No incrementar
        }
        return prev.map(p => p === existing ? { ...p, cantidad: nuevaCantidad } : p)
      }

      // Nuevo item en carrito
      return [...prev, {
        productoId: pid,
        nombre: producto?.nombre ?? producto?.titulo ?? 'Producto',
        cantidad: 1,
        precioUnitario: producto?.precio ?? producto?.precioUnitario ?? 0,
        idLote: loteId,
        stockDisponible: stockDisponible, // Guardar stock para validaciones posteriores
      }]
    })
  }

  function changeCantidad(index: number, delta: number) {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newCantidad = item.cantidad + delta

        // No permitir cantidad menor a 1
        if (newCantidad < 1) {
          return item
        }

        // Validar stock disponible si se está incrementando
        if (delta > 0 && item.stockDisponible) {
          if (newCantidad > item.stockDisponible) {
            showNotification('warning', `Stock insuficiente. Disponible: ${item.stockDisponible} unidades`)
            return item
          }
        }

        validateCartItem(i, newCantidad, item.precioUnitario)
        return { ...item, cantidad: newCantidad }
      }
      return item
    }))
  }

  function removeItem(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index))
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }

  function validateCartItem(index: number, cantidad: number, precio: number): boolean {
    const item = cart[index]
    const errors: Record<number, string> = { ...validationErrors }

    if (cantidad <= 0) {
      errors[index] = 'La cantidad debe ser mayor a 0'
      setValidationErrors(errors)
      return false
    }

    if (precio <= 0) {
      errors[index] = 'El precio debe ser mayor a 0'
      setValidationErrors(errors)
      return false
    }

    // Validar stock disponible
    if (item?.stockDisponible && cantidad > item.stockDisponible) {
      errors[index] = `Stock insuficiente. Disponible: ${item.stockDisponible} unidades`
      setValidationErrors(errors)
      return false
    }

    delete errors[index]
    setValidationErrors(errors)
    return true
  }

  function startEditingItem(index: number) {
    setEditingItem(index)
    setEditCantidad(String(cart[index].cantidad))
    setEditPrecio(String(cart[index].precioUnitario))
  }

  function saveEditedItem() {
    if (editingItem === null) return
    // parse numbers from edit strings
    const cantidadNum = Number(editCantidad)
    const precioNum = Number(editPrecio)

    if (!validateCartItem(editingItem, cantidadNum, precioNum)) {
      showNotification('error', 'Valores inválidos')
      return
    }

    setCart(prev => prev.map((item, i) =>
      i === editingItem
        ? { ...item, cantidad: cantidadNum, precioUnitario: precioNum }
        : item
    ))

    setEditingItem(null)
    showNotification('success', 'Producto actualizado')
  }

  function cancelEdit() {
    setEditingItem(null)
  }

  function calcularSubtotal() {
    return cart.reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0)
  }

  async function handleAdvancedSearch() {
    try {
      setLoading(true)

      if (searchCategory) {
        // Buscar por categoría
        const categoriaObj = categorias.find(c => c.nombre === searchCategory)
        if (categoriaObj) {
          const res = await buscarProductos(query || '', searchCategory)
          const filtered = res.filter((p: any) => p.categoriaId === categoriaObj.idCategoria)
          setProductos(filtered)
        }
      } else if (query) {
        // Buscar por nombre o código
        const res = await buscarProductos(query)
        setProductos(res || [])
      } else {
        // Sin filtros, mostrar todos
        await fetchProductos()
      }
    } catch (err: any) {
      showNotification('error', 'Error en búsqueda: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Función helper para búsqueda automática al cambiar categoría
  async function handleCategoryChange(newCategory: string) {
    setSearchCategory(newCategory)

    try {
      setLoading(true)

      if (newCategory) {
        // Si hay categoría seleccionada, buscar con ella
        const categoriaObj = categorias.find(c => c.nombre === newCategory)
        if (categoriaObj) {
          const res = await buscarProductos(query || '', newCategory)
          const filtered = res.filter((p: any) => p.categoriaId === categoriaObj.idCategoria)
          setProductos(filtered)
        }
      } else {
        // Si se selecciona "Todas", buscar con query o mostrar todos
        if (query.trim()) {
          const res = await buscarProductos(query)
          setProductos(res || [])
        } else {
          await fetchProductos()
        }
      }
    } catch (err: any) {
      console.error('Error buscar productos:', err)
      showNotification('error', 'Error al buscar productos')
    } finally {
      setLoading(false)
    }
  }

  function clearSearch() {
    setQuery('')
    setSearchCategory('')
    fetchProductos()
  }

  async function handleConfirm(metodoPago: string, esFiado: boolean = false, clienteId?: number | null, fechaVencimientoPago?: string | null) {
    if (cart.length === 0) {
      showNotification('warning', 'El carrito está vacío')
      return
    }

    // Validar todos los items
    let hasErrors = false
    cart.forEach((item, index) => {
      if (!validateCartItem(index, item.cantidad, item.precioUnitario)) {
        hasErrors = true
      }
    })

    if (hasErrors) {
      showNotification('error', 'Por favor corrija los errores en el carrito')
      return
    }

    setProcessingPayment(true)
    const subtotal = calcularSubtotal()
    const iva = 0 // IVA removed
    const total = subtotal

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
            const pad = (4 - (b64.length % 4)) % 4
            const padded = b64 + '='.repeat(pad)
            const decoded = JSON.parse(atob(padded))
            const candidate = decoded.user_id || decoded.sub || decoded.id
            const n = Number(candidate)
            if (!Number.isNaN(n)) usuarioId = n
          }
        } catch (e) {
          console.debug('[VENTAS] token parse error', e)
        }
      }

      return { usuarioId, token }
    }

    const resolved = resolveUsuarioFromStorage()

    if (!resolved.token) {
      setProcessingPayment(false)
      showNotification('error', 'No autenticado. Por favor inicie sesión')
      return
    }

    if (resolved.usuarioId == null) {
      setProcessingPayment(false)
      showNotification('error', 'Usuario inválido. Reingrese sesión')
      return
    }

    const usuarioId = Number(resolved.usuarioId)

    const payload: any = {
      usuarioId: Number(usuarioId),
      metodoPago: esFiado ? null : String(metodoPago),
      subtotal: Math.round(Number(subtotal)),
      iva: 0,
      total: Math.round(Number(total)),
      fiado: esFiado,
      clienteId: clienteId || null,
      fechaVencimientoPago: fechaVencimientoPago || null,
      detalles: cart.map((it: any) => ({
        productoId: Number(it.productoId),
        cantidad: Math.round(Number(it.cantidad)),
        precioUnitario: Math.round(Number(it.precioUnitario)),
        idLote: it.idLote == null ? null : Number(it.idLote),
      }))
    }

    try {
      const res = await confirmarVenta(payload)
      showNotification('success', `Venta confirmada exitosamente. ID: ${res?.id || '---'}`)
      // Generate and trigger boleta print immediately
      try { generarBoletaVenta(cart, res?.id) } catch (e) { console.error('Error al generar boleta', e) }
      setCart([])

      // Opcional: redirigir o mostrar recibo
      setTimeout(() => {
        // router.push('/ventas/historial')
      }, 2000)
    } catch (err: any) {
      console.error('Error confirmar venta', err.message)

      // Detectar error de stock insuficiente
      const errorMsg = err.message || String(err)
      if (errorMsg.includes('Stock insuficiente') || errorMsg.includes('stock')) {
        const productoConError = errorMsg.match(/producto (\d+)/)?.[1]
        if (productoConError) {
          const itemError = cart.find((item: any) => String(item.productoId) === productoConError)
          showNotification('error',
            `❌ Stock insuficiente para "${itemError?.nombre || 'este producto'}". ` +
            `Puede que el producto tenga stock general pero sin lotes activos disponibles. ` +
            `Verifique en el módulo de Inventario.`
          )
        } else {
          showNotification('error', 'Stock insuficiente. Verifique los lotes disponibles en Inventario.')
        }
      } else {
        showNotification('error', 'Error al confirmar venta: ' + errorMsg)
      }
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in border-2 ${notification.type === 'success'
          ? 'bg-green-500 text-white border-green-600'
          : notification.type === 'warning'
            ? 'bg-yellow-500 text-white border-yellow-600'
            : 'bg-red-500 text-white border-red-600'
          }`}>
          {notification.type === 'success' ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : notification.type === 'warning' ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium text-base">{notification.message}</span>
        </div>
      )}

      <div className="max-w-[95%] mx-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Catálogo - Lado Izquierdo */}
          <div className="col-span-5 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Catálogo de Productos</h2>

              {/* Búsqueda Avanzada */}
              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdvancedSearch()}
                    placeholder="Buscar por nombre o código..."
                    className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAdvancedSearch}
                    disabled={loading}
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors text-lg flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    Buscar
                  </button>
                </div>

                <div className="flex gap-2">
                  <select
                    value={searchCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                      <option key={cat.idCategoria} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                  <button
                    onClick={clearSearch}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors text-lg"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Lista de Productos */}
              <div className="max-h-[calc(100vh-350px)] overflow-y-auto space-y-2 pr-2">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className="text-gray-600 text-lg">Cargando productos...</p>
                  </div>
                ) : productos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No se encontraron productos</p>
                  </div>
                ) : (
                  productos.map((producto) => {
                    const pid = producto?.id ?? producto?.productoId ?? producto?.idProducto ?? producto?._id
                    const stock = producto.stock || 0
                    const sinStock = stock === 0
                    const stockBajo = stock > 0 && stock <= 5

                    return (
                      <div
                        key={pid}
                        onClick={() => !sinStock && addToCart(producto, null)}
                        className={`p-4 border-2 rounded-lg transition-all ${sinStock
                          ? 'border-red-300 bg-red-50 cursor-not-allowed opacity-60'
                          : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-800">{producto.nombre}</h3>
                              {sinStock && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                  SIN STOCK
                                </span>
                              )}
                              {stockBajo && (
                                <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded">
                                  STOCK BAJO
                                </span>
                              )}
                            </div>
                            {producto.codigo && (
                              <p className="text-sm text-gray-500">Código: {producto.codigo}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-1">{producto.unidad || 'Unidad'}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${sinStock ? 'text-gray-400' : 'text-green-600'}`}>
                              ${(producto.precio || 0).toLocaleString()}
                            </p>
                            <p className={`text-sm font-semibold ${sinStock ? 'text-red-600' : stockBajo ? 'text-yellow-600' : 'text-gray-500'
                              }`}>
                              Stock: {stock}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Carrito y Pago - Lado Derecho */}
          <div className="col-span-7 space-y-4">
            {/* Scanner de Código de Barras */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Escanear Código de Barras</h3>
              <ScanProductoInput
                onProductFound={handleProductoScanned}
                onError={handleScanError}
              />
              <p className="text-sm text-blue-700 mt-2">
                Use el lector de códigos o escriba manualmente y presione Enter
              </p>
            </div>

            {/* Carrito */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-gray-800" strokeWidth={2} />
                  <h2 className="text-2xl font-bold text-gray-800">Carrito de Compra</h2>
                </div>
                <button
                  onClick={() => {
                    setCart([])
                    setValidationErrors({})
                    showNotification('success', 'Carrito limpiado')
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Limpiar Todo
                </button>
              </div>

              <div className="h-[300px] overflow-y-auto mb-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" strokeWidth={1.5} />
                    <p className="text-gray-500 text-lg">El carrito está vacío</p>
                    <p className="text-gray-400 text-sm mt-2">Escanee o seleccione productos para agregar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => (
                      <div
                        key={index}
                        className={`p-4 border-2 rounded-lg ${validationErrors[index] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                          }`}
                      >
                        {editingItem === index ? (
                          // Modo Edición
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-800">{item.nombre}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Cantidad</label>
                                <input
                                  type="number"
                                  value={editCantidad}
                                  onChange={(e) => setEditCantidad(e.target.value)}
                                  min="1"
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Precio Unitario</label>
                                <input
                                  type="number"
                                  value={editPrecio}
                                  onChange={(e) => setEditPrecio(e.target.value)}
                                  min="0"
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditedItem}
                                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Modo Vista
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-gray-800">{item.nombre}</h4>
                                <p className="text-sm text-gray-600">
                                  ${item.precioUnitario.toLocaleString()} × {item.cantidad}
                                </p>
                              </div>
                              <p className="text-xl font-bold text-green-600">
                                ${(item.precioUnitario * item.cantidad).toLocaleString()}
                              </p>
                            </div>

                            {validationErrors[index] && (
                              <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                                {validationErrors[index]}
                              </div>
                            )}

                            <div className="flex gap-2 items-center">
                              <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-3 py-1">
                                <button
                                  onClick={() => changeCantidad(index, -1)}
                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold text-lg"
                                >
                                  -
                                </button>
                                <span className="font-semibold text-lg px-2">{item.cantidad}</span>
                                <button
                                  onClick={() => changeCantidad(index, 1)}
                                  className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold text-lg"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => startEditingItem(index)}
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
                                title="Editar producto"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-sm">Editar</span>
                              </button>
                              <button
                                onClick={() => removeItem(index)}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
                                title="Eliminar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Eliminar</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totales */}
              {cart.length > 0 && (
                <div className="border-t-2 border-gray-300 pt-4 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold text-gray-800">${calcularSubtotal().toLocaleString()}</span>
                  </div>
                  {/* IVA row removed (was showing $0) */}
                  <div className="flex justify-between text-2xl border-t-2 border-gray-300 pt-3">
                    <span className="font-bold text-gray-900">TOTAL:</span>
                    <span className="font-bold text-green-600">
                      ${(calcularSubtotal() + calcularIVA(calcularSubtotal())).toLocaleString()}
                    </span>
                  </div>

                  {/* Botón de Pago */}
                  <div className="mt-6">
                    <button
                      disabled={processingPayment || Object.keys(validationErrors).length > 0}
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full px-6 py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all text-2xl shadow-xl flex items-center justify-center gap-3"
                    >
                      {processingPayment ? <Loader2 className="w-6 h-6 animate-spin" /> : null}
                      💳 PAGAR
                    </button>
                  </div>

                  {Object.keys(validationErrors).length > 0 && (
                    <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
                      <p className="text-red-700 font-semibold text-center">
                        Por favor corrija los errores antes de continuar
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Selección de Método de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl border-2 border-gray-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
              <h3 className="text-2xl font-bold">Seleccionar Método de Pago</h3>
              <p className="text-green-100 text-sm mt-1">Total a pagar: ${calcularSubtotal().toLocaleString()}</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Efectivo */}
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    handleConfirm('EFECTIVO')
                  }}
                  className="group relative overflow-hidden p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-300 hover:border-green-500 rounded-xl transition-all shadow-md hover:shadow-xl"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-3xl">
                      💵
                    </div>
                    <span className="text-xl font-bold text-green-800">Efectivo</span>
                  </div>
                </button>

                {/* Débito */}
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    handleConfirm('DEBITO')
                  }}
                  className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 hover:border-blue-500 rounded-xl transition-all shadow-md hover:shadow-xl"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl">
                      💳
                    </div>
                    <span className="text-xl font-bold text-blue-800">Débito</span>
                  </div>
                </button>

                {/* Transferencia */}
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    handleConfirm('TRANSFERENCIA')
                  }}
                  className="group relative overflow-hidden p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 border-2 border-yellow-300 hover:border-yellow-500 rounded-xl transition-all shadow-md hover:shadow-xl"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-3xl">
                      🏦
                    </div>
                    <span className="text-xl font-bold text-yellow-800">Transferencia</span>
                  </div>
                </button>

                {/* Fiado */}
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setShowFiadoModal(true)
                  }}
                  className="group relative overflow-hidden p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-300 hover:border-orange-500 rounded-xl transition-all shadow-md hover:shadow-xl"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-3xl">
                      📝
                    </div>
                    <span className="text-xl font-bold text-orange-800">Fiado</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fiado */}
      {showFiadoModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-t-lg">
              <h3 className="text-xl font-bold">Registrar Venta Fiada</h3>
              <p className="text-orange-100 text-sm mt-1">Complete los datos del cliente</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Ingrese nombre del cliente"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Vencimiento (opcional)
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg"
                />
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800 font-semibold">Total a Fiar:</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ${calcularSubtotal().toLocaleString()}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> El nombre del cliente se registrará para referencia.
                  Cuando se implemente el módulo de clientes, podrá asociarse correctamente.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3">
              <button
                onClick={() => {
                  setShowFiadoModal(false)
                  setClienteNombre('')
                  setFechaVencimiento('')
                }}
                className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!clienteNombre.trim()) {
                    showNotification('error', 'Debe ingresar el nombre del cliente')
                    return
                  }

                  // Convertir fecha a formato dd/MM/yyyy si existe
                  let fechaFormateada = null
                  if (fechaVencimiento) {
                    const [year, month, day] = fechaVencimiento.split('-')
                    fechaFormateada = `${day}/${month}/${year}`
                  }

                  setShowFiadoModal(false)
                  // Por ahora usamos clienteId null ya que no tenemos módulo de clientes
                  // El backend guardará el nombre en la descripción o se puede crear el cliente
                  await handleConfirm('FIADO', true, null, fechaFormateada)
                  setClienteNombre('')
                  setFechaVencimiento('')
                }}
                disabled={!clienteNombre.trim()}
                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Confirmar Fiado
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
