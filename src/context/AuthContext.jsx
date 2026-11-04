import { createContext, useState, useEffect } from 'react'
import api from '../api/axios'
import {
  guardarUsuario,
  obtenerUsuario,
  eliminarUsuario,
  haySession
} from '../utils/jwt'

export const AuthContext = createContext(null)

/**
 * Proveedor global de estado de autenticación para la plataforma Plantopolis.
 * Sincroniza la sesión almacenada en `localStorage` y gestiona el inicio y cierre de sesión.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos envueltos por el proveedor.
 * @returns {JSX.Element|null}
 */
export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al montar, recuperar sesión del localStorage si existe
  useEffect(() => {
    if (haySession()) {
      setUser(obtenerUsuario())
    }
    setCargando(false)
  }, [])

  /**
   * Guardar sesión tras login exitoso
   * @param {string} tokenValue  - (Ignorado, ya no se usa)
   * @param {object} userData    - { email, rol }
   */
  const login = (tokenValue, userData) => {
    guardarUsuario(userData)
    setUser(userData)
  }

  /**
   * Cerrar sesión, limpiar `localStorage` y purgar la caché `api-cache` del navegador.
   *
   * @param {Object} [options={ redirect: true }] - Opciones de redirección tras cerrar sesión.
   * @param {boolean} [options.redirect=true] - Si es `false`, omite `window.location.href = '/login'` para preservar la navegación SPA de React Router.
   * @returns {Promise<void>}
   */
  const logout = async (options = { redirect: true }) => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.error('Error al hacer logout en el servidor', e)
    } finally {
      eliminarUsuario()
      setUser(null)
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.delete('api-cache').catch(() => {})
      }
      if (options?.redirect !== false) {
        window.location.href = '/login'
      }
    }
  }

  // Mientras verifica la sesión guardada, no renderiza nada
  if (cargando) return null

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuth: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

