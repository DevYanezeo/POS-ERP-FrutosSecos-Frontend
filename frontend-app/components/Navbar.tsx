"use client"

import Image from 'next/image'
import { User, LogOut } from 'lucide-react'
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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_nombre')
    localStorage.removeItem('user_rol')
    localStorage.removeItem('isAuthenticated')
    router.push('/login')
  }

  return (
    <header className="border-b bg-[#FBF7F4]">
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
          <button onClick={() => router.push('/')} className={`px-4 py-2 rounded text-base font-medium transition-colors ${isInicio ? 'bg-white text-[#7A6F66] font-semibold shadow-sm' : 'text-[#7A6F66] hover:bg-white'}`}>Inicio</button>
          <button onClick={() => router.push('/inventario')} className={`px-4 py-2 rounded text-base font-medium transition-colors ${isInventario ? 'bg-blue-500 text-white shadow-sm' : 'text-[#7A6F66] hover:bg-white'}`}>Inventario</button>
          <button onClick={() => router.push('/ventas')} className={`px-4 py-2 rounded text-base font-medium transition-colors ${isVentas ? 'bg-blue-500 text-white shadow-sm' : 'text-[#7A6F66] hover:bg-white'}`}>Ventas</button>
          <button onClick={() => router.push('/ventas/historial')} className={`px-4 py-2 rounded text-base font-medium transition-colors ${isHistorial ? 'bg-green-500 text-white shadow-sm' : 'text-[#7A6F66] hover:bg-white'}`}>Historial</button>
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
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
