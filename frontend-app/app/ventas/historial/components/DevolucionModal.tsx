"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { procesarDevolucionCompleta, procesarDevolucionParcial, ItemDevolucion } from "@/lib/devoluciones"

interface DetalleVenta {
    id: number
    idDetalleVenta?: number
    productoId: number
    productoNombre: string
    productoUnidad?: string
    codigoLote?: string
    cantidad: number
    precioUnitario: number
    subtotal: number
}

interface Venta {
    idVenta: number
    fecha: string
    total: number
    metodoPago: string
    detalles?: DetalleVenta[]
}

interface DevolucionModalProps {
    isOpen: boolean
    onClose: () => void
    venta: Venta
    onSuccess: () => void
}

interface ProductoSeleccionado {
    detalleVentaId: number
    cantidad: number
    maxCantidad: number
}

export default function DevolucionModal({ isOpen, onClose, venta, onSuccess }: DevolucionModalProps) {
    const [tipoDevolucion, setTipoDevolucion] = useState<'COMPLETA' | 'PARCIAL'>('COMPLETA')
    const [motivo, setMotivo] = useState('')
    const [productosSeleccionados, setProductosSeleccionados] = useState<Map<number, ProductoSeleccionado>>(new Map())
    const [loading, setLoading] = useState(false)

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTipoDevolucion('COMPLETA')
            setMotivo('')
            setProductosSeleccionados(new Map())
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleProductoToggle = (detalle: DetalleVenta) => {
        const newMap = new Map(productosSeleccionados)
        const uniqueKey = detalle.idDetalleVenta || detalle.id

        if (newMap.has(uniqueKey)) {
            newMap.delete(uniqueKey)
        } else {
            newMap.set(uniqueKey, {
                detalleVentaId: detalle.idDetalleVenta || detalle.id,
                cantidad: detalle.cantidad,
                maxCantidad: detalle.cantidad
            })
        }

        setProductosSeleccionados(newMap)
    }

    const handleCantidadChange = (uniqueKey: number, newCantidad: number) => {
        const newMap = new Map(productosSeleccionados)
        const producto = newMap.get(uniqueKey)

        if (producto) {
            producto.cantidad = Math.min(Math.max(1, newCantidad), producto.maxCantidad)
            newMap.set(uniqueKey, producto)
            setProductosSeleccionados(newMap)
        }
    }

    const calcularMontoDevolucion = () => {
        if (tipoDevolucion === 'COMPLETA') {
            return venta.total
        }

        let total = 0
        venta.detalles?.forEach(detalle => {
            const uniqueKey = detalle.idDetalleVenta || detalle.id
            const seleccionado = productosSeleccionados.get(uniqueKey)
            if (seleccionado) {
                total += detalle.precioUnitario * seleccionado.cantidad
            }
        })
        return total
    }

    const handleSubmit = async () => {
        if (!motivo.trim()) {
            toast.error('Por favor ingresa el motivo de la devolución')
            return
        }

        if (tipoDevolucion === 'PARCIAL' && productosSeleccionados.size === 0) {
            toast.error('Selecciona al menos un producto para devolver')
            return
        }

        try {
            setLoading(true)

            if (tipoDevolucion === 'COMPLETA') {
                await procesarDevolucionCompleta(venta.idVenta, motivo)
                toast.success('Devolución completa procesada exitosamente')
            } else {
                const items: ItemDevolucion[] = Array.from(productosSeleccionados.values()).map(p => ({
                    detalleVentaId: p.detalleVentaId,
                    cantidad: p.cantidad
                }))

                await procesarDevolucionParcial(venta.idVenta, items, motivo)
                toast.success('Devolución parcial procesada exitosamente')
            }

            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Error procesando devolución:', error)
            toast.error(error.message || 'Error al procesar la devolución')
        } finally {
            setLoading(false)
        }
    }

    const montoDevolucion = calcularMontoDevolucion()

    return (
        <div
            className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-orange-600 text-white p-6 border-b border-orange-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold">Procesar Devolución</h3>
                            <p className="text-orange-100 mt-1">Venta #{venta.idVenta}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Tipo de devolución */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#2E2A26] mb-3">
                            Tipo de Devolución
                        </label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setTipoDevolucion('COMPLETA')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${tipoDevolucion === 'COMPLETA'
                                    ? 'border-orange-600 bg-orange-50 text-orange-900'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <div className="font-bold">Devolución Completa</div>
                                <div className="text-sm text-gray-600 mt-1">Devolver todos los productos</div>
                            </button>
                            <button
                                onClick={() => setTipoDevolucion('PARCIAL')}
                                className={`flex-1 p-4 rounded-lg border-2 transition-all ${tipoDevolucion === 'PARCIAL'
                                    ? 'border-orange-600 bg-orange-50 text-orange-900'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <div className="font-bold">Devolución Parcial</div>
                                <div className="text-sm text-gray-600 mt-1">Seleccionar productos</div>
                            </button>
                        </div>
                    </div>

                    {/* Productos (solo si es parcial) */}
                    {tipoDevolucion === 'PARCIAL' && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-[#2E2A26] mb-3">
                                Productos a Devolver
                            </label>
                            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                {venta.detalles?.map(detalle => {
                                    const uniqueKey = detalle.idDetalleVenta || detalle.id
                                    const seleccionado = productosSeleccionados.get(uniqueKey)
                                    const isChecked = !!seleccionado

                                    return (
                                        <div
                                            key={uniqueKey}
                                            className={`p-3 rounded-lg border transition-all ${isChecked ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleProductoToggle(detalle)}
                                                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-semibold text-[#2E2A26]">
                                                        {detalle.codigoLote && (
                                                            <span className="text-xs text-orange-600 mr-2">[{detalle.codigoLote}]</span>
                                                        )}
                                                        {detalle.productoNombre}
                                                        {detalle.productoUnidad && (
                                                            <span className="text-sm text-gray-500 ml-2">({detalle.productoUnidad})</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Precio: ${detalle.precioUnitario.toLocaleString()} × {detalle.cantidad} = ${detalle.subtotal.toLocaleString()}
                                                    </div>
                                                </div>
                                                {isChecked && (
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-sm font-medium">Cant:</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={detalle.cantidad}
                                                            value={seleccionado.cantidad}
                                                            onChange={(e) => handleCantidadChange(uniqueKey, parseInt(e.target.value) || 1)}
                                                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                        />
                                                        <span className="text-sm text-gray-500">/ {detalle.cantidad}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Motivo */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-[#2E2A26] mb-2">
                            Motivo de la Devolución *
                        </label>
                        <textarea
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Producto defectuoso, cliente insatisfecho, error en la venta..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Resumen */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-700">Tipo:</span>
                            <span className="font-bold text-orange-900">
                                {tipoDevolucion === 'COMPLETA' ? 'Devolución Completa' : 'Devolución Parcial'}
                            </span>
                        </div>
                        {tipoDevolucion === 'PARCIAL' && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-700">Productos seleccionados:</span>
                                <span className="font-bold text-orange-900">{productosSeleccionados.size}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-lg pt-2 border-t border-orange-300">
                            <span className="font-bold text-gray-900">Monto a devolver:</span>
                            <span className="font-bold text-orange-600 text-2xl">
                                ${montoDevolucion.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        )}
                        Confirmar Devolución
                    </button>
                </div>
            </div>
        </div>
    )
}
