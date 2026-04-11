import api from './axios'

/**
 * Registrar un nuevo usuario
 * POST /api/auth/registro
 */
export const registro = (datos) =>
  api.post('/auth/registro', datos)

/**
 * Iniciar sesión
 * POST /api/auth/login
 * @returns { token, email, rol, mensaje }
 */
export const login = (credenciales) =>
  api.post('/auth/login', credenciales)
