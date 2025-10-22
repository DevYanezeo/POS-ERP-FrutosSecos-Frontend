"use client"

import React from 'react'
import { Plus, Minus, Trash2 } from 'lucide-react'

export default function Cart({ cart, changeCantidad, removeItem }: Readonly<{ cart: any[]; changeCantidad: (i:number,d:number)=>void; removeItem: (i:number)=>void }>) {
  return (
    <div className="flex-1 overflow-y-auto space-y-3">
      {cart.map((item, idx) => (
        <div key={`${item.productoId}-${item.idLote ?? 'nolote'}`} className="flex items-center justify-between p-3 border rounded-md">
          <div>
            <div className="font-semibold">{item.nombre}</div>
            <div className="text-sm text-muted-foreground">CLP ${item.precioUnitario?.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => changeCantidad(idx, -1)} className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"><Minus className="w-4 h-4" /></button>
            <div>{item.cantidad}</div>
            <button onClick={() => changeCantidad(idx, +1)} className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"><Plus className="w-4 h-4" /></button>
            <div className="font-semibold">CLP ${(item.precioUnitario * item.cantidad).toLocaleString()}</div>
            <button onClick={() => removeItem(idx)} className="ml-3 text-red-500"><Trash2 className="w-4 h-4"/></button>
          </div>
        </div>
      ))}
    </div>
  )
}
