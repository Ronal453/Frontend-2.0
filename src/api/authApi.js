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

/**
 * Solicitar enlace temporal de recuperación de contraseña (HU2)
 * POST /api/auth/recuperar-password
 * @param {string} email
 */
export const solicitarRecuperacionPassword = (email) =>
  api.post('/auth/recuperar-password', { email })

/**
 * Restablecer contraseña utilizando un token temporal (HU2)
 * POST /api/auth/resetear-password
 * @param {string} token
 * @param {string} nuevaPassword
 */
export const resetearPassword = (token, nuevaPassword) =>
  api.post('/auth/resetear-password', { token, nuevaPassword })

