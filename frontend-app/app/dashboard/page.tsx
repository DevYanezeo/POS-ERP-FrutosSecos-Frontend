"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, Calendar, ArrowRight } from "lucide-react"
import { obtenerRankingProductos, ProductoVendido, getVentasSemanaActual, obtenerResumenDashboard, DashboardSummary } from "@/lib/finanzas"
import { getProductosStockBajo } from "@/lib/productos"
import { getStockMinimo, getAlertasStock } from "@/lib/config"

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [topProducts, setTopProducts] = useState<ProductoVendido[]>([])
  const [bajoStock, setBajoStock] = useState<any[]>([])
  const [loadingStock, setLoadingStock] = useState(true)
  const [weeklySales, setWeeklySales] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [loadingWeeklySales, setLoadingWeeklySales] = useState(true)
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/login")
    const storedName = localStorage.getItem("user_nombre")
    setUserName(storedName)
  }, [router])

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingSummary(true)
        const summary = await obtenerResumenDashboard()
        setDashboardSummary(summary || null)
      } catch (error) {
        console.error("Error loading dashboard summary:", error)
      } finally {
        setLoadingSummary(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const cargarTopProductos = async () => {
      try {
        setLoadingProducts(true)
        const data = await obtenerRankingProductos('mes', 'mas', 5, new Date())
        setTopProducts(data || [])
      } catch (error) {
        console.error("Error cargando top productos:", error)
      } finally {
        setLoadingProducts(false)
      }
    }

    cargarTopProductos()
  }, [])

  useEffect(() => {
    const cargarStockBajo = async () => {
      try {
        setLoadingStock(true)
        const state = getAlertasStock()
        if (state === 'Desactivadas') {
          setBajoStock([])
        } else {
          const min = getStockMinimo()
          const data = await getProductosStockBajo(min)
          setBajoStock(data || [])
        }
      } catch (error) {
        console.error("Error cargando stock bajo:", error)
      } finally {
        setLoadingStock(false)
      }
    }

    cargarStockBajo()
  }, [])

  useEffect(() => {
    const cargarVentasSemanales = async () => {
      try {
        setLoadingWeeklySales(true)
        const data = await getVentasSemanaActual()
        setWeeklySales(data || [0, 0, 0, 0, 0, 0, 0])
      } catch (error) {
        console.error("Error cargando ventas semanales:", error)
      } finally {
        setLoadingWeeklySales(false)
      }
    }

    cargarVentasSemanales()
  }, [])

  const getFechaHoy = () => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const d = new Date()
    return `${dias[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${meses[d.getMonth()]} ${d.getFullYear()}`
  }
  const fechaHoyStr = getFechaHoy()

  return (
    <div className="min-h-screen bg-[#F9F6F3] pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2E2A26] flex items-center gap-3">
                ¡Bienvenid@ {userName || "Invitado"}!
                <span className="text-4xl">👋</span>
              </h1>
              <p className="text-[#7A6F66] mt-2">
                Aquí tienes un resumen de tu negocio hoy
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#7A6F66] bg-white px-4 py-2 rounded-lg border border-[#E5DACE] shadow-sm">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{fechaHoyStr}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Ventas de Hoy */}
          <div className="bg-white rounded-xl p-6 border border-[#E5DACE] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${(dashboardSummary?.porcentajeVentasAyer || 0) >= 0
                  ? 'text-green-600 bg-green-50'
                  : 'text-red-600 bg-red-50'
                }`}>
                {loadingSummary
                  ? '...'
                  : `${(dashboardSummary?.porcentajeVentasAyer || 0) > 0 ? '+' : ''}${(dashboardSummary?.porcentajeVentasAyer || 0).toFixed(1)}%`
                }
              </div>
            </div>
            <div className="text-sm text-[#7A6F66] font-medium mb-1">Ventas de Hoy</div>
            <div className="text-2xl font-bold text-[#2E2A26]">
              {loadingSummary ? '...' : `$${(dashboardSummary?.ventasHoy || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-[#9C9288] mt-2">vs ayer</div>
          </div>

          {/* Productos Vendidos */}
          <div className="bg-white rounded-xl p-6 border border-[#E5DACE] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-[#7A6F66] font-medium mb-1">Productos Vendidos</div>
            <div className="text-2xl font-bold text-[#2E2A26]">
              {loadingSummary ? '...' : (dashboardSummary?.productosVendidos || 0)}
            </div>
            <div className="text-xs text-[#9C9288] mt-2">
              {loadingSummary ? '...' : `${dashboardSummary?.productosUnicos || 0} productos únicos`}
            </div>
          </div>

          {/* Venta Promedio */}
          <div className="bg-white rounded-xl p-6 border border-[#E5DACE] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-[#7A6F66] font-medium mb-1">Venta Promedio</div>
            <div className="text-2xl font-bold text-[#2E2A26]">
              {loadingSummary ? '...' : `$${(dashboardSummary?.ventaPromedio || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-[#9C9288] mt-2">
              {loadingSummary ? '...' : `${dashboardSummary?.transaccionesHoy || 0} transacciones`}
            </div>
          </div>

          {/* Stock Total */}
          <div className="bg-white rounded-xl p-6 border border-[#E5DACE] shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {loadingSummary ? '...' : (dashboardSummary?.alertasStock || 0)}
              </div>
            </div>
            <div className="text-sm text-[#7A6F66] font-medium mb-1">Stock Total</div>
            <div className="text-2xl font-bold text-[#2E2A26]">
              {loadingSummary ? '...' : (dashboardSummary?.stockTotal || 0).toLocaleString()}
            </div>
            <div className="text-xs text-[#9C9288] mt-2">unidades totales</div>
          </div>
        </div>

        {/* Stock Bajo - Acción Requerida */}
        {!loadingStock && bajoStock.length > 0 && (
          <div className="mb-8 bg-white rounded-xl border border-[#E5DACE] shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-[#2E2A26]">Stock Bajo - Acción Requerida</h2>
              </div>
              <button
                onClick={() => router.push('/inventario')}
                className="text-sm text-[#8B4513] hover:text-[#A0522D] font-medium transition-colors hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bajoStock.slice(0, 3).map((producto: any) => {
                const stock = producto.stock || 0
                const isCritical = stock === 0

                return (
                  <div
                    key={producto.idProducto}
                    className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-200 hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-[#2E2A26] mb-1">{producto.nombre}</h3>
                        <p className="text-xs text-[#7A6F66]">Categoría: {producto.categoriaId || 'N/A'}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${isCritical ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'
                        }`}>
                        {isCritical ? 'Crítico' : 'Bajo'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-[#7A6F66] mb-1">Stock: <span className="font-bold text-[#2E2A26]">{stock}</span></div>
                      <div className="text-xs text-[#7A6F66]">{stock} unidades</div>
                    </div>

                    <button
                      onClick={() => router.push(`/inventario?view=${producto.idProducto}`)}
                      className={`w-full ${isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                        } text-white text-sm font-medium py-2 rounded-lg transition-colors`}
                    >
                      Reabastecer Ahora
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom Grid: Top Productos + Ventas de la Semana */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Productos del Mes */}
          <div className="bg-white rounded-xl p-6 border border-[#E5DACE] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#2E2A26] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8B4513]" />
                Top Productos del Mes
              </h3>
              <button
                onClick={() => router.push('/finanzas/productos')}
                className="text-sm text-[#8B4513] hover:text-[#A0522D] font-medium transition-colors hover:underline flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {loadingProducts ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-4 bg-[#FBF7F4] rounded-lg animate-pulse">
                    <div className="h-5 bg-[#E5DACE] rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-[#E5DACE] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((producto, index) => (
                  <div
                    key={producto.nombre}
                    className="p-4 bg-[#FBF7F4] rounded-lg hover:bg-[#F5EDE4] transition-colors cursor-pointer border border-transparent hover:border-[#E5DACE] group"
                    onClick={() => router.push('/finanzas/productos')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A373] to-[#8B4513] text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-[#2E2A26] group-hover:text-[#8B4513] transition-colors">
                            {producto.nombre}
                          </div>
                          <div className="text-xs text-[#9C9288] mt-1">
                            {producto.cantidad} unidades vendidas
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-700">
                          ${producto.ingresos.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">+15%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#9C9288]">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos de ventas este mes</p>
              </div>
            )}
          </div>

          {/* Ventas de la Semana - Gráfico */}
          <div className="bg-white rounded-xl p-6 border border-[#E5DACE] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#2E2A26] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#8B4513]" />
                Ventas de la Semana
              </h3>
            </div>

            {/* Weekly sales chart with real data */}
            <div className="h-72 flex items-end justify-between gap-3 px-6 border-b border-l border-[#E5DACE] pb-4 mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia, index) => {
                // Calculate which day is today (0 = Sunday, 1 = Monday, etc.)
                const today = new Date().getDay()
                // Convert to our array index (Monday=0, Sunday=6)
                const todayIndex = today === 0 ? 6 : today - 1
                const isToday = index === todayIndex

                // Use real data from weeklySales state
                const saleAmount = weeklySales[index] || 0

                // Calculate bar height proportional to sales (max 240px)
                const maxSales = Math.max(...weeklySales, 1) // Avoid division by zero
                const heightPx = saleAmount > 0
                  ? Math.max(60, (saleAmount / maxSales) * 240)
                  : 0 // No bar for zero sales

                return (
                  <div key={dia} className="flex-1 flex flex-col items-center gap-3 group">
                    {saleAmount > 0 && (
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 hover:scale-105 cursor-pointer shadow-md ${isToday
                          ? 'bg-gradient-to-t from-green-600 to-green-400'
                          : 'bg-gradient-to-t from-[#8B4513] to-[#D4A373]'
                          }`}
                        style={{ height: `${heightPx}px` }}
                        title={`${dia}: $${saleAmount.toLocaleString()}`}
                      />
                    )}
                    {saleAmount === 0 && (
                      <div className="h-60" /> // Spacer para mantener alineación
                    )}
                    <span className={`text-sm font-medium ${isToday ? 'text-green-600 font-bold' : 'text-[#7A6F66]'
                      }`}>
                      {dia}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
