/**
 * Utilidades para manejo de sesión y tokens JWT en el frontend.
 *
 * Ahora usamos Cookies HttpOnly para el transporte seguro del token,
 * y almacenamos en `localStorage` únicamente los metadatos no sensibles del usuario.
 */

const USER_KEY = 'user'

/**
 * Persiste los datos del usuario autenticado en `localStorage`.
 *
 * @param {Object} usuario - Datos del usuario (`{ email, rol }`).
 */
export const guardarUsuario = (usuario) => {
  if (usuario) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  }
}

/**
 * Obtiene los datos del usuario autenticado desde `localStorage`.
 * Envuelve `JSON.parse` en un bloque `try / catch` para evitar fallos críticos si el valor
 * almacenado fue alterado o está corrupto, limpiando la clave inválida automáticamente.
 *
 * @returns {Object|null} Objeto con los datos del usuario o `null` si no existe o es inválido.
 */
export const obtenerUsuario = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) {
      localStorage.removeItem(USER_KEY)
      return null
    }
    return parsed
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

/**
 * Elimina los datos del usuario almacenados en `localStorage`.
 */
export const eliminarUsuario = () => {
  localStorage.removeItem(USER_KEY)
}

/**
 * Verifica si existe una sesión de usuario activa y válida en el cliente.
 * La expiración real de la sesión la gobierna el backend mediante la cookie HttpOnly.
 *
 * @returns {boolean} `true` si existen datos válidos de usuario en `localStorage`.
 */
export const haySession = () => {
  return !!obtenerUsuario()
}

/**
 * Decodifica el payload (segunda sección en formato Base64Url) de un token JWT.
 *
 * @param {string} token - Token JWT con estructura `header.payload.signature`.
 * @returns {Object|null} Objeto JSON del payload decodificado o `null` si el token es inválido.
 */
export const decodificarToken = (token) => {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const jsonStr =
      typeof atob === 'function'
        ? decodeURIComponent(
            Array.from(atob(padded))
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          )
        : Buffer.from(padded, 'base64').toString('utf-8')
    return JSON.parse(jsonStr)
  } catch {
    return null
  }
}

/**
 * Determina si un token JWT ha expirado evaluando su claim estándar `exp` (segundos Unix).
 *
 * @param {string} token - Token JWT a verificar.
 * @returns {boolean} `true` si el token ha expirado o es inválido, `false` si aún es vigente.
 */
export const estaTokenExpirado = (token) => {
  const payload = decodificarToken(token)
  if (!payload || typeof payload.exp !== 'number') return true
  const ahoraSegundos = Math.floor(Date.now() / 1000)
  return payload.exp <= ahoraSegundos
}