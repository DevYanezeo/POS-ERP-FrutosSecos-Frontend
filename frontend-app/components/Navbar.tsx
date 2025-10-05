"use client"

import Image from 'next/image'
import { User } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import StockAlert from '@/app/dashboard/components/StockAlert'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const isInicio = pathname === '/' || pathname === '/dashboard'
  const isInventario = pathname?.startsWith('/inventario')

  return (
    <header className="border-b bg-[#FBF7F4]">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="logo" width={36} height={36} />
            <div>
              <div className="text-sm font-bold">FRUTOS SECOS</div>
              <div className="text-xs text-muted-foreground">MIL SABORES</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 ml-6">
            <button onClick={() => router.push('/')} className={`px-3 py-1 rounded text-sm ${isInicio ? 'bg-white text-[#7A6F66] font-semibold' : 'text-[#7A6F66] hover:bg-white'}`}>Inicio</button>
            <button onClick={() => router.push('/inventario')} className={`px-3 py-1 rounded text-sm ${isInventario ? 'bg-blue-500 text-white' : 'text-[#7A6F66] hover:bg-white'}`}>Inventario</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <StockAlert />
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white"><User className="w-4 h-4"/></div>
        </div>
      </div>
    </header>
  )
}
