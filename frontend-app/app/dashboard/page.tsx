"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  Edit,
  Filter,
  Grid3X3,
  List,
  Home,
  User,
  X,
  ShoppingCart,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  Check,
  Trash2,
  FileText,
  Star,
  Eye,
  RefreshCw,
  Upload,
  Download,
  Minus,
  CreditCard,
  Smartphone,
} from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentSection, setCurrentSection] = useState("dashboard")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showVentaModal, setShowVentaModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [stockToDecrease, setStockToDecrease] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState("SEPTIEMBRE")
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [selectedUnit, setSelectedUnit] = useState("Todas")
  const [selectedPeriod, setSelectedPeriod] = useState("mes")
  const [selectedFinanceMonth, setSelectedFinanceMonth] = useState("SEPTIEMBRE")
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!token || !isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      const price = parseFloat(item.price.replace('CLP $', '').replace(',', ''))
      return sum + (price * item.quantity)
    }, 0)
    setCartTotal(total)
  }, [cart])

  const clearAuth = () => {
    try {
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("token")
      localStorage.removeItem("user_email")
      localStorage.removeItem("user_nombre")
      localStorage.removeItem("user_rol")
    } catch (e) {
    }
  }

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const addToCart = (product: any) => {
    const existingIndex = cart.findIndex(item => item.id === product.id)
    if (existingIndex >= 0) {
      updateCartQuantity(existingIndex, 1)
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateCartQuantity = (index: number, change: number) => {
    const newCart = [...cart]
    newCart[index].quantity += change
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1)
    }
    setCart(newCart)
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const processPayment = (method: string) => {
    // Simular procesamiento de pago
    alert(`Venta procesada por ${method}. Total: $${(cartTotal * 1.19).toLocaleString()}`)
    setCart([])
    setCartTotal(0)
  }

  const products = [
    {
      id: 1,
      name: "Almendra orgánica",
      category: "Frutos secos",
      price: "CLP $10,200",
      unit: "200 gr",
      stock: "15 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 2,
      name: "Maní Japonés",
      category: "Frutos secos",
      price: "CLP $8,500",
      unit: "250 gr",
      stock: "12 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 3,
      name: "Nueces de Brasil",
      category: "Frutos secos",
      price: "CLP $15,800",
      unit: "300 gr",
      stock: "8 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 4,
      name: "Avena integral",
      category: "Cereales",
      price: "CLP $3,200",
      unit: "500 gr",
      stock: "25 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 5,
      name: "Quinoa blanca",
      category: "Cereales",
      price: "CLP $7,500",
      unit: "400 gr",
      stock: "18 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 6,
      name: "Arroz integral",
      category: "Cereales",
      price: "CLP $4,800",
      unit: "1 kg",
      stock: "30 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 7,
      name: "Lentejas rojas",
      category: "Legumbres",
      price: "CLP $2,900",
      unit: "500 gr",
      stock: "22 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 8,
      name: "Garbanzos",
      category: "Legumbres",
      price: "CLP $3,500",
      unit: "400 gr",
      stock: "16 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 9,
      name: "Porotos negros",
      category: "Legumbres",
      price: "CLP $4,200",
      unit: "500 gr",
      stock: "14 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 10,
      name: "Semillas de chía",
      category: "Semillas",
      price: "CLP $6,800",
      unit: "200 gr",
      stock: "10 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 11,
      name: "Semillas de girasol",
      category: "Semillas",
      price: "CLP $4,500",
      unit: "300 gr",
      stock: "20 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 12,
      name: "Linaza dorada",
      category: "Semillas",
      price: "CLP $5,200",
      unit: "250 gr",
      stock: "13 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 13,
      name: "Miel de abeja",
      category: "Endulzantes",
      price: "CLP $8,900",
      unit: "350 ml",
      stock: "9 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 14,
      name: "Stevia natural",
      category: "Endulzantes",
      price: "CLP $12,500",
      unit: "100 gr",
      stock: "7 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 15,
      name: "Cacao en polvo",
      category: "Especias",
      price: "CLP $9,200",
      unit: "200 gr",
      stock: "11 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 16,
      name: "Canela molida",
      category: "Especias",
      price: "CLP $3,800",
      unit: "100 gr",
      stock: "15 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 17,
      name: "Cúrcuma en polvo",
      category: "Especias",
      price: "CLP $5,600",
      unit: "150 gr",
      stock: "12 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 18,
      name: "Pasas rubias",
      category: "Frutos secos",
      price: "CLP $6,200",
      unit: "250 gr",
      stock: "17 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 19,
      name: "Dátiles Medjool",
      category: "Frutos secos",
      price: "CLP $11,800",
      unit: "300 gr",
      stock: "6 unidades",
      image: "/pile-of-almonds.png",
    },
    {
      id: 20,
      name: "Higos secos",
      category: "Frutos secos",
      price: "CLP $8,700",
      unit: "200 gr",
      stock: "14 unidades",
      image: "/pile-of-almonds.png",
    },
  ]

  const months = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ]

  const categories = ["Todas", "Frutos secos", "Cereales", "Legumbres", "Semillas", "Endulzantes", "Especias"]
  const units = ["Todas", "100 gr", "150 gr", "200 gr", "250 gr", "300 gr", "350 ml", "400 gr", "500 gr", "1 kg"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory
    const matchesUnit = selectedUnit === "Todas" || product.unit === selectedUnit
    return matchesSearch && matchesCategory && matchesUnit
  })

  const sampleProducts = [
    {
      id: 1,
      name: "Almendras orgánicas",
      category: "Frutos secos",
      price: "CLP $10,200",
      unit: "200 gr",
      stock: "15 unidades",
    },
    {
      id: 2,
      name: "Maní Japonés",
      category: "Frutos secos",
      price: "CLP $8,500",
      unit: "250 gr",
      stock: "12 unidades",
    },
  ]

  const salesData = [
    { dia: "01", ventasEfectivo: "110.000", delivery: "30.000", posVentas: "310.000", total: "440.000" },
    { dia: "02", ventasEfectivo: "127.000", delivery: "0", posVentas: "97.300", total: "224.300" },
    { dia: "03", ventasEfectivo: "50.000", delivery: "0", posVentas: "148.540", total: "198.540" },
    { dia: "04", ventasEfectivo: "95.000", delivery: "15.000", posVentas: "205.000", total: "315.000" },
    { dia: "05", ventasEfectivo: "180.000", delivery: "45.000", posVentas: "320.000", total: "545.000" },
    { dia: "06", ventasEfectivo: "75.000", delivery: "0", posVentas: "125.000", total: "200.000" },
    { dia: "07", ventasEfectivo: "220.000", delivery: "60.000", posVentas: "410.000", total: "690.000" },
    { dia: "08", ventasEfectivo: "165.000", delivery: "25.000", posVentas: "285.000", total: "475.000" },
    { dia: "09", ventasEfectivo: "140.000", delivery: "35.000", posVentas: "195.000", total: "370.000" },
    { dia: "10", ventasEfectivo: "190.000", delivery: "50.000", posVentas: "340.000", total: "580.000" },
  ]

  // Component functions
  const StockManagementModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FDFCF9] rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto border border-[#F5EDE4]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#2E2A26] text-xl font-bold">Gestionar Stock</h2>
          <button
            onClick={() => setShowStockModal(false)}
            className="p-2 hover:bg-[#F5EDE4] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#7A6F66]" />
          </button>
        </div>
        <div className="space-y-4">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="bg-[#FFFFFF] rounded-lg p-4 border border-[#F5EDE4] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt="Product"
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-[#2E2A26] font-semibold text-sm">{product.name}</h3>
                  <p className="text-[#7A6F66] text-xs">{product.category}</p>
                  <p className="text-[#7A6F66] text-xs">{product.stock}</p>
                  <p className="text-[#2E2A26] text-sm font-medium">{product.unit}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-[#2E2A26] text-sm font-medium">Cantidad a decrementar:</label>
                <input
                  type="number"
                  min="1"
                  value={stockToDecrease}
                  onChange={(e) => setStockToDecrease(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-[#F5EDE4] rounded-md text-[#2E2A26] text-sm focus:ring-2 focus:ring-[#A0522D] focus:border-transparent"
                />
              </div>
              <button className="w-full px-4 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg font-medium transition-colors shadow-sm">
                Decrementar Stock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const FilterModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FDFCF9] rounded-xl shadow-2xl p-6 w-full max-w-md border border-[#F5EDE4]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#2E2A26] text-xl font-bold">Filtrar Productos</h2>
          <button
            onClick={() => setShowFilterModal(false)}
            className="p-2 hover:bg-[#F5EDE4] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#7A6F66]" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FFFFFF]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Unidad</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FFFFFF]"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setSelectedCategory("Todas")
                setSelectedUnit("Todas")
              }}
              className="flex-1 px-4 py-3 bg-[#7A6F66] hover:bg-[#2E2A26] text-[#FFFFFF] rounded-lg font-medium transition-colors shadow-sm"
            >
              Limpiar
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="flex-1 px-4 py-3 bg-[#8DAE4F] hover:bg-[#7A9C42] text-[#FFFFFF] rounded-lg font-medium transition-colors shadow-sm"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const AddProductModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FDFCF9] rounded-xl shadow-2xl p-6 w-full max-w-md border border-[#F5EDE4]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#2E2A26] text-xl font-bold">Agregar Producto</h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 hover:bg-[#F5EDE4] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#7A6F66]" />
          </button>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Nombre</label>
            <input
              type="text"
              className="w-full px-3 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FFFFFF]"
              placeholder="Nombre del producto"
            />
          </div>
          <div>
            <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Categoría</label>
            <select className="w-full px-3 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FFFFFF]">
              <option>Frutos secos</option>
              <option>Cereales</option>
              <option>Legumbres</option>
              <option>Semillas</option>
              <option>Endulzantes</option>
              <option>Especias</option>
            </select>
          </div>
          <div>
            <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Precio</label>
            <input
              type="text"
              className="w-full px-3 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FFFFFF]"
              placeholder="CLP $0"
            />
          </div>
          <div>
            <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Unidad</label>
            <input
              type="text"
              className="w-full px-3 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FFFFFF]"
              placeholder="200 gr"
            />
          </div>
          <div>
            <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Stock</label>
            <input
              type="number"
              className="w-full px-3 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FFFFFF]"
              placeholder="0"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 px-4 py-3 bg-[#7A6F66] hover:bg-[#2E2A26] text-[#FFFFFF] rounded-lg font-medium transition-colors shadow-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#FFFFFF] rounded-lg font-medium transition-colors shadow-sm"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const ProductDetailModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FDFCF9] rounded-xl shadow-2xl p-6 w-full max-w-md border border-[#F5EDE4]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#2E2A26] text-xl font-bold">Detalle de Productos</h2>
          <button
            onClick={() => setShowProductDetail(false)}
            className="p-2 hover:bg-[#F5EDE4] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#7A6F66]" />
          </button>
        </div>
        <div className="space-y-4">
          {sampleProducts.map((product) => (
            <div
              key={product.id}
              className="bg-[#FFFFFF] rounded-lg p-4 flex items-center justify-between border border-[#F5EDE4] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <img src="/pile-of-almonds.png" alt="Product" className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <h3 className="text-[#2E2A26] font-semibold text-sm">{product.name}</h3>
                  <p className="text-[#7A6F66] text-xs">{product.category}</p>
                  <p className="text-[#7A6F66] text-xs">{product.stock}</p>
                  <p className="text-[#2E2A26] text-sm font-medium">{product.unit}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-[#A0522D] font-bold">{product.price}</p>
                <button className="w-10 h-10 bg-[#3B82F6] hover:bg-[#2563EB] rounded-full flex items-center justify-center transition-colors shadow-sm">
                  <Edit className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Render functions
  const renderConfiguracion = () => (
    <div className="space-y-6">
      <h1 className="text-[#2E2A26] text-3xl font-bold">Configuración del Sistema</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de la Empresa */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h2 className="text-[#2E2A26] text-xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#A0522D]" />
            Información de la Empresa
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Nombre de la Empresa</label>
              <input
                type="text"
                defaultValue="FRUTOS SECOS MIL SABORES"
                className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
              />
            </div>
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">RUT</label>
              <input
                type="text"
                defaultValue="12.345.678-9"
                className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
              />
            </div>
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Dirección</label>
              <input
                type="text"
                defaultValue="Av. Principal 1234, Santiago"
                className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
              />
            </div>
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Teléfono</label>
              <input
                type="text"
                defaultValue="+56 9 1234 5678"
                className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Inventario */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h2 className="text-[#2E2A26] text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#3B82F6]" />
            Configuración de Inventario
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Stock Mínimo por Defecto</label>
              <input
                type="number"
                defaultValue="5"
                className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
              />
            </div>
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Alertas de Stock Bajo</label>
              <select className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]">
                <option>Activadas</option>
                <option>Desactivadas</option>
              </select>
            </div>
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Actualización Automática de Precio</label>
              <select className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]">
                <option>Manual</option>
                <option>Automática</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuración de Ventas */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h2 className="text-[#2E2A26] text-xl font-bold mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#22C55E]" />
            Configuración de Ventas
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">IVA (%)</label>
              <input
                type="number"
                defaultValue="19"
                className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
              />
            </div>
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Moneda</label>
              <select className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]">
                <option>CLP - Pesos Chilenos</option>
                <option>USD - Dólares</option>
                <option>EUR - Euros</option>
              </select>
            </div>
            <div>
              <label className="block text-[#2E2A26] text-sm font-semibold mb-2">Descuentos Automáticos</label>
              <select className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-[#2E2A26] focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]">
                <option>Activados</option>
                <option>Desactivados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Usuarios y Permisos */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h2 className="text-[#2E2A26] text-xl font-bold mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-[#F59E0B]" />
            Usuarios y Permisos
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#F9F6F3] rounded-lg">
              <div>
                <p className="text-[#2E2A26] font-semibold">Linda Erika</p>
                <p className="text-[#7A6F66] text-sm">Administradora</p>
              </div>
              <button className="text-[#A0522D] text-sm font-medium hover:underline">Editar</button>
            </div>
            <button className="w-full px-4 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#FFFFFF] rounded-lg font-medium transition-colors">
              + Agregar Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#FFFFFF] rounded-lg font-semibold transition-colors shadow-sm">
          Guardar Cambios
        </button>
        <button className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-[#FFFFFF] rounded-lg font-semibold transition-colors shadow-sm">
          <Download className="w-4 h-4 inline mr-2" />
          Exportar Configuración
        </button>
        <button className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#FFFFFF] rounded-lg font-semibold transition-colors shadow-sm">
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Restaurar Valores por Defecto
        </button>
      </div>
    </div>
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2E2A26] text-3xl font-bold mb-2">¡Bienvenida Linda! 👋</h1>
          <p className="text-[#7A6F66] text-lg">Aquí tienes un resumen de tu negocio hoy</p>
        </div>
        <div className="text-right">
          <p className="text-[#7A6F66] text-sm">Fecha</p>
          <p className="text-[#2E2A26] font-semibold">Miércoles, 11 Sep 2024</p>
        </div>
      </div>

      {/* Métricas del Día */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7A6F66] text-sm font-medium">Ventas de Hoy</p>
              <p className="text-[#2E2A26] text-3xl font-bold">$125,840</p>
              <p className="text-[#22C55E] text-sm flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" />
                +18% vs ayer
              </p>
            </div>
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#22C55E]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7A6F66] text-sm font-medium">Productos Vendidos</p>
              <p className="text-[#2E2A26] text-3xl font-bold">47</p>
              <p className="text-[#3B82F6] text-sm flex items-center gap-1 mt-1">
                <Package className="w-4 h-4" />
                12 productos únicos
              </p>
            </div>
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7A6F66] text-sm font-medium">Ticket Promedio</p>
              <p className="text-[#2E2A26] text-3xl font-bold">$8,950</p>
              <p className="text-[#F59E0B] text-sm flex items-center gap-1 mt-1">
                <BarChart3 className="w-4 h-4" />
                14 transacciones
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7A6F66] text-sm font-medium">Stock Total</p>
              <p className="text-[#2E2A26] text-3xl font-bold">1,247</p>
              <p className="text-[#DC2626] text-sm flex items-center gap-1 mt-1">
                <AlertTriangle className="w-4 h-4" />
                3 productos bajos
              </p>
            </div>
            <div className="w-12 h-12 bg-[#A0522D]/10 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-[#A0522D]" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de Stock Bajo */}
      <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#2E2A26] text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-[#DC2626]" />
            Stock Bajo - Acción Requerida
          </h2>
          <button className="text-[#A0522D] text-sm font-medium hover:underline">Ver todos</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Almendras Orgánicas", stock: 3, min: 10, unit: "200g" },
            { name: "Nueces de Brasil", stock: 1, min: 8, unit: "300g" },
            { name: "Dátiles Medjool", stock: 2, min: 6, unit: "300g" }
          ].map((product, index) => (
            <div key={index} className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#2E2A26] font-semibold text-sm">{product.name}</h3>
                <span className="bg-[#DC2626] text-[#FFFFFF] text-xs px-2 py-1 rounded-full">Crítico</span>
              </div>
              <p className="text-[#7A6F66] text-sm mb-3">
                Stock actual: <span className="font-bold text-[#DC2626]">{product.stock}</span> / 
                Mínimo: {product.min} {product.unit}
              </p>
              <button className="w-full bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] py-2 rounded-lg text-sm font-medium transition-colors">
                Reabastecer Ahora
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Productos y Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Productos Vendidos */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h2 className="text-[#2E2A26] text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-[#F59E0B]" />
            Top Productos del Mes
          </h2>
          <div className="space-y-4">
            {[
              { name: "Almendras Orgánicas", sales: 156, revenue: "$31,200", trend: "+12%" },
              { name: "Maní Japonés", sales: 134, revenue: "$22,780", trend: "+8%" },
              { name: "Quinoa Blanca", sales: 89, revenue: "$19,950", trend: "+15%" },
              { name: "Semillas de Chía", sales: 76, revenue: "$15,240", trend: "+5%" },
              { name: "Avena Integral", sales: 68, revenue: "$10,880", trend: "+22%" }
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-[#F9F6F3] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#A0522D]/10 rounded-lg flex items-center justify-center">
                    <span className="text-[#A0522D] font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-[#2E2A26] font-semibold text-sm">{product.name}</p>
                    <p className="text-[#7A6F66] text-xs">{product.sales} unidades vendidas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#2E2A26] font-bold text-sm">{product.revenue}</p>
                  <p className="text-[#22C55E] text-xs">{product.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Ventas Semanales */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h2 className="text-[#2E2A26] text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#8DAE4F]" />
            Ventas de la Semana
          </h2>
          <div className="h-64 flex items-end justify-center gap-3">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day, index) => {
              const height = Math.random() * 180 + 40
              const isToday = index === 2
              return (
                <div key={day} className="flex flex-col items-center">
                  <div 
                    className={`w-8 rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                      isToday 
                        ? "bg-gradient-to-t from-[#22C55E] to-[#16A34A]" 
                        : "bg-gradient-to-t from-[#A0522D] to-[#D4A373]"
                    }`}
                    style={{ height: `${height}px` }}
                  ></div>
                  <span className={`text-xs mt-2 font-medium ${
                    isToday ? "text-[#22C55E]" : "text-[#7A6F66]"
                  }`}>
                    {day}
                  </span>
                  <span className="text-xs text-[#7A6F66]">
                    ${(height * 150).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
        <h2 className="text-[#2E2A26] text-xl font-bold mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowVentaModal(true)}
            className="flex flex-col items-center gap-3 p-6 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 rounded-xl transition-colors border border-[#22C55E]/20"
          >
            <ShoppingCart className="w-8 h-8 text-[#22C55E]" />
            <span className="text-[#2E2A26] font-medium">Nueva Venta</span>
          </button>
          
          <button 
            onClick={() => setCurrentSection("inventario")}
            className="flex flex-col items-center gap-3 p-6 bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 rounded-xl transition-colors border border-[#3B82F6]/20"
          >
            <Plus className="w-8 h-8 text-[#3B82F6]" />
            <span className="text-[#2E2A26] font-medium">Agregar Producto</span>
          </button>
          
          <button 
            onClick={() => setShowBulkUploadModal(true)}
            className="flex flex-col items-center gap-3 p-6 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 rounded-xl transition-colors border border-[#F59E0B]/20"
          >
            <Upload className="w-8 h-8 text-[#F59E0B]" />
            <span className="text-[#2E2A26] font-medium">Carga Masiva</span>
          </button>
          
          <button 
            onClick={() => setCurrentSection("estadisticas")}
            className="flex flex-col items-center gap-3 p-6 bg-[#A0522D]/10 hover:bg-[#A0522D]/20 rounded-xl transition-colors border border-[#A0522D]/20"
          >
            <BarChart3 className="w-8 h-8 text-[#A0522D]" />
            <span className="text-[#2E2A26] font-medium">Ver Reportes</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderInventario = () => (
    <div>
      <h1 className="text-[#2E2A26] text-3xl font-bold mb-8">Gestión de Inventario</h1>

      {/* Controls */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 px-4 py-3 bg-[#FFFFFF] border border-[#F5EDE4] rounded-lg text-[#2E2A26] placeholder-[#7A6F66] focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent shadow-sm"
            />
            <Search className="absolute right-3 top-3.5 w-5 h-5 text-[#7A6F66]" />
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#FFFFFF] rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>

          <button
            onClick={() => setShowProductDetail(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-[#FFFFFF] rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Edit className="w-5 h-5" />
            Editar Producto
          </button>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#FFFFFF] rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Filter className="w-5 h-5" />
            Filtrar
          </button>

          {/* Stock Management Button */}
          <button
            onClick={() => setShowStockModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Minus className="w-5 h-5" />
            Gestionar Stock
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1 rounded-lg border border-[#F5EDE4] shadow-sm">
          <button
            onClick={() => setViewMode("table")}
            className={`p-3 rounded-md transition-all duration-200 ${viewMode === "table" ? "bg-[#A0522D] text-[#FFFFFF] shadow-sm" : "bg-transparent text-[#7A6F66] hover:bg-[#F5EDE4]"}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 rounded-md transition-all duration-200 ${viewMode === "grid" ? "bg-[#A0522D] text-[#FFFFFF] shadow-sm" : "bg-transparent text-[#7A6F66] hover:bg-[#F5EDE4]"}`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {(selectedCategory !== "Todas" || selectedUnit !== "Todas") && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-[#FFFFFF] rounded-lg border border-[#F5EDE4] shadow-sm">
          <span className="text-[#2E2A26] text-sm font-semibold">Filtros activos:</span>
          {selectedCategory !== "Todas" && (
            <span className="px-3 py-1 bg-[#8DAE4F] text-[#FFFFFF] rounded-full text-sm font-medium">{selectedCategory}</span>
          )}
          {selectedUnit !== "Todas" && (
            <span className="px-3 py-1 bg-[#D4A373] text-[#FFFFFF] rounded-full text-sm font-medium">{selectedUnit}</span>
          )}
        </div>
      )}

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-[#FFFFFF] rounded-xl p-6 shadow-sm border border-[#F5EDE4] hover:shadow-md transition-all duration-200 hover:border-[#D4A373]">
              <div className="mb-4">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-[#2E2A26] font-semibold text-sm mb-2">{product.name}</h3>
                <p className="text-[#A0522D] font-bold text-sm mb-1">{product.price}</p>
                <p className="text-[#2E2A26] text-sm font-medium mb-1">{product.unit}</p>
                <p className="text-[#7A6F66] text-xs">{product.stock}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-xl overflow-hidden shadow-sm border border-[#F5EDE4]">
          <table className="w-full">
            <thead className="bg-[#F5EDE4]">
              <tr>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Nombre</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Categoría</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Precio</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Unidad</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.slice(0, 10).map((product, index) => (
                <tr key={product.id} className={`transition-colors hover:bg-[#F9F6F3] ${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#FDFCF9]"}`}>
                  <td className="px-6 py-4 text-[#2E2A26] font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-[#7A6F66]">{product.category}</td>
                  <td className="px-6 py-4 text-[#A0522D] font-semibold">{product.price}</td>
                  <td className="px-6 py-4 text-[#7A6F66]">{product.unit}</td>
                  <td className="px-6 py-4 text-[#2E2A26]">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderVentas = () => (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Panel de Productos - Lateral */}
      <div className="w-1/3 bg-[#FFFFFF] rounded-xl border border-[#F5EDE4] shadow-sm flex flex-col">
        <div className="p-4 border-b border-[#F5EDE4]">
          <h2 className="text-[#2E2A26] text-lg font-bold mb-4">Catálogo de Productos</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9F6F3] border border-[#F5EDE4] rounded-lg text-[#2E2A26] placeholder-[#7A6F66] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent"
            />
            <Search className="absolute right-3 top-3.5 w-5 h-5 text-[#7A6F66]" />
          </div>
          
          {/* Filtros Rápidos */}
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {["Todos", "Frutos secos", "Cereales", "Legumbres", "Semillas"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === "Todos" ? "Todas" : category)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  (selectedCategory === "Todas" && category === "Todos") || selectedCategory === category
                    ? "bg-[#22C55E] text-[#FFFFFF]"
                    : "bg-[#F9F6F3] text-[#7A6F66] hover:bg-[#F5EDE4]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredProducts.slice(0, 20).map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex items-center gap-3 p-3 bg-[#F9F6F3] hover:bg-[#F5EDE4] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-[#22C55E]"
            >
              <Image
                src={product.image || "/pile-of-almonds.png"}
                alt={product.name}
                width={40}
                height={40}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="text-[#2E2A26] font-semibold text-sm">{product.name}</h3>
                <p className="text-[#7A6F66] text-xs">{product.unit}</p>
                <p className="text-[#A0522D] font-bold text-sm">{product.price}</p>
              </div>
              <div className="text-right">
                <p className="text-[#7A6F66] text-xs">Stock:</p>
                <p className="text-[#2E2A26] font-medium text-sm">{product.stock.split(' ')[0]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de Venta - Principal */}
      <div className="flex-1 bg-[#FFFFFF] rounded-xl border border-[#F5EDE4] shadow-sm flex flex-col">
        <div className="p-6 border-b border-[#F5EDE4]">
          <div className="flex items-center justify-between">
            <h2 className="text-[#2E2A26] text-2xl font-bold">Nueva Venta</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#FFFFFF] rounded-lg font-medium transition-colors">
                <FileText className="w-4 h-4 inline mr-2" />
                Última Venta
              </button>
              <button 
                onClick={() => setCart([])}
                className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Carrito de Compras */}
        <div className="flex-1 p-6 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-[#7A6F66] mb-4" />
              <h3 className="text-[#2E2A26] text-xl font-semibold mb-2">Carrito Vacío</h3>
              <p className="text-[#7A6F66] max-w-md">
                Selecciona productos del catálogo lateral para comenzar una nueva venta.
                Puedes buscar por nombre o escanear código de barras.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-[#F9F6F3] rounded-lg border border-[#F5EDE4]">
                  <Image
                    src={item.image || "/pile-of-almonds.png"}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-[#2E2A26] font-semibold">{item.name}</h3>
                    <p className="text-[#7A6F66] text-sm">{item.unit}</p>
                    <p className="text-[#A0522D] font-bold">{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateCartQuantity(index, -1)}
                      className="w-8 h-8 bg-[#DC2626] hover:bg-[#B91C1C] text-[#FFFFFF] rounded-full flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="text-[#2E2A26] font-bold text-lg min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateCartQuantity(index, 1)}
                      className="w-8 h-8 bg-[#22C55E] hover:bg-[#16A34A] text-[#FFFFFF] rounded-full flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2E2A26] font-bold">
                      ${(parseFloat(item.price.replace('CLP $', '').replace(',', '')) * item.quantity).toLocaleString()}
                    </p>
                    <button 
                      onClick={() => removeFromCart(index)}
                      className="text-[#DC2626] hover:text-[#B91C1C] text-sm mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de Total y Pago */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#F5EDE4] bg-[#F9F6F3]">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#7A6F66] text-lg">Subtotal:</span>
                <span className="text-[#2E2A26] text-xl font-bold">${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7A6F66] text-lg">IVA (19%):</span>
                <span className="text-[#2E2A26] text-xl font-bold">${(cartTotal * 0.19).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-bold border-t border-[#F5EDE4] pt-4">
                <span className="text-[#2E2A26]">Total:</span>
                <span className="text-[#22C55E]">${(cartTotal * 1.19).toLocaleString()}</span>
              </div>
              
              {/* Métodos de Pago */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <button 
                  onClick={() => processPayment('efectivo')}
                  className="flex flex-col items-center gap-2 p-4 bg-[#22C55E] hover:bg-[#16A34A] text-[#FFFFFF] rounded-lg font-semibold transition-colors"
                >
                  <DollarSign className="w-6 h-6" />
                  Efectivo
                </button>
                <button 
                  onClick={() => processPayment('tarjeta')}
                  className="flex flex-col items-center gap-2 p-4 bg-[#3B82F6] hover:bg-[#2563EB] text-[#FFFFFF] rounded-lg font-semibold transition-colors"
                >
                  <FileText className="w-6 h-6" />
                  Tarjeta
                </button>
                <button 
                  onClick={() => processPayment('transferencia')}
                  className="flex flex-col items-center gap-2 p-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#FFFFFF] rounded-lg font-semibold transition-colors"
                >
                  <RefreshCw className="w-6 h-6" />
                  Transferencia
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderEstadisticas = () => (
    <div className="space-y-6">
      <h1 className="text-[#2E2A26] text-3xl font-bold">Estadísticas y Reportes</h1>

      {/* Period Selection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-[#FFFFFF] p-1 rounded-lg border border-[#F5EDE4] shadow-sm">
          <button
            onClick={() => setSelectedPeriod("dia")}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              selectedPeriod === "dia"
                ? "bg-[#8DAE4F] text-[#FFFFFF] shadow-sm"
                : "bg-transparent text-[#7A6F66] hover:bg-[#F5EDE4]"
            }`}
          >
            Día
          </button>
          <button
            onClick={() => setSelectedPeriod("semana")}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              selectedPeriod === "semana"
                ? "bg-[#8DAE4F] text-[#FFFFFF] shadow-sm"
                : "bg-transparent text-[#7A6F66] hover:bg-[#F5EDE4]"
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setSelectedPeriod("mes")}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              selectedPeriod === "mes"
                ? "bg-[#8DAE4F] text-[#FFFFFF] shadow-sm"
                : "bg-transparent text-[#7A6F66] hover:bg-[#F5EDE4]"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setSelectedPeriod("año")}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
              selectedPeriod === "año"
                ? "bg-[#8DAE4F] text-[#FFFFFF] shadow-sm"
                : "bg-transparent text-[#7A6F66] hover:bg-[#F5EDE4]"
            }`}
          >
            Año
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
            className="flex items-center gap-2 px-6 py-3 bg-[#A0522D] hover:bg-[#8B5E3C] text-[#FFFFFF] rounded-lg font-medium transition-colors shadow-sm"
          >
            {selectedFinanceMonth}
            <ChevronDown className="w-5 h-5" />
          </button>
          {showFinanceDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-[#FFFFFF] border border-[#F5EDE4] rounded-lg shadow-lg z-10 min-w-full">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => {
                    setSelectedFinanceMonth(month)
                    setShowFinanceDropdown(false)
                  }}
                  className="block w-full text-left px-4 py-3 text-[#2E2A26] hover:bg-[#F9F6F3] transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {month}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-[#FFFFFF] rounded-xl p-6 border-l-4 border-[#22C55E] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#7A6F66] text-sm font-medium mb-2">Ingresos Totales</h3>
              <p className="text-[#2E2A26] text-3xl font-bold mb-2">$4,127,840</p>
              <p className="text-[#22C55E] text-sm flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" />
                +12.5% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#22C55E]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl p-6 border-l-4 border-[#DC2626] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#7A6F66] text-sm font-medium mb-2">Gastos</h3>
              <p className="text-[#2E2A26] text-3xl font-bold mb-2">$1,250,000</p>
              <p className="text-[#DC2626] text-sm flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" />
                +5.2% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-[#DC2626]/10 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-[#DC2626]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl p-6 border-l-4 border-[#3B82F6] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#7A6F66] text-sm font-medium mb-2">Ganancia Neta</h3>
              <p className="text-[#2E2A26] text-3xl font-bold mb-2">$2,877,840</p>
              <p className="text-[#22C55E] text-sm flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" />
                +15.8% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-xl p-6 border-l-4 border-[#F59E0B] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#7A6F66] text-sm font-medium mb-2">Margen de Ganancia</h3>
              <p className="text-[#2E2A26] text-3xl font-bold mb-2">69.7%</p>
              <p className="text-[#22C55E] text-sm flex items-center gap-1 font-medium">
                <TrendingUp className="w-4 h-4" />
                +2.1% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Ingresos por Período */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h3 className="text-[#2E2A26] font-bold text-lg mb-6">Ingresos por {selectedPeriod}</h3>
          <div className="h-64 flex items-end justify-center gap-2">
            {Array.from({ length: selectedPeriod === "mes" ? 12 : selectedPeriod === "semana" ? 4 : 30 }, (_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className="w-6 bg-gradient-to-t from-[#A0522D] to-[#D4A373] rounded-t hover:from-[#8B5E3C] hover:to-[#A0522D] transition-colors cursor-pointer" 
                  style={{ height: `${Math.random() * 200 + 50}px` }}
                ></div>
                <span className="text-xs text-[#7A6F66] mt-2">
                  {selectedPeriod === "mes" ? `${i + 1}` : selectedPeriod === "semana" ? `S${i + 1}` : `${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ingresos por Medio de Pago */}
        <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#F5EDE4] shadow-sm">
          <h3 className="text-[#2E2A26] font-bold text-lg mb-6">Ingresos por Medio de Pago</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-[#FFFFFF] font-bold text-lg">42%</span>
              </div>
              <p className="text-[#2E2A26] font-semibold">Efectivo</p>
              <p className="text-[#7A6F66] text-sm">$1,733,693</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-[#FFFFFF] font-bold text-lg">38%</span>
              </div>
              <p className="text-[#2E2A26] font-semibold">POS/Tarjeta</p>
              <p className="text-[#7A6F66] text-sm">$1,568,579</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-[#FFFFFF] font-bold text-lg">20%</span>
              </div>
              <p className="text-[#2E2A26] font-semibold">Transferencia</p>
              <p className="text-[#7A6F66] text-sm">$825,568</p>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Ventas */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#F5EDE4] shadow-sm">
        <div className="p-6 border-b border-[#F5EDE4]">
          <h2 className="text-[#2E2A26] text-xl font-bold">Histórico de Ventas - {selectedFinanceMonth}</h2>
        </div>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F5EDE4]">
              <tr>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Día</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Ventas Efectivo</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Delivery/Transferencia</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">POS Ventas</th>
                <th className="text-left px-6 py-4 text-[#2E2A26] font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, index) => (
                <tr key={sale.dia} className={`transition-colors hover:bg-[#F9F6F3] ${index % 2 === 0 ? "bg-[#FFFFFF]" : "bg-[#FDFCF9]"}`}>
                  <td className="px-6 py-4 text-[#2E2A26] font-semibold">{sale.dia}</td>
                  <td className="px-6 py-4 text-[#7A6F66]">${sale.ventasEfectivo}</td>
                  <td className="px-6 py-4 text-[#7A6F66]">${sale.delivery}</td>
                  <td className="px-6 py-4 text-[#7A6F66]">${sale.posVentas}</td>
                  <td className="px-6 py-4 text-[#A0522D] font-bold">${sale.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )


  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      {/* Header */}
      <header className="bg-[#FFFFFF] shadow-sm border-b border-[#F5EDE4] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo y Nombre */}
            <div className="flex items-center gap-4">
              <Image 
                src="/logo.png" 
                alt="Logo Frutos Secos Mil Sabores" 
                width={48} 
                height={48}
                className="rounded-lg"
              />
              <div className="hidden md:block">
                <h1 className="text-[#2E2A26] font-bold text-lg">FRUTOS SECOS</h1>
                <p className="text-[#A0522D] text-sm font-medium">MIL SABORES</p>
              </div>
            </div>
            
            {/* Navegación Principal */}
            <nav className="flex items-center gap-2 bg-[#F9F6F3] rounded-xl p-1">
              <button
                onClick={() => setCurrentSection("dashboard")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === "dashboard" 
                    ? "bg-[#A0522D] text-[#FFFFFF] shadow-sm" 
                    : "text-[#7A6F66] hover:bg-[#FFFFFF] hover:text-[#2E2A26]"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden lg:block">Inicio</span>
              </button>
              
              <button
                onClick={() => setCurrentSection("ventas")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === "ventas" 
                    ? "bg-[#22C55E] text-[#FFFFFF] shadow-sm" 
                    : "text-[#7A6F66] hover:bg-[#FFFFFF] hover:text-[#2E2A26]"
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden lg:block">Ventas</span>
              </button>
              
              <button
                onClick={() => setCurrentSection("inventario")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === "inventario" 
                    ? "bg-[#3B82F6] text-[#FFFFFF] shadow-sm" 
                    : "text-[#7A6F66] hover:bg-[#FFFFFF] hover:text-[#2E2A26]"
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="hidden lg:block">Inventario</span>
              </button>
              
              <button
                onClick={() => setCurrentSection("estadisticas")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === "estadisticas" 
                    ? "bg-[#F59E0B] text-[#FFFFFF] shadow-sm" 
                    : "text-[#7A6F66] hover:bg-[#FFFFFF] hover:text-[#2E2A26]"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden lg:block">Estadísticas</span>
              </button>
              
              <button
                onClick={() => setCurrentSection("configuracion")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === "configuracion" 
                    ? "bg-[#8B5E3C] text-[#FFFFFF] shadow-sm" 
                    : "text-[#7A6F66] hover:bg-[#FFFFFF] hover:text-[#2E2A26]"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="hidden lg:block">Config</span>
              </button>
            </nav>
          </div>
          
          {/* Botón Nueva Venta + Usuario */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowVentaModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-[#FFFFFF] rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingCart className="w-5 h-5" />
              Nueva Venta
            </button>
            
            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="text-[#7A6F66] text-sm hover:text-[#A0522D] transition-colors">
                Cerrar sesión
              </button>
              <div className="w-10 h-10 bg-[#A0522D] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[#FFFFFF]" />
              </div>
              <span className="text-[#2E2A26] font-medium hidden md:block">Linda Erika</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 bg-[#F9F6F3] min-h-screen">
        {currentSection === "dashboard" && renderDashboard()}
        {currentSection === "ventas" && renderVentas()}
        {currentSection === "inventario" && renderInventario()}
        {currentSection === "estadisticas" && renderEstadisticas()}
        {currentSection === "configuracion" && renderConfiguracion()}
      </main>

      {/* Modal Components */}
      {showAddModal && <AddProductModal />}
      {showProductDetail && <ProductDetailModal />}
      {showStockModal && <StockManagementModal />}
      {showFilterModal && <FilterModal />}
    </div>
  )
}
