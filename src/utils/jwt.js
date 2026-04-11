/**
 * Utilidades para manejo del token JWT en el frontend
 *
 * El token se guarda en localStorage con la clave 'token'
 * El payload del JWT contiene: sub (email), rol, iat, exp
 */

const TOKEN_KEY = 'token'
const USER_KEY  = 'user'

// ── Guardar y leer token ──────────────────────────────────

export const guardarToken = (token) =>
  localStorage.setItem(TOKEN_KEY, token)

export const obtenerToken = () =>
  localStorage.getItem(TOKEN_KEY)

export const eliminarToken = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ── Guardar y leer datos del usuario ─────────────────────

export const guardarUsuario = (usuario) =>
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))

export const obtenerUsuario = () => {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}

// ── Decodificar el payload del JWT ───────────────────────
// No valida la firma (eso lo hace el backend)
// Solo lee los datos del payload para uso en el frontend

export const decodificarToken = (token) => {
  try {
    // El JWT tiene 3 partes separadas por puntos: header.payload.signature
    // El payload está en base64 en la segunda parte
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// ── Verificar si el token está expirado ──────────────────

export const estaExpirado = (token) => {
  const payload = decodificarToken(token)
  if (!payload?.exp) return true
  // exp está en segundos, Date.now() en milisegundos
  return Date.now() >= payload.exp * 1000
}

// ── Verificar si hay sesión activa válida ────────────────

export const haySession = () => {
  const token = obtenerToken()
  if (!token) return false
  if (estaExpirado(token)) {
    eliminarToken() // Limpiar token expirado automáticamente
    return false
  }
  return true
}