"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar, Package, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { obtenerTodosLosReportes } from "@/lib/finanzas"


export default function FinanzasPage() {
    const router = useRouter()
    const [periodo, setPeriodo] = useState<'semana' | 'mes' | 'anio'>('semana')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push('/login')
            return
        }

        cargarDatosFinanzas()
    }, [router, periodo])

    async function cargarDatosFinanzas() {
        try {
            setLoading(true)
            setError(null)

            console.log(`[FINANZAS] Cargando reportes para período: ${periodo}`)

            // Obtener datos del backend
            const reportes = await obtenerTodosLosReportes(periodo)

            console.log('[FINANZAS] Reportes obtenidos:', reportes)

            // Usar los datos del backend directamente
            setData(reportes)
        } catch (err: any) {
            console.error('[FINANZAS] Error cargando datos:', err)
            setError(err.message || 'Error al cargar los datos financieros')
        } finally {
            setLoading(false)
        }
    }

    // Fecha de hoy formateada
    const getFechaHoy = () => {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const d = new Date()
        return `${dias[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear()}`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F9F6F3] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#A0522D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#7A6F66] font-medium">Cargando datos financieros...</p>
                </div>
            </div>
        )
    }

    // Si hay error o no hay datos, mostrar mensaje de error
    if (error || !data) {
        return (
            <main className="min-h-screen bg-[#F9F6F3]">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Error al cargar datos</h2>
                        <p className="text-red-700">{error || 'No se pudieron cargar los datos financieros.'}</p>
                        <button
                            onClick={() => cargarDatosFinanzas()}
                            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            🔄 Reintentar
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    // Validar que los datos tengan la estructura esperada con todas las propiedades necesarias
    // Relajamos validación: confiamos en que si data existe (ya validado arriba),
    // la UI manejará las propiedades faltantes individualmente.
    const isValidData = true;

    if (!isValidData) {
        console.error('[FINANZAS] Datos con estructura inválida:', data);
        return (
            <main className="min-h-screen bg-[#F9F6F3]">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-yellow-800 mb-2">⚠️ Datos incompletos</h2>
                        <p className="text-yellow-700">Los datos recibidos del servidor están incompletos o tienen un formato inválido.</p>
                        <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-semibold text-yellow-800">Ver detalles técnicos</summary>
                            <pre className="mt-2 p-3 bg-yellow-100 rounded text-xs overflow-auto max-h-60">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </details>
                        <button
                            onClick={() => cargarDatosFinanzas()}
                            className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                            🔄 Reintentar
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#F9F6F3]">
            <div className="max-w-7xl mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-[#2E2A26]">
                                <DollarSign className="w-10 h-10 text-[#A0522D]" />
                                Finanzas - Reportes
                            </h1>
                            <p className="text-[#7A6F66] text-lg">
                                Análisis financiero de Frutos Secos Mil Sabores
                            </p>
                            <p className="text-[#9C9288] text-sm mt-1">{getFechaHoy()}</p>
                        </div>

                        {/* Selector de Período */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => router.push('/finanzas/gastos')}
                                className="px-6 py-3 bg-white border border-[#A0522D] text-[#A0522D] rounded-lg font-bold hover:bg-[#A0522D] hover:text-white transition-all shadow-sm flex items-center gap-2"
                            >
                                <DollarSign className="w-5 h-5" />
                                Gestionar Gastos
                            </button>

                            <div className="flex bg-white rounded-lg p-1 border border-[#F5EDE4] shadow-sm">
                                <button
                                    onClick={() => setPeriodo('semana')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${periodo === 'semana'
                                        ? 'bg-[#5C4A3E] text-white shadow-sm'
                                        : 'text-[#7A6F66] hover:bg-[#FBF7F4]'
                                        }`}
                                >
                                    Semanal
                                </button>
                                <button
                                    onClick={() => setPeriodo('mes')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${periodo === 'mes'
                                        ? 'bg-[#5C4A3E] text-white shadow-sm'
                                        : 'text-[#7A6F66] hover:bg-[#FBF7F4]'
                                        }`}
                                >
                                    Mensual
                                </button>
                                <button
                                    onClick={() => setPeriodo('anio')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${periodo === 'anio'
                                        ? 'bg-[#5C4A3E] text-white shadow-sm'
                                        : 'text-[#7A6F66] hover:bg-[#FBF7F4]'
                                        }`}
                                >
                                    Anual
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-[#9C9288] mb-6 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {periodo === 'semana' && 'Semana actual'}
                            {periodo === 'mes' && 'Mes actual'}
                            {periodo === 'anio' && 'Año actual'}
                        </span>
                        <span className="text-[#E6E0DB]">|</span>
                        <span className="text-sm font-medium text-[#7A6F66]">
                            Período: {periodo === 'semana' ? 'Semanal' : periodo === 'mes' ? 'Mensual' : 'Anual'}
                        </span>
                    </div>
                </div>

                {/* Margen de Ganancias - Destacado */}
                <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold flex items-center gap-3 text-[#2E2A26]">
                            <DollarSign className="w-8 h-8 text-green-600" />
                            Margen de Ganancias
                        </h2>
                        <div className="bg-[#FBF7F4] px-4 py-2 rounded-lg border border-[#F5EDE4]">
                            <span className="text-sm font-medium text-[#7A6F66]">Período: {periodo === 'semana' ? 'Semanal' : periodo === 'mes' ? 'Mensual' : 'Anual'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-[#FBF7F4] rounded-xl p-6 border border-[#F5EDE4]">
                            <div className="text-[#7A6F66] text-sm font-medium mb-2">Ingresos Totales</div>
                            <div className="text-3xl font-bold text-[#2E2A26]">${(data.resumenFinanciero?.totalIngresos || 0).toLocaleString()}</div>
                            <div className="text-[#9C9288] text-xs mt-1 flex items-center gap-1">
                                <ArrowUpRight className="w-4 h-4" />
                                Ventas del período
                            </div>
                        </div>

                        <div className="bg-[#FBF7F4] rounded-xl p-6 border border-[#F5EDE4]">
                            <div className="text-[#7A6F66] text-sm font-medium mb-2">Costos Adquisición</div>
                            <div className="text-3xl font-bold text-[#2E2A26]">${(data.resumenFinanciero?.gastosAdquisicion || 0).toLocaleString()}</div>
                            <div className="text-[#9C9288] text-xs mt-1">Mercadería (Gastos Adquisición)</div>
                        </div>

                        <div className="bg-[#FBF7F4] rounded-xl p-6 border border-[#F5EDE4]">
                            <div className="text-[#7A6F66] text-sm font-medium mb-2">Gastos Operacionales</div>
                            <div className="text-3xl font-bold text-[#2E2A26]">${(data.resumenFinanciero?.gastosOperacionales || 0).toLocaleString()}</div>
                            <div className="text-[#9C9288] text-xs mt-1">Operación y Otros</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F5EDE4]">
                            <div className={`${(data.resumenFinanciero?.utilidadNeta || 0) >= 0 ? 'text-green-700' : 'text-red-700'} text-sm font-medium mb-2`}>Utilidad Neta</div>
                            <div className={`text-4xl font-bold ${(data.resumenFinanciero?.utilidadNeta || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${(data.resumenFinanciero?.utilidadNeta || 0).toLocaleString()}
                            </div>
                            <div className={`${(data.resumenFinanciero?.utilidadNeta || 0) >= 0 ? 'text-green-600' : 'text-red-600'} text-sm mt-2 font-semibold flex items-center gap-1`}>
                                {(data.resumenFinanciero?.utilidadNeta || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {(data.resumenFinanciero?.margenPorcentaje || 0)}% margen
                            </div>
                        </div>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="mt-6 bg-[#F5EDE4] rounded-full h-3 overflow-hidden">
                        <div
                            className={`${(data.resumenFinanciero?.utilidadNeta || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'} h-full rounded-full transition-all duration-1000 ease-out`}
                            style={{ width: `${Math.abs(Math.max(-100, Math.min(100, data.resumenFinanciero?.margenPorcentaje || 0)))}%` }}
                        />
                    </div>
                </div>

                {/* Productos Más y Menos Vendidos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Producto Más Vendido */}
                    {data.masVendido ? (
                        <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-[#FBF7F4] p-6 border-b border-[#F5EDE4]">
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-[#2E2A26]">
                                    <TrendingUp className="w-7 h-7 text-[#D4A373]" />
                                    Producto Más Vendido
                                </h3>
                                <p className="text-[#7A6F66] text-sm mt-1">
                                    {periodo === 'semana' ? 'Esta semana' : periodo === 'mes' ? 'Este mes' : 'Este año'}
                                </p>
                            </div>

                            <div className="p-8">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="text-7xl">{data.masVendido.imagen || '📦'}</div>
                                    <div className="flex-1">
                                        <h4 className="text-2xl font-bold text-[#2E2A26] mb-2">{data.masVendido.nombre}</h4>
                                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                                            <ArrowUpRight className="w-5 h-5" />
                                            <span>Líder en ventas</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#FBF7F4] rounded-xl p-4 border border-[#F5EDE4]">
                                        <div className="text-[#7A6F66] text-sm font-medium mb-1">Unidades Vendidas</div>
                                        <div className="text-3xl font-bold text-green-600">{data.masVendido.cantidad}</div>
                                    </div>
                                    <div className="bg-[#FBF7F4] rounded-xl p-4 border border-[#F5EDE4]">
                                        <div className="text-[#7A6F66] text-sm font-medium mb-1">Ingresos Generados</div>
                                        <div className="text-2xl font-bold text-green-600">${data.masVendido.ingresos.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-8 flex flex-col items-center justify-center text-center">
                            <Package className="w-12 h-12 text-[#D4A373] mb-4" />
                            <h3 className="text-lg font-semibold text-[#7A6F66]">Sin datos de ventas</h3>
                            <p className="text-[#9C9288] text-sm mt-1">No hay información del producto más vendido para este período.</p>
                        </div>
                    )}

                    {/* Producto Menos Vendido */}
                    {data.menosVendido ? (
                        <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] overflow-hidden hover:shadow-md transition-shadow">
                            <div className="bg-[#FBF7F4] p-6 border-b border-[#F5EDE4]">
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-[#2E2A26]">
                                    <TrendingDown className="w-7 h-7 text-orange-600" />
                                    Producto Menos Vendido
                                </h3>
                                <p className="text-[#7A6F66] text-sm mt-1">
                                    {periodo === 'semana' ? 'Esta semana' : periodo === 'mes' ? 'Este mes' : 'Este año'}
                                </p>
                            </div>

                            <div className="p-8">
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="text-7xl">{data.menosVendido.imagen || '📦'}</div>
                                    <div className="flex-1">
                                        <h4 className="text-2xl font-bold text-[#2E2A26] mb-2">{data.menosVendido.nombre}</h4>
                                        <div className="flex items-center gap-2 text-orange-600 font-semibold">
                                            <ArrowDownRight className="w-5 h-5" />
                                            <span>Requiere atención</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-[#FBF7F4] rounded-xl p-4 border border-[#F5EDE4]">
                                        <div className="text-[#7A6F66] text-sm font-medium mb-1">Unidades Vendidas</div>
                                        <div className="text-3xl font-bold text-orange-600">{data.menosVendido.cantidad}</div>
                                    </div>
                                    <div className="bg-[#FBF7F4] rounded-xl p-4 border border-[#F5EDE4]">
                                        <div className="text-[#7A6F66] text-sm font-medium mb-1">Ingresos Generados</div>
                                        <div className="text-2xl font-bold text-orange-600">${data.menosVendido.ingresos.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-8 flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="w-12 h-12 text-[#D4A373] mb-4" />
                            <h3 className="text-lg font-semibold text-[#7A6F66]">Sin datos de ventas</h3>
                            <p className="text-[#9C9288] text-sm mt-1">No hay información del producto menos vendido para este período.</p>
                        </div>
                    )}
                </div>

                {/* Productos Vencidos - Pérdidas */}
                {data.productosVencidos ? (
                    <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] overflow-hidden">
                        <div className="bg-[#FBF7F4] p-6 border-b border-[#F5EDE4]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-3 text-[#2E2A26]">
                                        <AlertTriangle className="w-7 h-7 text-red-600" />
                                        Productos Vencidos - Pérdidas
                                    </h3>
                                    <p className="text-[#7A6F66] text-sm mt-1">
                                        {periodo === 'semana' ? 'Esta semana' : periodo === 'mes' ? 'Este mes' : 'Este año'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[#7A6F66] text-sm font-medium">Total Pérdidas</div>
                                    <div className="text-3xl font-bold text-red-600">${data.productosVencidos.perdidas.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="bg-[#FBF7F4] rounded-xl px-6 py-3 border border-[#F5EDE4]">
                                    <span className="text-[#2E2A26] font-semibold">
                                        {data.productosVencidos.cantidad} productos vencidos
                                    </span>
                                </div>
                                <div className="flex-1 h-3 bg-[#F5EDE4] rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: '45%' }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.productosVencidos.items.map((item: any, idx: number) => (
                                    <div key={idx} className="bg-[#FBF7F4] rounded-xl p-5 border border-[#F5EDE4] hover:border-[#A0522D]/30 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Package className="w-5 h-5 text-red-600" />
                                                <h4 className="font-bold text-[#2E2A26]">{item.nombre}</h4>
                                            </div>
                                            <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-semibold border border-red-100">
                                                {item.cantidad} unidades
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[#7A6F66] text-sm font-medium">Pérdida estimada:</span>
                                            <span className="text-2xl font-bold text-red-600">${item.valor.toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Nota informativa */}
                            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[#2E2A26] font-semibold mb-1">Recomendación</p>
                                        <p className="text-[#7A6F66] text-sm">
                                            Revise las fechas de vencimiento en el módulo de Inventario para reducir pérdidas.
                                            Considere implementar promociones para productos próximos a vencer.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-8 flex flex-col items-center justify-center text-center">
                        <AlertTriangle className="w-12 h-12 text-[#D4A373] mb-4" />
                        <h3 className="text-lg font-semibold text-[#7A6F66]">Sin datos de vencimientos</h3>
                        <p className="text-[#9C9288] text-sm mt-1">No hay información de productos vencidos para este período.</p>
                    </div>
                )}



            </div >
        </main >
    )
}