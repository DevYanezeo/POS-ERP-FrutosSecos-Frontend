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
  const isVentas = pathname?.startsWith('/ventas')

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
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="logo" width={36} height={36} />
            <div>
              <div className="text-sm font-bold">MSM</div>
              <div className="text-xs text-muted-foreground">Mil Sabores Manager</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 ml-6">
            <button onClick={() => router.push('/')} className={`px-3 py-1 rounded text-sm ${isInicio ? 'bg-white text-[#7A6F66] font-semibold' : 'text-[#7A6F66] hover:bg-white'}`}>Inicio</button>
            <button onClick={() => router.push('/inventario')} className={`px-3 py-1 rounded text-sm ${isInventario ? 'bg-blue-500 text-white' : 'text-[#7A6F66] hover:bg-white'}`}>Inventario</button>
            <button onClick={() => router.push('/ventas')} className={`px-3 py-1 rounded text-sm ${isVentas ? 'bg-blue-500 text-white' : 'text-[#7A6F66] hover:bg-white'}`}>Ventas</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <StockAlert />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400">
                <User className="w-4 h-4"/>
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
