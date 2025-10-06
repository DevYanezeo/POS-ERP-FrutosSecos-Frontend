"use client"

import { useState } from 'react'
import { register } from '../lib/api'
import { useRouter } from 'next/navigation'

export default function RegisterForm({ onCancel }: { onCancel: () => void }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('ADMIN')
  const [rut, setRut] = useState('')
  const [telefono, setTelefono] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password || !nombre) {
      setError('Completa nombre, email y contraseña')
      return
    }
    setLoading(true)
    try {
      const resp = await register({ nombre, email, password, rol, rut, telefono })
      localStorage.setItem('token', resp.token)
      localStorage.setItem('user_email', resp.email)
      localStorage.setItem('user_nombre', resp.nombre || '')
      localStorage.setItem('user_rol', resp.rol || '')
      localStorage.setItem('isAuthenticated', 'true')
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.message || 'Error al registrar'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto w-full">
      <h2 className="text-2xl font-semibold mb-4 text-center">Crear cuenta</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className="w-full px-4 py-2 border rounded" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full px-4 py-2 border rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" type="password" className="w-full px-4 py-2 border rounded" />
        <div>
          <label className="text-sm mb-1 block">Rol</label>
          <select value={rol} onChange={e => setRol(e.target.value)} className="w-full px-4 py-2 border rounded bg-white">
            <option value="ADMIN">ADMIN</option>
            <option value="CAJERO">CAJERO</option>
          </select>
        </div>

        <input value={rut} onChange={e => setRut(e.target.value)} placeholder="RUT" className="w-full px-4 py-2 border rounded" />
        <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" className="w-full px-4 py-2 border rounded" />

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="flex-1 bg-[#A0522D] text-white py-2 rounded">
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 border rounded py-2">
            Cancelar
          </button>
        </div>

        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  )
}
