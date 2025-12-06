"use client"

import React from "react"

type Ventas = {
  iva: number
  moneda: string
}

export default function SalesConfigCard({ ventas, onChange }: { ventas: Ventas; onChange: (next: Ventas) => void }) {
  return (
    <section className="col-span-7 bg-white rounded-2xl border border-[#E8E1D9] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🛒</span>
        <h2 className="text-xl font-semibold text-[#2E2A26]">Configuración de Ventas</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">IVA (%)</label>
          <input
            type="number"
            value={ventas.iva}
            onChange={(e) => onChange({ ...ventas, iva: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">Moneda</label>
          <select
            value={ventas.moneda}
            onChange={(e) => onChange({ ...ventas, moneda: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          >
            <option>CLP - Pesos Chilenos</option>
            <option>USD - Dólar Estadounidense</option>
          </select>
        </div>
      </div>
    </section>
  )
}
