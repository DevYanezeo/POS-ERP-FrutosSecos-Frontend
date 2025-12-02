"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Calendar, Package, ArrowUpRight, ArrowDownRight } from "lucide-react"

// Mock data - Reemplazar con datos reales del backend cuando esté disponible
const MOCK_DATA = {
    semana: {
        masVendido: {
            nombre: "Almendras Premium",
            cantidad: 145,
            ingresos: 725000,
            imagen: "🌰"
        },
        menosVendido: {
            nombre: "Nueces de Macadamia",
            cantidad: 12,
            ingresos: 48000,
            imagen: "🥜"
        },
        margenGanancias: {
            ingresos: 2450000,
            costos: 1200000,
            gastosOperacionales: 350000,
            ganancia: 900000,
            porcentaje: 36.7
        },
        productosVencidos: {
            cantidad: 3,
            perdidas: 85000,
            items: [
                { nombre: "Pasas Rubias", cantidad: 5, valor: 25000 },
                { nombre: "Maní Salado", cantidad: 8, valor: 32000 },
                { nombre: "Pistachos", cantidad: 4, valor: 28000 }
            ]
        }
    },
    mes: {
        masVendido: {
            nombre: "Maní Tostado",
            cantidad: 580,
            ingresos: 2320000,
            imagen: "🥜"
        },
        menosVendido: {
            nombre: "Avellanas Enteras",
            cantidad: 45,
            ingresos: 180000,
            imagen: "🌰"
        },
        margenGanancias: {
            ingresos: 9850000,
            costos: 4800000,
            gastosOperacionales: 1450000,
            ganancia: 3600000,
            porcentaje: 36.5
        },
        productosVencidos: {
            cantidad: 12,
            perdidas: 340000,
            items: [
                { nombre: "Almendras Tostadas", cantidad: 15, valor: 120000 },
                { nombre: "Nueces Peladas", cantidad: 10, valor: 85000 },
                { nombre: "Pasas Negras", cantidad: 8, valor: 48000 },
                { nombre: "Maní con Chocolate", cantidad: 12, valor: 87000 }
            ]
        }
    }
}

