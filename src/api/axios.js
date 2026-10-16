import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Envía cookies automáticamente
})

// Intercepta respuestas 401 (No Autorizado / Sesión Expirada) para limpiar sesión local
api.interceptors.response.use(
  response => response,
  error => {
    // Solo el error 401 indica expiración de autenticación o token ausente.
    // El error 403 (Prohibido) indica falta de permisos para una acción específica y no debe cerrar la sesión.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api