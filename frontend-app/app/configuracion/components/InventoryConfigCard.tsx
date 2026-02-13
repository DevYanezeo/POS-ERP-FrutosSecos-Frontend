"use client"

import React from "react"
import { setStockMinimo, setAlertasStock } from "@/lib/config"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import ManageCategoriesDialog from "./ManageCategoriesDialog"

type Inventario = {
  stockMinimo: number
  alertasStock: string
  modoPrecio: string
}

export default function InventoryConfigCard({ inventario, onChange }: { inventario: Inventario; onChange: (next: Inventario) => void }) {
  const { toast } = useToast()
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false)
  return (
    <section className="col-span-12 lg:col-span-6 bg-white rounded-2xl border border-[#E8E1D9] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📦</span>
        <h2 className="text-xl font-semibold text-[#2E2A26]">Configuración de Inventario</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">Stock Mínimo por Defecto</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inventario.stockMinimo}
            onChange={(e) => {
              const inputValue = e.target.value.replace(/\D/g, '') // Solo dígitos
              const val = inputValue === '' ? 0 : parseInt(inputValue, 10)
              onChange({ ...inventario, stockMinimo: val })
              setStockMinimo(val)
              try { toast({ title: 'Stock mínimo actualizado', description: `Nuevo umbral: ${val}`, variant: 'success' }) } catch { }
            }}
            onFocus={(e) => e.target.select()}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">Alertas de Stock Bajo</label>
          <select
            value={inventario.alertasStock}
            onChange={(e) => {
              const state = e.target.value as 'Activadas' | 'Desactivadas'
              onChange({ ...inventario, alertasStock: state })
              setAlertasStock(state)
            }}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          >
            <option>Activadas</option>
            <option>Desactivadas</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">Actualización Automática de Precio</label>
          <select
            value={inventario.modoPrecio}
            onChange={(e) => onChange({ ...inventario, modoPrecio: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          >
            <option>Manual</option>
            <option>Automática</option>
          </select>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="block text-sm font-medium text-[#6A5F55] mb-2">Categorías de Productos</label>
          <button
            onClick={() => setShowCategoriesDialog(true)}
            className="w-full px-4 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] text-[#A0522D] rounded-lg font-medium transition-colors border border-[#D4A373] border-dashed"
          >
            Gestionar Categorías
          </button>
        </div>
      </div>

      <ManageCategoriesDialog
        open={showCategoriesDialog}
        onOpenChange={setShowCategoriesDialog}
      />
    </section>
  )
}
