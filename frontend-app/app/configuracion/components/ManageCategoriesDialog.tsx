"use client"

import { useState, useEffect } from "react"
import { getCategorias, createCategoria } from "@/lib/productos"
import { Plus, Trash2, Tag } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

export default function ManageCategoriesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [categorias, setCategorias] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [creating, setCreating] = useState(false)

    const fetchCategorias = async () => {
        setLoading(true)
        try {
            const data = await getCategorias()
            setCategorias(Array.isArray(data) ? data : [])
        } catch (e) {
            console.error('Error fetching categories:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchCategorias()
        }
    }, [open])

    const handleCreate = async () => {
        if (!newCategoryName.trim()) return

        setCreating(true)
        try {
            await createCategoria({ nombre: newCategoryName })
            setNewCategoryName("")
            toast({ title: 'Categoría creada', description: 'La categoría se ha creado correctamente.', variant: 'success' })
            fetchCategorias()
        } catch (e: any) {
            console.error(e)
            toast({ title: 'Error', description: 'No se pudo crear la categoría.', variant: 'destructive' })
        } finally {
            setCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5 text-[#A0522D]" />
                        Gestionar Categorías
                    </DialogTitle>
                    <DialogDescription>
                        Agrega o visualiza las categorías de productos disponibles.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2">
                    <div className="flex gap-2">
                        <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nueva categoría..."
                            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:border-[#A0522D]"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newCategoryName.trim()}
                            className="px-3 py-2 bg-[#A0522D] text-white rounded-md hover:bg-[#8B5E3C] disabled:opacity-50 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="border rounded-md max-h-60 overflow-y-auto bg-gray-50 p-2 space-y-2">
                        {loading ? (
                            <div className="text-center text-sm text-gray-500 py-4">Cargando...</div>
                        ) : categorias.length === 0 ? (
                            <div className="text-center text-sm text-gray-500 py-4">No hay categorías registradas.</div>
                        ) : (
                            categorias.map((cat, idx) => (
                                <div key={cat.idCategoria || idx} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border text-sm">
                                    <span className="font-medium text-gray-700">{cat.nombre || '-'}</span>
                                    {/* Future: Delete button could go here */}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 font-medium">
                        Cerrar
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
