"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { listarFiados, registrarPago, obtenerPagos } from '@/lib/ventas'
import { Calendar, DollarSign, User, AlertCircle, CheckCircle, Clock, ArrowLeft, Phone, Mail, CreditCard } from 'lucide-react'

interface Cliente {
    idCliente: number
    nombre: string
    telefono?: string
    email?: string
    rut?: string
}

interface Venta {
    idVenta: number
    fecha: string
    total: number
    saldoPendiente: number
    fechaVencimientoPago?: string
    clienteId?: number
    cliente?: Cliente  // Información completa del cliente (si viene del backend)
    // Campos alternativos si el backend los incluye directamente en VentaEntity
    clienteNombre?: string
    clienteTelefono?: string
    clienteEmail?: string
    clienteRut?: string
    usuarioId: number
    fiado: boolean
    pagoCompletadoAt?: string
}

interface Pago {
    idPago: number
    ventaId: number
    monto: number
    metodoPago: string
    fecha: string
    usuarioId: number
}

export default function FiadosPage() {
    const router = useRouter()
    const [fiados, setFiados] = useState<Venta[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
    const [showPagoModal, setShowPagoModal] = useState(false)
    const [montoPago, setMontoPago] = useState('')
    const [metodoPago, setMetodoPago] = useState('EFECTIVO')
    const [pagos, setPagos] = useState<Pago[]>([])
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)
    const [ordenamiento, setOrdenamiento] = useState<'vencimiento' | 'monto' | 'fecha'>('vencimiento')

    useEffect(() => {
        fetchFiados()
    }, [])

    function showNotification(type: 'success' | 'error' | 'warning', message: string) {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 4000)
    }

    async function fetchFiados() {
        try {
            setLoading(true)
            const res = await listarFiados(true) // Solo pendientes

            // Si las ventas tienen clienteId pero no cliente, cargarlos
            if (res && res.length > 0) {
                const { obtenerClienteFiado } = await import('@/lib/clientesFiado')

                const ventasConCliente = await Promise.all(
                    res.map(async (venta: any) => {
                        // Si tiene clienteId pero no tiene objeto cliente, cargarlo
                        if (venta.clienteId && !venta.cliente) {
                            try {
                                const cliente = await obtenerClienteFiado(venta.clienteId)
                                return { ...venta, cliente }
                            } catch (err) {
                                console.error(`Error al cargar cliente ${venta.clienteId}:`, err)
                                return venta
                            }
                        }
                        return venta
                    })
                )

                setFiados(ventasConCliente || [])
            } else {
                setFiados(res || [])
            }
        } catch (err: any) {
            showNotification('error', 'Error al cargar fiados: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleOpenPagoModal(venta: Venta) {
        setSelectedVenta(venta)
        setMontoPago(String(venta.saldoPendiente || 0))
        setShowPagoModal(true)

        // Cargar historial de pagos
        try {
            const pagosList = await obtenerPagos(venta.idVenta)
            setPagos(pagosList || [])
        } catch (err: any) {
            console.error('Error al cargar pagos:', err)
            setPagos([])
        }
    }

    async function handleRegistrarPago() {
        if (!selectedVenta) return

        const monto = Number(montoPago)
        if (isNaN(monto) || monto <= 0) {
            showNotification('error', 'Monto inválido')
            return
        }

        if (monto > (selectedVenta.saldoPendiente || 0)) {
            showNotification('error', 'El monto no puede ser mayor al saldo pendiente')
            return
        }

        try {
            const usuarioId = localStorage.getItem('user_id')
            if (!usuarioId) {
                showNotification('error', 'Usuario no autenticado')
                return
            }

            await registrarPago(selectedVenta.idVenta, {
                monto: Math.round(monto),
                metodoPago,
                usuarioId: Number(usuarioId)
            })

            showNotification('success', 'Pago registrado exitosamente')
            setShowPagoModal(false)
            setSelectedVenta(null)
            setMontoPago('')
            fetchFiados() // Recargar lista
        } catch (err: any) {
            showNotification('error', 'Error al registrar pago: ' + err.message)
        }
    }

    function getFiadosOrdenados() {
        const fiadosCopy = [...fiados]

        switch (ordenamiento) {
            case 'vencimiento':
                return fiadosCopy.sort((a, b) => {
                    if (!a.fechaVencimientoPago) return 1
                    if (!b.fechaVencimientoPago) return -1
                    return new Date(a.fechaVencimientoPago).getTime() - new Date(b.fechaVencimientoPago).getTime()
                })
            case 'monto':
                return fiadosCopy.sort((a, b) => (b.saldoPendiente || 0) - (a.saldoPendiente || 0))
            case 'fecha':
                return fiadosCopy.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            default:
                return fiadosCopy
        }
    }

    function isVencido(fechaVencimiento?: string): boolean {
        if (!fechaVencimiento) return false
        return new Date(fechaVencimiento) < new Date()
    }

    const totalDeuda = fiados.reduce((sum, f) => sum + (f.saldoPendiente || 0), 0)
    const fiadosVencidos = fiados.filter(f => isVencido(f.fechaVencimientoPago))

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
                    <span className="font-medium text-base">{notification.message}</span>
                </div>
            )}

            <div className="max-w-[95%] mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Gestión de Fiados</h1>
                                <p className="text-gray-600">Control de ventas a crédito y pagos pendientes</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/ventas/historial')}
                            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver al Historial
                        </button>
                    </div>

                    {/* Resumen */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-orange-700" />
                                <p className="text-sm font-semibold text-orange-700">Total Deuda</p>
                            </div>
                            <p className="text-2xl font-bold text-orange-900">${totalDeuda.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-5 h-5 text-blue-700" />
                                <p className="text-sm font-semibold text-blue-700">Deudores</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">{fiados.length}</p>
                        </div>
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-red-700" />
                                <p className="text-sm font-semibold text-red-700">Vencidos</p>
                            </div>
                            <p className="text-2xl font-bold text-red-900">{fiadosVencidos.length}</p>
                        </div>
                    </div>

                    {/* Ordenamiento */}
                    <div className="mt-4 flex items-center gap-3">
                        <label className="text-sm font-semibold text-gray-700">Ordenar por:</label>
                        <select
                            value={ordenamiento}
                            onChange={(e) => setOrdenamiento(e.target.value as any)}
                            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                        >
                            <option value="vencimiento">Fecha de Vencimiento</option>
                            <option value="monto">Monto Adeudado</option>
                            <option value="fecha">Fecha de Venta</option>
                        </select>
                    </div>
                </div>

                {/* Lista de Fiados */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Deudores</h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                                <p className="text-gray-600 mt-4">Cargando fiados...</p>
                            </div>
                        ) : fiados.length === 0 ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                                <p className="text-gray-600 text-lg">No hay fiados pendientes</p>
                                <p className="text-gray-400 text-sm mt-2">Todas las deudas han sido pagadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {getFiadosOrdenados().map((venta) => {
                                    const vencido = isVencido(venta.fechaVencimientoPago)
                                    const porcentajePagado = venta.total > 0
                                        ? ((venta.total - (venta.saldoPendiente || 0)) / venta.total) * 100
                                        : 0

                                    return (
                                        <div
                                            key={venta.idVenta}
                                            className={`border-2 rounded-lg p-5 transition-all ${vencido
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="text-lg font-bold text-gray-800">
                                                            Venta #{venta.idVenta}
                                                        </h3>
                                                        {vencido && (
                                                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                                                                VENCIDO
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Información del Cliente/Deudor */}
                                                    <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <User className="w-5 h-5 text-blue-700" />
                                                            <h4 className="text-sm font-bold text-blue-900">Información del Deudor</h4>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <User className="w-4 h-4 text-blue-600" />
                                                                <span className="text-gray-700">
                                                                    <strong>Nombre:</strong> {venta.cliente?.nombre || venta.clienteNombre || 'No Aplica'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Phone className="w-4 h-4 text-blue-600" />
                                                                <span className="text-gray-700">
                                                                    <strong>Teléfono:</strong> {venta.cliente?.telefono || venta.clienteTelefono || 'No Aplica'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="w-4 h-4 text-blue-600" />
                                                                <span className="text-gray-700">
                                                                    <strong>Email:</strong> {venta.cliente?.email || venta.clienteEmail || 'No Aplica'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                                                <span className="text-gray-700">
                                                                    <strong>RUT:</strong> {venta.cliente?.rut || venta.clienteRut || 'No Aplica'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Información de la Venta */}
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-600">
                                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                                Fecha de venta: {new Date(venta.fecha).toLocaleDateString('es-CL')}
                                                            </p>
                                                            {venta.fechaVencimientoPago && (
                                                                <p className={`${vencido ? 'text-red-700 font-semibold' : 'text-gray-600'}`}>
                                                                    <Clock className="w-4 h-4 inline mr-1" />
                                                                    Vencimiento: {new Date(venta.fechaVencimientoPago).toLocaleDateString('es-CL')}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600">Total original: ${venta.total.toLocaleString()}</p>
                                                            <p className="text-orange-700 font-bold text-lg">
                                                                Saldo pendiente: ${(venta.saldoPendiente || 0).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Barra de progreso */}
                                                    <div className="mt-3">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-500 h-2 rounded-full transition-all"
                                                                style={{ width: `${porcentajePagado}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {porcentajePagado.toFixed(0)}% pagado
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleOpenPagoModal(venta)}
                                                    className="ml-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                                                >
                                                    Registrar Pago
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Pago */}
            {showPagoModal && selectedVenta && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-t-lg">
                            <h3 className="text-xl font-bold">Registrar Pago - Venta #{selectedVenta.idVenta}</h3>
                            <p className="text-orange-100 text-sm mt-1">
                                Saldo pendiente: ${(selectedVenta.saldoPendiente || 0).toLocaleString()}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Historial de pagos */}
                            {pagos.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">Historial de Pagos</h4>
                                    <div className="max-h-32 overflow-y-auto space-y-2">
                                        {pagos.map((pago) => (
                                            <div key={pago.idPago} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                                <span className="text-gray-600">
                                                    {new Date(pago.fecha).toLocaleDateString('es-CL')} - {pago.metodoPago}
                                                </span>
                                                <span className="font-semibold text-green-600">${pago.monto.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Monto a Pagar *
                                </label>
                                <input
                                    type="number"
                                    value={montoPago}
                                    onChange={(e) => setMontoPago(e.target.value)}
                                    placeholder="Ingrese monto"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Método de Pago *
                                </label>
                                <select
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-lg"
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="DEBITO">Débito</option>
                                    <option value="CREDITO">Crédito</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                </select>
                            </div>

                            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                <p className="text-sm text-orange-800 font-semibold">Nuevo Saldo:</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">
                                    ${Math.max((selectedVenta.saldoPendiente || 0) - Number(montoPago || 0), 0).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPagoModal(false)
                                    setSelectedVenta(null)
                                    setMontoPago('')
                                    setPagos([])
                                }}
                                className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRegistrarPago}
                                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                            >
                                Confirmar Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
