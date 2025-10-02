export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  email: string
  nombre: string
  rol: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Credenciales inválidas, intentelo nuevamente')
  }

  return res.json()
}
