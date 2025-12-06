"use client"

import React, { useEffect, useMemo, useState } from "react"
import { updateUsuario, deleteUsuario, getUsuarioById } from "@/lib/usuario"
import { register } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Edit2, Trash2, Plus, EditIcon } from "lucide-react"
import RegisterForm from "@/components/RegisterForm"

type Usuario = { id: number; nombre: string; rol: string; email?: string; telefono?: string; rut?: string; activo?: boolean }

export default function UsersPermissionsCard({ usuarios }: { usuarios: Usuario[] }) {
  const [items, setItems] = useState<Usuario[]>(usuarios || [])
  const [editingId, setEditingId] = useState<number | null>(null)
  const editingUser = useMemo(() => items.find(u => u.id === editingId) || null, [items, editingId])
  const [openEdit, setOpenEdit] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const { toast } = useToast()

  const [editNombre, setEditNombre] = useState('')
  const [editApellidos, setEditApellidos] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editTelefono, setEditTelefono] = useState('')
  const [editRut, setEditRut] = useState('')
  const [editRol, setEditRol] = useState<'ADMIN' | 'CAJERO' | string>('CAJERO')
  const [editActivo, setEditActivo] = useState<boolean>(true)

  const [adding, setAdding] = useState({
    nombre: '', apellidos: '', email: '', password: '', rol: 'CAJERO' as 'ADMIN' | 'CAJERO', rut: '', telefono: ''
  })
  const [busy, setBusy] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)

  // Sync local items when `usuarios` prop changes (e.g., after fetch in page.tsx)
  useEffect(() => {
    setItems(usuarios || [])
  }, [usuarios])

  // Al abrir el diálogo de edición, asegurar que los campos se inicialicen con el usuario actual
  useEffect(() => {
    if (openEdit && editingUser) {
      const full = editingUser.nombre || ''
      const parts = full.trim().split(/\s+/)
      setEditNombre(parts[0] || '')
      setEditApellidos(parts.slice(1).join(' ') || '')
      setEditEmail(editingUser.email || '')
      setEditTelefono(editingUser.telefono || '')
      setEditRut(editingUser.rut || '')
      setEditRol((editingUser.rol as any) || 'CAJERO')
      setEditActivo(editingUser.activo !== false)
    }
  }, [openEdit, editingUser])

  async function startEdit(u: Usuario) {
    setEditingId(u.id)
    // abrir mientras cargamos datos frescos del backend
    setOpenEdit(true)
    setLoadingEdit(true)
    try {
      const fresh = await getUsuarioById(u.id)
      const user = fresh || u
      const full = user.nombre || ''
      const parts = full.trim().split(/\s+/)
      setEditNombre(parts[0] || '')
      setEditApellidos(parts.slice(1).join(' ') || '')
      setEditEmail(user.email || '')
      setEditTelefono(user.telefono || '')
      setEditRut(user.rut || '')
      setEditRol((user.rol as any) || 'CAJERO')
      setEditActivo(user.activo !== false)
    } catch (e) {
      console.debug('getUsuarioById error', e)
      // fallback a datos locales si hay error
      const fullLocal = u.nombre || ''
      const partsLocal = fullLocal.trim().split(/\s+/)
      setEditNombre(partsLocal[0] || '')
      setEditApellidos(partsLocal.slice(1).join(' ') || '')
      setEditEmail(u.email || '')
      setEditTelefono(u.telefono || '')
      setEditRut(u.rut || '')
      setEditRol((u.rol as any) || 'CAJERO')
      setEditActivo(u.activo !== false)
      try { toast({ title: 'No se pudo cargar usuario', description: 'Se muestran datos locales', variant: 'destructive' }) } catch {}
    } finally {
      setLoadingEdit(false)
    }
  }

  async function saveEdit() {
    if (editingId == null) return
    setBusy(true)
    try {
      const nombreCompleto = [editNombre, editApellidos].filter(Boolean).join(' ').trim()
      const payload: Partial<Usuario> = {
        nombre: nombreCompleto,
        email: editEmail,
        telefono: editTelefono,
        rut: editRut,
        rol: editRol,
        activo: editActivo,
      }
      const updated = await updateUsuario(editingId, payload)
      setItems(prev => prev.map(u => u.id === editingId ? { ...u, ...payload } : u))
      setEditingId(null)
      setOpenEdit(false)
      try { toast({ title: 'Usuario actualizado', description: 'Los cambios se guardaron correctamente.' }) } catch {}
    } catch (e) {
      console.debug('updateUsuario error', e)
      try { toast({ title: 'Error al actualizar usuario', variant: 'destructive' }) } catch {}
    } finally {
      setBusy(false)
    }
  }

  async function removeUserConfirmed(id: number) {
    setBusy(true)
    try {
      await deleteUsuario(id)
      setItems(prev => prev.filter(u => u.id !== id))
      try { toast({ title: 'Usuario eliminado', description: 'El usuario fue borrado correctamente.' }) } catch {}
    } catch (e) {
      console.debug('deleteUsuario error', e)
      try { toast({ title: 'Error al eliminar usuario', variant: 'destructive' }) } catch {}
    } finally {
      setBusy(false)
    }
  }

  async function addUser() {
    if (!adding.nombre || !adding.email || !adding.password) {
      alert('Nombre, email y contraseña son obligatorios')
      return
    }
    setBusy(true)
    try {
      const nombreCompleto = [adding.nombre, adding.apellidos].filter(Boolean).join(' ').trim()
      const res = await register({ ...adding, nombre: nombreCompleto })
      const newUser: Usuario = {
        id: res.idUsuario,
        nombre: res.nombre,
        rol: res.rol,
        email: res.email,
      }
      setItems(prev => [...prev, newUser])
      setAdding({ nombre: '', apellidos: '', email: '', password: '', rol: 'CAJERO', rut: '', telefono: '' })
      setOpenAdd(false)
      try { toast({ title: 'Usuario agregado', description: 'El usuario fue creado exitosamente.' }) } catch {}
    } catch (e) {
      console.debug('register error', e)
      try { toast({ title: 'Error al agregar usuario', variant: 'destructive' }) } catch {}
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="col-span-5 bg-white rounded-2xl border border-[#E8E1D9] shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">👤</span>
        <h2 className="text-xl font-semibold text-[#2E2A26]">Usuarios y Permisos</h2>
      </div>
      <div className="space-y-3">
        {items.map(u => (
          <div key={u.id} className="bg-[#FBFAF7] border-2 border-[#E8E1D9] rounded-xl px-4 py-3">
            {
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#2E2A26]">{u.nombre}</p>
                  <p className="text-sm text-[#6A5F55]">{u.rol}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2" onClick={() => startEdit(u)}>
                    <span>Editar</span>
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2">
                        
                        <span>Borrar</span>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Está seguro que desea eliminar al usuario "{u.nombre}"? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeUserConfirmed(u.id)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            }
          </div>
        ))}

        {/* Botón para abrir diálogo Agregar Usuario */}
        <button className="w-full mt-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2" onClick={()=>setOpenAdd(true)}>
          <Plus className="w-5 h-5" />
          <span>Agregar Usuario</span>
        </button>

        {/* Diálogo Editar Usuario (estilo inventario) */}
        <Dialog open={openEdit} onOpenChange={(o)=>{ setOpenEdit(o); if(!o) setEditingId(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-1">
              <DialogTitle className="text-base">Editar Usuario</DialogTitle>
              <DialogDescription className="text-xs">{editingUser?.nombre || 'Usuario'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {loadingEdit && (
                <div className="text-xs text-[#7A6F66]">Cargando usuario...</div>
              )}
              <div>
                <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Nombre</label>
                <input value={editNombre} onChange={(e)=>setEditNombre(e.target.value)} placeholder="Nombre" className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
              </div>
              <div>
                <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Apellidos</label>
                <input value={editApellidos} onChange={(e)=>setEditApellidos(e.target.value)} placeholder="Apellidos" className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
              </div>
              <div>
                <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Email</label>
                <input value={editEmail} onChange={(e)=>setEditEmail(e.target.value)} placeholder="Sin email" className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Teléfono</label>
                  <input value={editTelefono} onChange={(e)=>setEditTelefono(e.target.value)} placeholder="Sin teléfono" className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
                </div>
                <div>
                  <label className="text-xs text-[#7A6F66] mb-1 block font-medium">RUT</label>
                  <input value={editRut} onChange={(e)=>setEditRut(e.target.value)} placeholder="Sin RUT" className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Rol</label>
                  <select value={editRol} onChange={(e)=>setEditRol(e.target.value as any)} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]">
                    <option value="ADMIN">ADMIN</option>
                    <option value="CAJERO">CAJERO</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Estado</label>
                  <select
                    value={editActivo ? 'activo' : 'inactivo'}
                    onChange={(e)=>setEditActivo(e.target.value === 'activo')}
                    className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
                  >
                    <option value="activo">✓ Activo</option>
                    <option value="inactivo">✕ Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4 pt-3 border-t gap-2">
              <DialogClose className="px-3 py-1.5 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66] text-sm font-medium">
                Cancelar
              </DialogClose>
              <button disabled={busy} onClick={saveEdit} className="px-4 py-1.5 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded text-sm font-medium disabled:opacity-50 transition-colors">
                Guardar Cambios
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo Agregar Usuario (estilo inventario) */}
        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-1">
              <DialogTitle className="text-base">Agregar Usuario</DialogTitle>
              <DialogDescription className="text-xs">Crear un nuevo usuario</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Nombre" value={adding.nombre} onChange={(e)=>setAdding(p=>({...p,nombre:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
                <input placeholder="Apellidos" value={adding.apellidos} onChange={(e)=>setAdding(p=>({...p,apellidos:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Email" value={adding.email} onChange={(e)=>setAdding(p=>({...p,email:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
                <input placeholder="Contraseña" type="password" value={adding.password} onChange={(e)=>setAdding(p=>({...p,password:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Contraseña" type="password" value={adding.password} onChange={(e)=>setAdding(p=>({...p,password:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
                <select value={adding.rol} onChange={(e)=>setAdding(p=>({...p,rol:e.target.value as any}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]">
                  <option value="ADMIN">ADMIN</option>
                  <option value="CAJERO">CAJERO</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="RUT" value={adding.rut} onChange={(e)=>setAdding(p=>({...p,rut:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
                <input placeholder="Teléfono" value={adding.telefono} onChange={(e)=>setAdding(p=>({...p,telefono:e.target.value}))} className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" />
              </div>
            </div>
            <DialogFooter className="mt-4 pt-3 border-t gap-2">
              <DialogClose className="px-3 py-1.5 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66] text-sm font-medium">
                Cancelar
              </DialogClose>
              <button disabled={busy} onClick={addUser} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors">
                Crear Usuario
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
