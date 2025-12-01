"use client"

import React from 'react'

export default function ScanLoteInput({ scanCode, setScanCode, onSearch }: Readonly<{ scanCode: string; setScanCode: (s:string)=>void; onSearch: ()=>void }>) {
  return (
    <div className="flex items-center gap-2">
      <input value={scanCode} onChange={e => setScanCode(e.target.value)} placeholder="Escanear lote (código)" className="px-3 py-1 border rounded" />
      <button onClick={onSearch} className="px-3 py-1 rounded bg-yellow-500 text-white">Buscar</button>
    </div>
  )
}
