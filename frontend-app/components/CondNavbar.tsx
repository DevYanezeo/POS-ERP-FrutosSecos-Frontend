"use client"

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function CondNavbar() {
  const pathname = usePathname()
  if (!pathname) return null

  const normalized = pathname.toLowerCase().replace(/\/+:?$/u, '').replace(/\/+$/u, '')

  if (normalized === '/login' || normalized.startsWith('/login/')) return null

  return <Navbar />
}
