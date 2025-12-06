"use client"

import React from "react"

type Empresa = {
  nombre: string
  rut: string
  direccion: string
  telefono: string
}

export default function CompanyInfoCard({ empresa, onChange }: { empresa: Empresa; onChange: (next: Empresa) => void }) {
  return (
    <section className="col-span-7 bg-white rounded-2xl border border-[#E8E1D9] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚙️</span>
        <h2 className="text-xl font-semibold text-[#2E2A26]">Información de la Empresa</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">Nombre de la Empresa</label>
          <input
            value={empresa.nombre}
            onChange={(e) => onChange({ ...empresa, nombre: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">RUT</label>
          <input
            value={empresa.rut}
            onChange={(e) => onChange({ ...empresa, rut: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">Dirección</label>
          <input
            value={empresa.direccion}
            onChange={(e) => onChange({ ...empresa, direccion: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#6A5F55] mb-1">Teléfono</label>
          <input
            value={empresa.telefono}
            onChange={(e) => onChange({ ...empresa, telefono: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E1D9] bg-[#FBFAF7]"
          />
        </div>
      </div>
    </section>
  )
}
