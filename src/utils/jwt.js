/**
 * Utilidades para manejo de sesión en el frontend
 * 
 * Ahora usamos Cookies HttpOnly, por lo que el token ya no
 * se guarda en localStorage. Solo guardamos los datos del usuario.
 */

const USER_KEY  = 'user'

// ── Guardar y leer datos del usuario ─────────────────────

export const guardarUsuario = (usuario) => {
  if (usuario) {
    localStorage.setItem(USER_KEY, JSON.stringify(usuario))
  }
}

export const obtenerUsuario = () => {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}

export const eliminarUsuario = () => {
  localStorage.removeItem(USER_KEY)
}

// ── Verificar si hay sesión activa válida ────────────────

export const haySession = () => {
  // Ahora la sesión se determina por la existencia del usuario en localStorage
  // La expiración real la maneja el backend con la cookie.
  // Si la cookie expira, el backend devolverá 401 y el interceptor
  // de Axios limpiará el localStorage.
  return !!obtenerUsuario()
}