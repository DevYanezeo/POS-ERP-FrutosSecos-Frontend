"use client"

import Image from 'next/image'
import { User, LogOut, Home, ShoppingCart, Box, Clock, BarChart2, Settings } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import StockAlert from '@/app/dashboard/components/StockAlert'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const isInicio = pathname === '/' || pathname === '/dashboard'
  const isInventario = pathname?.startsWith('/inventario')
  const isVentas = pathname === '/ventas' && !pathname?.includes('/historial')
  const isHistorial = pathname?.startsWith('/ventas/historial')
  const isFinanzas = pathname === '/finanzas'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_nombre')
    localStorage.removeItem('user_rol')
    localStorage.removeItem('isAuthenticated')
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-[#FBF7F4]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo a la izquierda - más grande */}
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="logo" width={48} height={48} />
          <div>
            <div className="text-base font-bold">MSM</div>
            <div className="text-sm text-muted-foreground">Mil Sabores Manager</div>
          </div>
        </div>

        {/* Navegación central con más espacio */}
        <nav className="hidden md:flex items-center gap-6">
          {/* barra de navegación central: alto fijo para que los botones puedan ocupar toda la altura */}
          <main className="h-12 flex items-center shadow gap-4 bg-[#F5EDE4] rounded-xl px-0">
            <button
              onClick={() => router.push('/')}
              className={`flex items-center h-full px-4 rounded-lg text-base font-medium transition-colors ${isInicio ? 'bg-[#9A5128] text-white font-semibold shadow-sm rounded-xl' : 'text-[#7A6F66] hover:bg-white'}`}>
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Inicio</span>
            </button>

            <button
              onClick={() => router.push('/inventario')}
              className={`flex items-center h-full px-4 rounded-lg text-base font-medium transition-colors ${isInventario ? 'bg-[#9A5128] text-white shadow-sm rounded-xl' : 'text-[#7A6F66] hover:bg-white'}`}>
              <Box className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Inventario</span>
            </button>

            <button
              onClick={() => router.push('/ventas')}
              className={`flex items-center h-full px-4 rounded-lg text-base font-medium transition-colors ${isVentas ? 'bg-[#9A5128] text-white shadow-sm rounded-xl' : 'text-[#7A6F66] hover:bg-white'}`}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Ventas</span>
            </button>

            <button
              onClick={() => router.push('/ventas/historial')}
              className={`flex items-center h-full px-4 rounded-lg text-base font-medium transition-colors ${isHistorial ? 'bg-[#9A5128] text-white shadow-sm rounded-xl' : 'text-[#7A6F66] hover:bg-white'}`}>
              <Clock className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Historial</span>
            </button>

            <button
              onClick={() => router.push('/finanzas')}
              className={`flex items-center h-full px-4 rounded-lg text-base font-medium transition-colors ${isFinanzas ? 'bg-[#9A5128] text-white shadow-sm rounded-xl' : 'text-[#7A6F66] hover:bg-white'}`}>
              <BarChart2 className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Finanzas</span>
            </button>

          </main>
        </nav>

        {/* Acciones a la derecha */}
        <div className="flex items-center gap-4">
          <StockAlert />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                <User className="w-5 h-5"/>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
            <div className="text-base font-bold">
              {localStorage.getItem('user_nombre') || 'Invitado'}
            </div>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