export default function FinanzasPage() {
    const router = useRouter()
    const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) router.push('/login')

        // Simular carga de datos
        setTimeout(() => setLoading(false), 800)
    }, [router])

    const data = MOCK_DATA[periodo]

    // Fecha de hoy formateada
    const getFechaHoy = () => {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const d = new Date()
        return `${dias[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear()}`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#A0522D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando datos financieros...</p>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-gray-800">
                                <DollarSign className="w-10 h-10 text-[#A0522D]" />
                                Finanzas - Reportes
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Análisis financiero de Frutos Secos Mil Sabores
                            </p>
                            <p className="text-gray-500 text-sm mt-1">{getFechaHoy()}</p>
                        </div>

                        {/* Selector de Período */}
                        <div className="bg-gray-100 rounded-xl p-2 flex gap-2 border border-gray-300">
                            <button
                                onClick={() => setPeriodo('semana')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${periodo === 'semana'
                                    ? 'bg-[#A0522D] text-white shadow-md border-2 border-[#8B4513]'
                                    : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Esta Semana
                            </button>
                            <button
                                onClick={() => setPeriodo('mes')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${periodo === 'mes'
                                    ? 'bg-[#A0522D] text-white shadow-md border-2 border-[#8B4513]'
                                    : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Este Mes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Margen de Ganancias - Destacado */}
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
                            <DollarSign className="w-8 h-8 text-green-600" />
                            Margen de Ganancias
                        </h2>
                        <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-300">
                            <span className="text-sm font-medium text-gray-700">Período: {periodo === 'semana' ? 'Semanal' : 'Mensual'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
                            <div className="text-gray-600 text-sm font-medium mb-2">Ingresos Totales</div>
                            <div className="text-3xl font-bold text-gray-800">${data.margenGanancias.ingresos.toLocaleString()}</div>
                            <div className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                <ArrowUpRight className="w-4 h-4" />
                                Ventas del período
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
                            <div className="text-gray-600 text-sm font-medium mb-2">Costos</div>
                            <div className="text-3xl font-bold text-gray-800">${data.margenGanancias.costos.toLocaleString()}</div>
                            <div className="text-gray-500 text-xs mt-1">Costo de productos</div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
                            <div className="text-gray-600 text-sm font-medium mb-2">Gastos Operacionales</div>
                            <div className="text-3xl font-bold text-gray-800">${data.margenGanancias.gastosOperacionales.toLocaleString()}</div>
                            <div className="text-gray-500 text-xs mt-1">Operación y servicios</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-300">
                            <div className="text-green-700 text-sm font-medium mb-2">Ganancia Neta</div>
                            <div className="text-4xl font-bold text-green-600">${data.margenGanancias.ganancia.toLocaleString()}</div>
                            <div className="text-green-600 text-sm mt-2 font-semibold flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {data.margenGanancias.porcentaje}% margen
                            </div>
                        </div>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="mt-6 bg-gray-200 rounded-full h-3 overflow-hidden border border-gray-300">
                        <div
                            className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${data.margenGanancias.porcentaje}%` }}
                        />
                    </div>
                </div>

                {/* Productos Más y Menos Vendidos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Producto Más Vendido */}
                    <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-gray-50 p-6 border-b-2 border-gray-300">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                <TrendingUp className="w-7 h-7 text-gray-300" />
                                Producto Más Vendido
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                {periodo === 'semana' ? 'Esta semana' : 'Este mes'}
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="text-7xl">{data.masVendido.imagen}</div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-gray-800 mb-2">{data.masVendido.nombre}</h4>
                                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                                        <ArrowUpRight className="w-5 h-5" />
                                        <span>Líder en ventas</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
                                    <div className="text-gray-600 text-sm font-medium mb-1">Unidades Vendidas</div>
                                    <div className="text-3xl font-bold text-green-600">{data.masVendido.cantidad}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
                                    <div className="text-gray-600 text-sm font-medium mb-1">Ingresos Generados</div>
                                    <div className="text-2xl font-bold text-green-600">${data.masVendido.ingresos.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Producto Menos Vendido */}
                    <div className="bg-white rounded-xl shadow-md border-2 border-gray-300 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="bg-gray-50 p-6 border-b-2 border-gray-300">
                            <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                <TrendingDown className="w-7 h-7 text-orange-600" />
                                Producto Menos Vendido
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                                {periodo === 'semana' ? 'Esta semana' : 'Este mes'}
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="text-7xl">{data.menosVendido.imagen}</div>
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-gray-800 mb-2">{data.menosVendido.nombre}</h4>
                                    <div className="flex items-center gap-2 text-orange-600 font-semibold">
                                        <ArrowDownRight className="w-5 h-5" />
                                        <span>Requiere atención</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
                                    <div className="text-gray-600 text-sm font-medium mb-1">Unidades Vendidas</div>
                                    <div className="text-3xl font-bold text-orange-600">{data.menosVendido.cantidad}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
                                    <div className="text-gray-600 text-sm font-medium mb-1">Ingresos Generados</div>
                                    <div className="text-2xl font-bold text-orange-600">${data.menosVendido.ingresos.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productos Vencidos - Pérdidas */}
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-400 overflow-hidden">
                    <div className="bg-gray-50 p-6 border-b-2 border-gray-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-gray-800">
                                    <AlertTriangle className="w-7 h-7 text-red-600" />
                                    Productos Vencidos - Pérdidas
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    {periodo === 'semana' ? 'Esta semana' : 'Este mes'}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl px-6 py-3 border-2 border-gray-400">
                                <div className="text-gray-600 text-sm font-medium">Total Pérdidas</div>
                                <div className="text-3xl font-bold text-red-600">${data.productosVencidos.perdidas.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="bg-gray-50 rounded-xl px-6 py-3 border-2 border-gray-300">
                                <span className="text-gray-700 font-semibold">
                                    {data.productosVencidos.cantidad} productos vencidos
                                </span>
                            </div>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                <div className="h-full bg-red-500 rounded-full" style={{ width: '45%' }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.productosVencidos.items.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-5 border-2 border-gray-300 hover:border-gray-500 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <Package className="w-5 h-5 text-red-600" />
                                            <h4 className="font-bold text-gray-800">{item.nombre}</h4>
                                        </div>
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold border border-gray-300">
                                            {item.cantidad} unidades
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600 text-sm font-medium">Pérdida estimada:</span>
                                        <span className="text-2xl font-bold text-red-600">${item.valor.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Nota informativa */}
                        <div className="mt-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-800 font-semibold mb-1">Recomendación</p>
                                    <p className="text-gray-700 text-sm">
                                        Revise las fechas de vencimiento en el módulo de Inventario para reducir pérdidas.
                                        Considere implementar promociones para productos próximos a vencer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



            </div>
        </main>
    )
}