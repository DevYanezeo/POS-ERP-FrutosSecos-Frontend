"use client"

import React, { useEffect, useState } from "react"
import InventoryConfigCard from "./components/InventoryConfigCard"
import UsersPermissionsCard from "./components/UsersPermissionsCard"
import { getUsuarios } from "@/lib/usuario"
import { getStockMinimo, getAlertasStock } from "@/lib/config"

export default function ConfigurationPage() {
  const [empresa, setEmpresa] = useState({
    nombre: "FRUTOS SECOS MIL SABORES",
    rut: "12.345.678-9",
    direccion: "Av. Principal 1234, Santiago",
    telefono: "+56 9 1234 5678",
  })

  const [inventario, setInventario] = useState({
    stockMinimo: 5,
    alertasStock: "Activadas",
    modoPrecio: "Manual",
  })

  const [ventas, setVentas] = useState({
    iva: 19,
    moneda: "CLP - Pesos Chilenos",
  })

  const [usuarios, setUsuarios] = useState<{ id: number; nombre: string; rol: string }[]>([])

  useEffect(() => {
    (async () => {
      try {
        const res = await getUsuarios()
        const normalized = (res || []).map((u: any) => ({ id: u.idUsuario ?? u.id ?? u._id, nombre: u.nombre, rol: u.rol }))
        setUsuarios(normalized)
      } catch (e) {
        console.debug('Error cargando usuarios', e)
      }
    })()
    // Inicializar valores desde config global
    try {
      setInventario(prev => ({
        ...prev,
        stockMinimo: getStockMinimo(),
        alertasStock: getAlertasStock(),
      }))
    } catch {}
  }, [])

  return (
    <main className="min-h-screen bg-[#F9F6F2] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#2E2A26]">Configuración del Sistema</h1>
          <button className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">
            Nueva Venta
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <InventoryConfigCard inventario={inventario} onChange={setInventario} />
          <UsersPermissionsCard usuarios={usuarios} />
          
        </div>
      </div>
    </main>
  )
}
          