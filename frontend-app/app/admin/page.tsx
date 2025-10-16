"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

const PRODUCTOS_BULK = [
  { nombre: 'ALMENDRAS ENTERAS', categoria: 'Frutos secos', precio: 1500, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Almendras%20Org%C3%A1nica.png' },
  { nombre: 'ALMENDRAS ENTERAS', categoria: 'Frutos secos', precio: 3500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Almendras%20Org%C3%A1nica.png' },
  { nombre: 'ALMENDRAS ENTERAS', categoria: 'Frutos secos', precio: 6500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Almendras%20Org%C3%A1nica.png' },
  { nombre: 'ALMENDRAS ENTERAS', categoria: 'Frutos secos', precio: 12700, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Almendras%20Org%C3%A1nica.png' },
  
  { nombre: 'NUEZ MARIPOSA ORGÁNICAS', categoria: 'Frutos secos', precio: 1300, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Nuez%20Mariposa%20Organica.png' },
  { nombre: 'NUEZ MARIPOSA ORGÁNICAS', categoria: 'Frutos secos', precio: 3000, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Nuez%20Mariposa%20Organica.png' },
  { nombre: 'NUEZ MARIPOSA ORGÁNICAS', categoria: 'Frutos secos', precio: 5700, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Nuez%20Mariposa%20Organica.png' },
  { nombre: 'NUEZ MARIPOSA ORGÁNICAS', categoria: 'Frutos secos', precio: 10900, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Nuez%20Mariposa%20Organica.png' },
  
  { nombre: 'MANI JAPONES PETTIZ PIMIENTA ROJA', categoria: 'Frutos secos', precio: 1800, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20japon%C3%A9s%20PETTIZ%20%20Pimienta%20Roja.png' },
  { nombre: 'MANI JAPONES PETTIZ PIMIENTA ROJA', categoria: 'Frutos secos', precio: 3300, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20japon%C3%A9s%20PETTIZ%20%20Pimienta%20Roja.png' },
  { nombre: 'MANI JAPONES PETTIZ PIMIENTA ROJA', categoria: 'Frutos secos', precio: 6300, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20japon%C3%A9s%20PETTIZ%20%20Pimienta%20Roja.png' },
  
  { nombre: 'PISTACHOS C/S SAL', categoria: 'Frutos secos', precio: 2200, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Pistacho%20Natural%20Salado.png' },
  { nombre: 'PISTACHOS C/S SAL', categoria: 'Frutos secos', precio: 4900, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Pistacho%20Natural%20Salado.png' },
  { nombre: 'PISTACHOS C/S SAL', categoria: 'Frutos secos', precio: 9500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Pistacho%20Natural%20Salado.png' },
  { nombre: 'PISTACHOS C/S SAL', categoria: 'Frutos secos', precio: 18990, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Pistacho%20Natural%20Salado.png' },
  
  { nombre: 'CASTAÑAS DE CAJÚ C/S SAL', categoria: 'Frutos secos', precio: 2300, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Casta%C3%B1as%20de%20Caj%C3%BA%20Natural%20o%20Saladas.png' },
  { nombre: 'CASTAÑAS DE CAJÚ C/S SAL', categoria: 'Frutos secos', precio: 5500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Casta%C3%B1as%20de%20Caj%C3%BA%20Natural%20o%20Saladas.png' },
  { nombre: 'CASTAÑAS DE CAJÚ C/S SAL', categoria: 'Frutos secos', precio: 10500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Casta%C3%B1as%20de%20Caj%C3%BA%20Natural%20o%20Saladas.png' },
  { nombre: 'CASTAÑAS DE CAJÚ C/S SAL', categoria: 'Frutos secos', precio: 20900, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Casta%C3%B1as%20de%20Caj%C3%BA%20Natural%20o%20Saladas.png' },
  
  { nombre: 'BANANA CHIPS', categoria: 'Frutos secos', precio: 2000, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Banana%20Chips%20Deshidratada.png' },
  { nombre: 'BANANA CHIPS', categoria: 'Frutos secos', precio: 3800, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Banana%20Chips%20Deshidratada.png' },
  { nombre: 'BANANA CHIPS', categoria: 'Frutos secos', precio: 7500, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Banana%20Chips%20Deshidratada.png' },
  
  { nombre: 'MANGO LONJAS', categoria: 'Frutos secos', precio: 2500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mango%20Lonja%20Deshidratado.png' },
  { nombre: 'MANGO LONJAS', categoria: 'Frutos secos', precio: 4800, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mango%20Lonja%20Deshidratado.png' },
  { nombre: 'MANGO LONJAS', categoria: 'Frutos secos', precio: 9200, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mango%20Lonja%20Deshidratado.png' },
  
  { nombre: 'MANI JAPONES PETTIZ CIBOULETTE - PEREJIL', categoria: 'Maní y mix salados', precio: 1800, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20Japon%C3%A9s%20Perejil%20Ciboulette.png' },
  { nombre: 'MANI JAPONES PETTIZ CIBOULETTE - PEREJIL', categoria: 'Maní y mix salados', precio: 3300, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20Japon%C3%A9s%20Perejil%20Ciboulette.png' },
  { nombre: 'MANI JAPONES PETTIZ CIBOULETTE - PEREJIL', categoria: 'Maní y mix salados', precio: 6300, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20Japon%C3%A9s%20Perejil%20Ciboulette.png' },
  
  { nombre: 'MIX PREMIUM CON SAL (MANÍ SALADO - ALMENDRAS - CASTAÑAS DE CAJÚ Y PISTACHOS )', categoria: 'Maní y mix salados', precio: 3000, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mani%20Tostado%20Salado.png' },
  { nombre: 'MIX PREMIUM CON SAL (MANÍ SALADO - ALMENDRAS - CASTAÑAS DE CAJÚ Y PISTACHOS )', categoria: 'Maní y mix salados', precio: 5900, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mani%20Tostado%20Salado.png' },
  { nombre: 'MIX PREMIUM CON SAL (MANÍ SALADO - ALMENDRAS - CASTAÑAS DE CAJÚ Y PISTACHOS )', categoria: 'Maní y mix salados', precio: 11500, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mani%20Tostado%20Salado.png' },
  
  { nombre: 'MANI JAPONES PETTIZ MIX SABORES', categoria: 'Maní y mix salados', precio: 1800, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20Japon%C3%A9s%20Mix.png' },
  { nombre: 'MANI JAPONES PETTIZ MIX SABORES', categoria: 'Maní y mix salados', precio: 3300, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20Japon%C3%A9s%20Mix.png' },
  { nombre: 'MANI JAPONES PETTIZ MIX SABORES', categoria: 'Maní y mix salados', precio: 6300, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Man%C3%AD%20Japon%C3%A9s%20Mix.png' },
  
  { nombre: 'MIX ACONCAGUA ( MANÍ- COCO CHIPS- ALMENDRAS ZAPALLO - CRANBERRY )', categoria: 'Mix frutos secos natural', precio: 2000, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Aconcagua.png' },
  { nombre: 'MIX ACONCAGUA ( MANÍ- COCO CHIPS- ALMENDRAS ZAPALLO - CRANBERRY )', categoria: 'Mix frutos secos natural', precio: 3900, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Aconcagua.png' },
  { nombre: 'MIX ACONCAGUA ( MANÍ- COCO CHIPS- ALMENDRAS ZAPALLO - CRANBERRY )', categoria: 'Mix frutos secos natural', precio: 7500, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Aconcagua.png' },
  
  { nombre: 'POMELO VERDE', categoria: 'Frutos secos', precio: 2500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/POMELO%20VERDE.png' },
  { nombre: 'POMELO VERDE', categoria: 'Frutos secos', precio: 4800, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/POMELO%20VERDE.png' },
  { nombre: 'POMELO VERDE', categoria: 'Frutos secos', precio: 9200, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/POMELO%20VERDE.png' },
  
  { nombre: 'PIÑA CUBOS', categoria: 'Frutos secos', precio: 2500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Pi%C3%B1a%20Cubo%20con%20Az%C3%BAcar.png' },
  { nombre: 'PIÑA CUBOS', categoria: 'Frutos secos', precio: 4700, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Pi%C3%B1a%20Cubo%20con%20Az%C3%BAcar.png' },
  { nombre: 'PIÑA CUBOS', categoria: 'Frutos secos', precio: 8900, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Pi%C3%B1a%20Cubo%20con%20Az%C3%BAcar.png' },
  
  { nombre: 'COCO CUBOS CON AZUCAR', categoria: 'Frutos secos', precio: 3500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Coco%20Cubo%20Con%20Az%C3%BAcar.png' },
  { nombre: 'COCO CUBOS CON AZUCAR', categoria: 'Frutos secos', precio: 6500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Coco%20Cubo%20Con%20Az%C3%BAcar.png' },
  { nombre: 'COCO CUBOS CON AZUCAR', categoria: 'Frutos secos', precio: 12500, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Coco%20Cubo%20Con%20Az%C3%BAcar.png' },
  
  { nombre: 'MIX ANTIOXIDANTE ( MANI - GOJI - CRANBERRY ZAPALLO - MARAVILLA - ALMENDRAS )', categoria: 'Mix Frutos Secos Natural', precio: 2200, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Antioxidante.png' },
  { nombre: 'MIX ANTIOXIDANTE ( MANI - GOJI - CRANBERRY ZAPALLO - MARAVILLA - ALMENDRAS )', categoria: 'Mix Frutos Secos Natural', precio: 4000, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Antioxidante.png' },
  { nombre: 'MIX ANTIOXIDANTE ( MANI - GOJI - CRANBERRY ZAPALLO - MARAVILLA - ALMENDRAS )', categoria: 'Mix Frutos Secos Natural', precio: 7800, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Antioxidante.png' },
  
  { nombre: 'MIX TROPICAL', categoria: 'Mix Frutos Secos Natural', precio: 3300, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20tropical%201%20kilo.png' },
  { nombre: 'MIX TROPICAL', categoria: 'Mix Frutos Secos Natural', precio: 6500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20tropical%201%20kilo.png' },
  { nombre: 'MIX TROPICAL', categoria: 'Mix Frutos Secos Natural', precio: 2000, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20tropical%201%20kilo.png' },
  
  { nombre: 'MIX FRUTOS SECOS', categoria: 'Mix Frutos Secos Natural', precio: 3700, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Frutos%20Secos%20Natural.png' },
  { nombre: 'MIX FRUTOS SECOS', categoria: 'Mix Frutos Secos Natural', precio: 7200, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Frutos%20Secos%20Natural.png' },
  { nombre: 'MIX FRUTOS SECOS', categoria: 'Mix Frutos Secos Natural', precio: 2000, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Frutos%20Secos%20Natural.png' },
  
  { nombre: 'MIX FRUTOS SECOS CON SAL', categoria: 'Mix Frutos Secos Natural', precio: 7200, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Frutos%20Secos%20Natural.png' },
  { nombre: 'MIX FRUTOS SECOS CON SAL', categoria: 'Mix Frutos Secos Natural', precio: 3700, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Frutos%20Secos%20Natural.png' },
  { nombre: 'MIX FRUTOS SECOS CON SAL', categoria: 'Mix Frutos Secos Natural', precio: 2000, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Mix%20Frutos%20Secos%20Natural.png' },
  
  { nombre: 'CHIPS CHOCOLATE 56% CACAO SIN AZÚCAR', categoria: 'Chocolates y bañados en chocolate', precio: 3000, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056_%20Cacao%20SIN%20AZ%C3%9ACAR.png' },
  { nombre: 'CHIPS CHOCOLATE 56% CACAO SIN AZÚCAR', categoria: 'Chocolates y bañados en chocolate', precio: 7300, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056_%20Cacao%20SIN%20AZ%C3%9ACAR.png' },
  { nombre: 'CHIPS CHOCOLATE 56% CACAO SIN AZÚCAR', categoria: 'Chocolates y bañados en chocolate', precio: 14500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056_%20Cacao%20SIN%20AZ%C3%9ACAR.png' },
  { nombre: 'CHIPS CHOCOLATE 56% CACAO SIN AZÚCAR', categoria: 'Chocolates y bañados en chocolate', precio: 28500, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056_%20Cacao%20SIN%20AZ%C3%9ACAR.png' },
  
  { nombre: 'CHIPS CHOCOLATE 56 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 2700, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056%20_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 56 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 6500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056%20_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 56 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 12900, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056%20_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 56 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 25000, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2056%20_%20Cacao%20Chocono.png' },
  
  { nombre: 'CHIPS CHOCOLATE 63 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 2800, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2063_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 63 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 6900, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2063_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 63 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 13500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2063_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 63 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 26500, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20Chocolate%2063_%20Cacao%20Chocono.png' },
  
  { nombre: 'CHIPS CHOCOLATE 72 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 3000, unidad: '100gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20chocolate%2072_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 72 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 7300, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20chocolate%2072_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 72 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 14500, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20chocolate%2072_%20Cacao%20Chocono.png' },
  { nombre: 'CHIPS CHOCOLATE 72 % CACAO', categoria: 'Chocolates y bañados en chocolate', precio: 27900, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/Chips%20chocolate%2072_%20Cacao%20Chocono.png' },
  
  { nombre: 'DATILES SIN CAROZO', categoria: 'Frutos secos', precio: 1500, unidad: '250gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/D%C3%A1tiles%20Sin%20Carozo.png' },
  { nombre: 'DATILES SIN CAROZO', categoria: 'Frutos secos', precio: 2600, unidad: '500gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/D%C3%A1tiles%20Sin%20Carozo.png' },
  { nombre: 'DATILES SIN CAROZO', categoria: 'Frutos secos', precio: 4900, unidad: '1000gr', imagen: 'https://storage.googleapis.com/msm-imagenes-productos/D%C3%A1tiles%20Sin%20Carozo.png' },
]

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handlePopularProductos = async () => {
    if (!confirm(`¿Deseas crear ${PRODUCTOS_BULK.length} productos en masa? Esta operación puede tomar unos minutos.`)) {
      return
    }

    setLoading(true)
    setStatus('loading')
    setProgress(0)
    setMessage('Iniciando importación...')

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      if (!token) {
        throw new Error('No autenticado. Por favor inicia sesión.')
      }

      let successCount = 0
      let errorCount = 0

      for (let i = 0; i < PRODUCTOS_BULK.length; i++) {
        const producto = PRODUCTOS_BULK[i]

        try {
          const response = await fetch(`${API_BASE}/api/productos/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nombre: producto.nombre,
              categoria: producto.categoria,
              precio: producto.precio,
              unidad: producto.unidad,
              imagen: producto.imagen,
              stock: 0,
              estado: true,
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (e) {
          errorCount++
        }

        const progressPercent = Math.round(((i + 1) / PRODUCTOS_BULK.length) * 100)
        setProgress(progressPercent)
        setMessage(`Procesando: ${i + 1}/${PRODUCTOS_BULK.length} (${successCount} exitosos, ${errorCount} errores)`)
      }

      setStatus('success')
      setMessage(`✓ Importación completada: ${successCount} productos creados exitosamente. ${errorCount > 0 ? `${errorCount} errores.` : ''}`)
    } catch (error: any) {
      setStatus('error')
      setMessage(`✗ Error: ${error?.message || 'Error desconocido durante la importación'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5EDE4] to-[#FBF7F4] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-[#F5EDE4] shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#2E2A26] mb-2">Panel Administrativo</h1>
          <p className="text-[#7A6F66] mb-8">Herramientas de administración del sistema</p>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-[#D4A373] rounded-lg p-6 bg-[#FDFCF9]">
              <h2 className="text-xl font-semibold text-[#2E2A26] mb-2 flex items-center gap-2">
                <Loader className="w-5 h-5" />
                Importación Masiva de Productos
              </h2>
              <p className="text-sm text-[#7A6F66] mb-4">
                Crea automáticamente {PRODUCTOS_BULK.length} productos con todas sus variantes de presentación.
              </p>

              <div className="bg-[#FBF7F4] border border-[#F5EDE4] rounded-lg p-4 mb-4">
                <p className="text-xs text-[#7A6F66] mb-2">Resumen:</p>
                <ul className="text-xs text-[#7A6F66] space-y-1">
                  <li>✓ {PRODUCTOS_BULK.length} productos individuales</li>
                  <li>✓ Stock inicial: 0 (se debe agregar mediante lotes)</li>
                  <li>✓ Estado: Activo para todos</li>
                  <li>✓ Imágenes: Desde Google Storage</li>
                </ul>
              </div>

              {status !== 'idle' && (
                <div className={`mb-4 p-4 rounded-lg flex gap-3 ${
                  status === 'loading' ? 'bg-blue-50 border border-blue-200' :
                  status === 'success' ? 'bg-green-50 border border-green-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  {status === 'loading' && <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />}
                  {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                  {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <div className="text-sm">
                    <p className={
                      status === 'loading' ? 'text-blue-900' :
                      status === 'success' ? 'text-green-900' :
                      'text-red-900'
                    }>
                      {message}
                    </p>
                    {status === 'loading' && (
                      <div className="mt-2 bg-white rounded overflow-hidden h-2">
                        <div 
                          className="bg-blue-600 h-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handlePopularProductos}
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#A0522D] hover:bg-[#8B5E3C] text-white'
                }`}
              >
                {loading ? 'Importando...' : `Importar ${PRODUCTOS_BULK.length} Productos`}
              </button>
            </div>

            {/* Info adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900">
                <strong>Nota:</strong> Esta operación creará todos los productos con stock 0. Después de la importación, debes agregar lotes para que tengan stock disponible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
