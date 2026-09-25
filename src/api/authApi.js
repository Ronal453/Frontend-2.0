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

/**
 * Autenticarse / Registrarse con Google ID Token
 * POST /api/auth/google?modo=login|registro
 * @returns { token, email, rol, mensaje }
 */
export const loginGoogle = (idToken, modo = 'login') =>
  api.post('/auth/google', { idToken }, { params: { modo } })
