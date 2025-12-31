"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, TrendingUp, TrendingDown, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Download } from "lucide-react"
import { format, subDays, subWeeks, subMonths, subYears } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { obtenerTodosLosReportes, obtenerDetallePerdidas, ExpiredLotDTO, exportarReporteExcel } from "@/lib/finanzas"
import { StatCard } from "./components/StatCard"
import { PeriodSelector, Periodo } from "./components/PeriodSelector"
import { SalesChart } from "./components/SalesChart"

export default function FinanzasPage() {
    const router = useRouter()

    // State for period and date selection
    const [periodo, setPeriodo] = useState<Periodo>('anio')
    const [fecha, setFecha] = useState<Date>(new Date())

    // Data Loading State
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)
    const [prevData, setPrevData] = useState<any>(null)
    const [isExporting, setIsExporting] = useState(false)

    // Losses Detail State
    const [showLossesModal, setShowLossesModal] = useState(false)
    const [lossesDetails, setLossesDetails] = useState<ExpiredLotDTO[]>([])
    const [loadingLosses, setLoadingLosses] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push('/login')
            return
        }

        cargarDatosFinanzas()
    }, [router, periodo, fecha])

    function getPreviousDate(date: Date, period: Periodo): Date {
        const d = new Date(date)
        if (period === 'dia') return subDays(d, 1)
        if (period === 'semana') return subWeeks(d, 1)
        if (period === 'mes') return subMonths(d, 1)
        if (period === 'anio') return subYears(d, 1)
        return d
    }

    async function cargarDatosFinanzas() {
        try {
            setLoading(true)
            setError(null)

            console.log(`[FINANZAS] Cargando reportes para período: ${periodo}, fecha: ${fecha}`)

            // Calculate previous date
            const prevDate = getPreviousDate(fecha, periodo)

            // Fetch current and previous data in parallel
            const [reportes, reportesPrevios] = await Promise.all([
                obtenerTodosLosReportes(periodo, fecha),
                obtenerTodosLosReportes(periodo, prevDate)
            ])

            console.log('[FINANZAS] Reportes obtenidos:', reportes)
            setData(reportes)
            setPrevData(reportesPrevios)
        } catch (err: any) {
            console.error('[FINANZAS] Error cargando datos:', err)
            setError(err.message || 'Error al cargar los datos financieros')
        } finally {
            setLoading(false)
        }
    }

    async function handleExport() {
        if (periodo !== 'mes' && periodo !== 'anio') return
        try {
            setIsExporting(true)
            await exportarReporteExcel(periodo, fecha)
            toast({ title: "Reporte exportado", description: "La descarga ha comenzado." })
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "No se pudo exportar el reporte.", variant: "destructive" })
        } finally {
            setIsExporting(false)
        }
    }

    async function handleOpenLossesDetail() {
        setShowLossesModal(true)
        try {
            setLoadingLosses(true)
            const details = await obtenerDetallePerdidas(periodo, fecha)
            setLossesDetails(details)
        } catch (err) {
            console.error("Error loading losses details:", err)
        } finally {
            setLoadingLosses(false)
        }
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

    // Prepare chart data (Mock or derived from actual data if available)
    const totalIngresosConIngresos = (data.resumenFinanciero?.totalIngresos || 0) + (data.resumenFinanciero?.ingresosAdicionales || 0)
    const chartData = [
        { name: 'Ingresos', value: totalIngresosConIngresos },
        { name: 'Gastos', value: (data.resumenFinanciero?.totalCostoProductos || 0) + (data.resumenFinanciero?.gastosOperacionales || 0) },
        { name: 'Utilidad', value: data.resumenFinanciero?.utilidadNeta || 0 },
    ]

    const totalGastos = (data.resumenFinanciero?.totalCostoProductos || 0) + (data.resumenFinanciero?.gastosAdquisicion || 0) + (data.resumenFinanciero?.gastosOperacionales || 0)
    const totalGastosPrev = (prevData?.resumenFinanciero?.totalCostoProductos || 0) + (prevData?.resumenFinanciero?.gastosAdquisicion || 0) + (prevData?.resumenFinanciero?.gastosOperacionales || 0)

    // Helper to calculate trend
    const calculateTrend = (current: number, previous: number) => {
        if (previous === undefined || previous === null) return undefined
        if (previous === 0) return { value: current > 0 ? "+100%" : "0%", positive: true }
        const diff = current - previous
        const percentage = (diff / previous) * 100
        return {
            value: `${diff >= 0 ? '+' : ''}${percentage.toFixed(1)}%`,
            positive: diff >= 0
        }
    }

    const incomeTrend = calculateTrend(data.resumenFinanciero?.totalIngresos || 0, prevData?.resumenFinanciero?.totalIngresos || 0)
    const expensesTrend = calculateTrend(totalGastos, totalGastosPrev)
    const profitTrend = calculateTrend(data.resumenFinanciero?.utilidadNeta || 0, prevData?.resumenFinanciero?.utilidadNeta || 0)
    const marginTrend = calculateTrend(data.resumenFinanciero?.margenPorcentaje || 0, prevData?.resumenFinanciero?.margenPorcentaje || 0)

    return (
        <main className="min-h-screen bg-[#F9F6F3] pb-20">
            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2E2A26] flex items-center gap-3">
                            Estadísticas y Reportes
                        </h1>
                        <p className="text-[#7A6F66] mt-1">
                            Resumen financiero detallado
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <PeriodSelector
                            periodo={periodo}
                            onPeriodoChange={setPeriodo}
                            fecha={fecha}
                            onFechaChange={setFecha}
                        />

                        <button
                            onClick={() => router.push('/finanzas/gastos')}
                            className="px-5 py-2.5 bg-[#A0522D] text-white rounded-lg font-bold hover:bg-[#8B4513] transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                        >
                            <DollarSign className="w-4 h-4" />
                            Gastos e Ingresos
                        </button>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Ingresos Totales"
                        value={`$${totalIngresosConIngresos.toLocaleString()}`}
                        icon={DollarSign}
                        variant="success"
                        trend={incomeTrend ? { value: incomeTrend.value, label: "vs periodo anterior", positive: incomeTrend.positive } : undefined}
                        tooltip="Dinero total: ventas en caja + ingresos adicionales registrados."
                    />
                    <StatCard
                        title="Gastos"
                        value={`$${totalGastos.toLocaleString()}`}
                        icon={TrendingDown}
                        variant="danger"
                        trend={expensesTrend ? { value: expensesTrend.value, label: "vs periodo anterior", positive: !expensesTrend.positive } : undefined}
                        tooltip="Suma del costo de adquisición de productos vendidos y gastos operacionales."
                    />
                    <StatCard
                        title="Ganancia Neta"
                        value={`$${(data.resumenFinanciero?.utilidadNeta || 0).toLocaleString()}`}
                        icon={TrendingUp}
                        variant="info"
                        trend={profitTrend ? { value: profitTrend.value, label: "vs periodo anterior", positive: profitTrend.positive } : undefined}
                        tooltip="Ingresos Totales menos Gastos Totales. Es tu utilidad real."
                    />
                    <StatCard
                        title="Margen de Ganancia"
                        value={`${data.resumenFinanciero?.margenPorcentaje || 0}%`}
                        icon={Package}
                        variant="warning"
                        trend={marginTrend ? { value: marginTrend.value, label: "vs periodo anterior", positive: marginTrend.positive } : undefined}
                        tooltip="Porcentaje de ganancia sobre la venta. (Ganancia / Ingresos) * 100."
                    />
                </div>

                {/* Charts & Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Chart Column (Span 2) */}
                    <div className="lg:col-span-2">
                        <SalesChart
                            data={chartData}
                            title="Resumen Financiero del Período"
                            action={
                                (periodo === 'mes' || periodo === 'anio') ? (
                                    <button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-bold hover:bg-green-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isExporting ? (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Exportar
                                    </button>
                                ) : undefined
                            }
                        />
                    </div>

                    {/* Best Seller Column */}
                    <div className="space-y-6">
                        {/* Producto Más Vendido */}
                        {data.masVendido ? (
                            <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-[#2E2A26] flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        Producto Estrella
                                    </h3>
                                    <button
                                        onClick={() => router.push('/finanzas/productos')}
                                        className="text-sm font-medium text-[#8B4513] hover:text-[#5D2E0C] flex items-center gap-1 hover:underline"
                                    >
                                        Ver detalle
                                        <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="bg-[#FBF7F4] rounded-lg p-4 border border-[#F5EDE4]">
                                    <div className="text-4xl mb-4 text-center">{data.masVendido.imagen || '📦'}</div>
                                    <h4 className="font-bold text-[#2E2A26] text-center text-lg">{data.masVendido.nombre}</h4>
                                    <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                                        <div>
                                            <div className="text-xs text-[#7A6F66] font-medium">Ventas</div>
                                            <div className="text-xl font-bold text-green-600">{data.masVendido.cantidad}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-[#7A6F66] font-medium">Ingresos</div>
                                            <div className="text-xl font-bold text-green-600">${data.masVendido.ingresos.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-6 text-center text-[#9C9288]">
                                Sin datos de ventas
                            </div>
                        )}

                        {/* Productos Vencidos Alert (Mini) */}
                        {data.productosVencidos && data.productosVencidos.cantidad > 0 && (
                            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <h3 className="font-bold text-red-800">Pérdidas por Vencimiento</h3>
                                    </div>
                                    <button onClick={handleOpenLossesDetail} className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline">
                                        Ver detalle
                                    </button>
                                </div>
                                <div className="text-2xl font-bold text-red-700 mb-1">
                                    ${data.productosVencidos.perdidas.toLocaleString()}
                                </div>
                                <p className="text-sm text-red-600">
                                    {data.productosVencidos.cantidad} productos vencidos en este período
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Losses Detail Modal */}
            <Dialog open={showLossesModal} onOpenChange={setShowLossesModal}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-800">
                            <AlertTriangle className="w-6 h-6" />
                            Detalle de Pérdidas por Vencimiento
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-auto mt-4 px-1">
                        {loadingLosses ? (
                            <div className="py-12 text-center text-gray-500">
                                <div className="w-8 h-8 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-2"></div>
                                Cargando detalle...
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Lote</TableHead>
                                        <TableHead>Fecha Vencimiento</TableHead>
                                        <TableHead className="text-right">Cantidad</TableHead>
                                        <TableHead className="text-right">Pérdida (Est.)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lossesDetails.length > 0 ? (
                                        lossesDetails.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.productoNombre}</TableCell>
                                                <TableCell className="font-mono text-xs">{item.codigoLote}</TableCell>
                                                <TableCell>{item.fechaVencimiento ? format(new Date(item.fechaVencimiento + 'T00:00:00'), 'dd/MM/yyyy') : '-'}</TableCell>
                                                <TableCell className="text-right">{item.cantidad}</TableCell>
                                                <TableCell className="text-right font-bold text-red-600">
                                                    ${item.perdidaTotal.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                No hay detalles disponibles.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </main>
    )
}
