"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, TrendingUp, TrendingDown, Package, AlertTriangle, ArrowUpDown, DollarSign, Info } from "lucide-react"
import { PeriodSelector, Periodo } from "../components/PeriodSelector"
import { SalesChart } from "../components/SalesChart"
import { obtenerRankingProductos, ProductoVendido } from "@/lib/finanzas"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ProductosPerformancePage() {
    const router = useRouter()

    // State
    const [periodo, setPeriodo] = useState<Periodo>('anio')
    const [fecha, setFecha] = useState<Date>(new Date())
    const [loading, setLoading] = useState(true)
    const [productos, setProductos] = useState<ProductoVendido[]>([])

    // Sort & Search State
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState<{ key: keyof ProductoVendido | 'stock', direction: 'asc' | 'desc' }>({
        key: 'ingresos',
        direction: 'desc'
    })

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.push('/login')
            return
        }
        cargarDatos()
    }, [periodo, fecha, router])

    async function cargarDatos() {
        try {
            setLoading(true)
            // Usamos 'menos' con un límite alto para obtener TODOS los productos (incluidos los de 0 ventas)
            // La lógica del backend ya fue actualizada para retornar stock y todos los activos
            const data = await obtenerRankingProductos(periodo, 'menos', 1000, fecha)
            setProductos(data)
        } catch (error) {
            console.error("Error cargando productos:", error)
        } finally {
            setLoading(false)
        }
    }

    // Computed Data
    const processedData = useMemo(() => {
        let filtered = [...productos]

        // 1. Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            filtered = filtered.filter(p => p.nombre.toLowerCase().includes(lower))
        }

        // 2. Sort
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key as keyof ProductoVendido] || 0
            const bValue = b[sortConfig.key as keyof ProductoVendido] || 0

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [productos, searchTerm, sortConfig])

    // Stats for Top Cards
    const stats = useMemo(() => {
        if (!productos.length) return null

        const topSeller = [...productos].sort((a, b) => b.cantidad - a.cantidad)[0]
        // Producto con Stock pero 0 ventas
        const deadStock = [...productos]
            .filter(p => p.cantidad === 0 && (p.stock || 0) > 0)
            .sort((a, b) => (b.stock || 0) - (a.stock || 0))[0]

        return { topSeller, deadStock }
    }, [productos])

    // Chart Data (Top 5 by Revenue)
    const chartData = useMemo(() => {
        return [...productos]
            .sort((a, b) => b.ingresos - a.ingresos)
            .slice(0, 5)
            .map(p => ({
                name: p.nombre,
                value: p.ingresos
            }))
    }, [productos])

    const handleSort = (key: keyof ProductoVendido | 'stock') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }))
    }

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <ArrowUpDown className="w-4 h-4 text-[#D4C5B5]" />
        return sortConfig.direction === 'asc'
            ? <TrendingUp className="w-4 h-4 text-[#8B4513]" />
            : <TrendingDown className="w-4 h-4 text-[#8B4513]" />
    }

    return (
        <main className="min-h-screen bg-[#F9F6F3] pb-20">
            <div className="max-w-7xl mx-auto p-6 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-[#EBDCCB] rounded-full text-[#8B4513] transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 delay-400 duration-500 ease-in-out hover:-translate-x-1" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-[#2E2A26]">Desempeño de Productos</h1>
                            <p className="text-[#7A6F66]">
                                Análisis detallado de ventas, ingresos e inventario
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <PeriodSelector
                            periodo={periodo}
                            onPeriodoChange={setPeriodo}
                            fecha={fecha}
                            onFechaChange={setFecha}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-[#A0522D] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[#7A6F66]">Cargando datos...</p>
                    </div>
                ) : (
                    <>
                        {/* Top Section: Graphic & Highlights */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Left: Chart */}
                            <div className="lg:col-span-2 h-[400px]">
                                <SalesChart data={chartData} title="Top 5 Productos por Ingresos" />
                            </div>

                            {/* Right: Highlights */}
                            <div className="flex flex-col gap-6 lg:h-[400px]">
                                {/* Top Seller Card */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F5EDE4] flex-1 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-[#2E2A26] flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-green-600" />
                                            Más Vendido - Unidades
                                        </h3>
                                    </div>
                                    {stats?.topSeller ? (
                                        <div className="text-center">
                                            <div className="font-bold text-lg text-[#2E2A26]">{stats.topSeller.nombre}</div>
                                            <div className="text-sm text-[#7A6F66] mb-3">
                                                {stats.topSeller.unidad ? `(${stats.topSeller.unidad})` : ''}
                                            </div>
                                            <div className="inline-block bg-green-50 text-green-700 font-bold px-4 py-2 rounded-full border border-green-100">
                                                {stats.topSeller.cantidad} ventas
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-[#9C9288] py-8">Sin datos</div>
                                    )}
                                </div>

                                {/* Dead Stock Card */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-[#F5EDE4] flex-1 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-[#2E2A26] flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                                            Mayor Estancamiento
                                        </h3>
                                    </div>
                                    {stats?.deadStock ? (
                                        <div className="text-center">
                                            <div className="font-bold text-lg text-[#2E2A26]">{stats.deadStock.nombre}</div>
                                            <div className="text-sm text-[#7A6F66] mb-3">
                                                <span className="font-bold text-orange-600">{stats.deadStock.stock} en stock</span>
                                                <br />pero 0 ventas
                                            </div>
                                            <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full inline-block">
                                                ¡Atención requerida!
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-[#9C9288] py-8">
                                            {productos.length > 0 ? "¡Todo se está vendiendo! 🎉" : "Sin inventario"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Unified Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] overflow-hidden">
                            <div className="p-6 border-b border-[#F5EDE4] flex flex-col sm:flex-row justify-between items-center gap-4">
                                <h2 className="text-xl font-bold text-[#2E2A26] flex items-center gap-2">
                                    <Package className="w-5 h-5 text-[#8B4513]" />
                                    Detalle de Inventario y Ventas
                                </h2>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9C9288]" />
                                    <input
                                        type="text"
                                        placeholder="Buscar producto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-[#E5DACE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 bg-[#F9F6F3]"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#FBF7F4] text-[#7A6F66] text-sm font-medium">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Producto</th>
                                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-[#F5EDE4] transition-colors" onClick={() => handleSort('stock')}>
                                                <div className="flex items-center justify-center gap-2">
                                                    Stock Actual
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="w-3.5 h-3.5 text-[#9C9288] hover:text-[#7A6F66] cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Cantidad física disponible actualmente en inventario</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <SortIcon column="stock" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-center cursor-pointer hover:bg-[#F5EDE4] transition-colors" onClick={() => handleSort('cantidad')}>
                                                <div className="flex items-center justify-center gap-2">
                                                    Unidades Vendidas
                                                    <SortIcon column="cantidad" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-right cursor-pointer hover:bg-[#F5EDE4] transition-colors" onClick={() => handleSort('ingresos')}>
                                                <div className="flex items-center justify-end gap-2">
                                                    Ingresos
                                                    <SortIcon column="ingresos" />
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    Beneficio (Est.)
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="w-3.5 h-3.5 text-[#9C9288] hover:text-[#7A6F66] cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <p>Cálculo: (Precio Venta - Costo Adquisición) × Unidades. Si no hay costo registrado, se asume $0.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F5EDE4]">
                                        {processedData.map((item, index) => (
                                            <tr key={index} className="hover:bg-[#fcfaf8] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[#F5EDE4] flex items-center justify-center text-lg">
                                                            {item.imagen || '📦'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-[#2E2A26]">{item.nombre}</div>
                                                            {item.unidad && <div className="text-xs text-[#9C9288]">{item.unidad}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.stock !== undefined ? (
                                                        <div className={`font-medium ${item.stock === 0 ? 'text-red-500 bg-red-50 px-2 py-1 rounded-full inline-block text-xs' : 'text-[#5D2E0C]'}`}>
                                                            {item.stock === 0 ? 'Sin Stock' : item.stock}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`font-bold ${item.cantidad > 0 ? 'text-[#2E2A26]' : 'text-gray-400'}`}>
                                                        {item.cantidad}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className={`font-bold ${item.ingresos > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                                        ${item.ingresos.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="font-medium text-[#2E2A26]">
                                                        ${((item.ingresos || 0) - (item.costo || 0)).toLocaleString()}
                                                    </div>
                                                    {item.costo ? <div className="text-xs text-gray-400">Costo: ${item.costo.toLocaleString()}</div> : null}
                                                </td>
                                            </tr>
                                        ))}
                                        {processedData.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-[#9C9288]">
                                                    No se encontraron productos
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div >
                        </div >
                    </>
                )
                }
            </div >
        </main >
    )
}
