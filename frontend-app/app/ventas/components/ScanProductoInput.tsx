"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Barcode, Search } from 'lucide-react'

interface ScanProductoInputProps {
  onProductFound: (producto: any) => void
  onError: (message: string) => void
}

export default function ScanProductoInput({ onProductFound, onError }: ScanProductoInputProps) {
  const [scanCode, setScanCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoTriggerRef = useRef<NodeJS.Timeout | null>(null)
  const MIN_AUTO_LEN = 6
  const AUTO_DELAY_MS = 400

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Detectar escaneo rápido (típico de scanner de códigos de barras)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    } else {
      // Si se está escribiendo rápidamente (scanner), activar indicador
      if (!isScanning) setIsScanning(true)

      // Reset timeout
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = setTimeout(() => {
        setIsScanning(false)
      }, 500)
    }
  }

  // Auto-disparar búsqueda cuando el scanner termina de teclear (breve pausa)
  const handleChange = (value: string) => {
    setScanCode(value)
    setIsScanning(true)

    // Cancelar posibles triggers previos
    if (autoTriggerRef.current) clearTimeout(autoTriggerRef.current)

    // Solo auto-buscar cuando el código tiene una longitud razonable
    if (value.trim().length >= MIN_AUTO_LEN) {
      autoTriggerRef.current = setTimeout(() => {
        handleSearch()
      }, AUTO_DELAY_MS)
    }

    // Apagar indicador si no hay más entrada
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
    scanTimeoutRef.current = setTimeout(() => {
      setIsScanning(false)
    }, 500)
  }

  const handleSearch = async () => {
    if (!scanCode.trim()) {
      onError('Ingrese un código de barras')
      return
    }

    setIsScanning(true)

    try {
      // Buscar por código de lote usando el endpoint de lotes
      const { getLoteByCodigo } = await import('@/lib/lotes')
      const lote = await getLoteByCodigo(scanCode.trim())

      if (!lote) {
        onError(`No se encontró lote con código: ${scanCode}`)
        setScanCode('')
        inputRef.current?.focus()
        return
      }

      // Entrega el objeto lote completo al caller para que decida qué hacer (producto, cantidad, etc.)
      onProductFound(lote)
      setScanCode('')

      // Volver a enfocar para próximo escaneo
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (err: any) {
      onError('Error al buscar producto: ' + err.message)
      setScanCode('')
      inputRef.current?.focus()
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Barcode className={`w-5 h-5 ${isScanning ? 'text-green-500 animate-pulse' : ''}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={scanCode}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text')
            if (pasted) handleChange(pasted)
          }}
          placeholder="Escanee código de barras o busque..."
          className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${isScanning
              ? 'border-green-500 focus:ring-green-500 bg-green-50'
              : 'border-gray-300 focus:ring-blue-500'
            }`}
          autoComplete="off"
        />
        {isScanning && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={!scanCode.trim()}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
        title="Buscar producto"
      >
        <Search className="w-4 h-4" />
        Buscar
      </button>
    </div>
  )
}
