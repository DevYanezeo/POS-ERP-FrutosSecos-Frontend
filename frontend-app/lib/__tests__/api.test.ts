import { login, register, API_BASE } from '../api'

describe('API utilities', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        token: 'mock-token-123',
        idUsuario: 1,
        email: 'test@example.com',
        nombre: 'Test User',
        rol: 'ADMIN',
      }

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      ) as jest.Mock

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/auth/login`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should throw error on invalid credentials', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
        })
      ) as jest.Mock

      await expect(
        login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toThrow('Credenciales inválidas, intentelo nuevamente')
    })

    it('should handle network errors', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      ) as jest.Mock

      await expect(
        login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Network error')
    })
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        token: 'mock-token-456',
        idUsuario: 2,
        email: 'newuser@example.com',
        nombre: 'New User',
        rol: 'CAJERO',
      }

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      ) as jest.Mock

      const result = await register({
        nombre: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        rol: 'CAJERO',
        rut: '12345678-9',
        telefono: '+56912345678',
      })

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/auth/register`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('should throw error on registration failure', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          text: () => Promise.resolve('Email already exists'),
        })
      ) as jest.Mock

      await expect(
        register({
          nombre: 'Duplicate User',
          email: 'existing@example.com',
          password: 'password123',
          rol: 'CAJERO',
          rut: '12345678-9',
          telefono: '+56912345678',
        })
      ).rejects.toThrow('Email already exists')
    })
  })
})
