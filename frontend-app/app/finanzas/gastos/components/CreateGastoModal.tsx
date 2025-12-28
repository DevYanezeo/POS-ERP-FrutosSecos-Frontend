
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface CreateGastoModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (gasto: any) => void
}

export default function CreateGastoModal({ isOpen, onClose, onSuccess }: CreateGastoModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: '',
        tipo: 'OPERACIONAL',
        fecha: new Date().toISOString().split('T')[0]
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const { crearGasto } = await import('@/lib/gastos')

            const nuevoGasto = {
                descripcion: formData.descripcion,
                monto: parseInt(formData.monto),
                tipo: formData.tipo as any,
                fecha: formData.fecha
            }

            const result = await crearGasto(nuevoGasto)
            onSuccess(result)
            onClose()
            // Reset form
            setFormData({
                descripcion: '',
                monto: '',
                tipo: 'OPERACIONAL',
                fecha: new Date().toISOString().split('T')[0]
            })
        } catch (error) {
            console.error('Error creando gasto', error)
            alert('Error al guardar el gasto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Input
                            id="descripcion"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Ej: Factura de Luz"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="monto">Monto</Label>
                        <Input
                            id="monto"
                            type="number"
                            value={formData.monto}
                            onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                            placeholder="0"
                            min="1"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tipo">Tipo de Gasto</Label>
                        <Select
                            value={formData.tipo}
                            onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="OPERACIONAL">Operacional</SelectItem>
                                <SelectItem value="ADQUISICION">Adquisición</SelectItem>
                                <SelectItem value="OTROS">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                            id="fecha"
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Gasto
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
