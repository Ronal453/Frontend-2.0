import { createContext, useState, useEffect } from 'react'
import api from '../api/axios'
import {
  guardarUsuario,
  obtenerUsuario,
  eliminarUsuario,
  haySession
} from '../utils/jwt'

export const AuthContext = createContext(null)

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
   * Cerrar sesión y limpiar localStorage
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
      console.error('Error al hacer logout en el servidor', e)
    } finally {
      eliminarUsuario()
      setUser(null)
      window.location.href = '/login'
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
