import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'MSM — Mil Sabores Manager',
  description: 'MSM - Sistema de gestión de inventario Mil Sabores Manager',
  generator: 'MSM',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          body:has([data-page="login"]) header { display: none !important; }
        ` }} />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Navbar />
        <main>{children}</main>
        {/* Toasts provider (renders toasts triggered via hooks/use-toast) */}
        <Toaster />
      </body>
    </html>
  )
}
