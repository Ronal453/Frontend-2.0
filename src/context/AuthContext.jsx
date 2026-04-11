import { createContext, useState, useEffect } from 'react'
import {
  guardarToken,
  guardarUsuario,
  obtenerToken,
  obtenerUsuario,
  eliminarToken,
  haySession
} from '../utils/jwt'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(null)
  const [cargando, setCargando] = useState(true)

  // Al montar, recuperar sesión del localStorage si existe y no expiró
  useEffect(() => {
    if (haySession()) {
      setToken(obtenerToken())
      setUser(obtenerUsuario())
    }
    setCargando(false)
  }, [])

  /**
   * Guardar sesión tras login exitoso
   * @param {string} tokenValue  - JWT recibido del backend
   * @param {object} userData    - { email, rol }
   */
  const login = (tokenValue, userData) => {
    guardarToken(tokenValue)
    guardarUsuario(userData)
    setToken(tokenValue)
    setUser(userData)
  }

  /**
   * Cerrar sesión y limpiar localStorage
   */
  const logout = () => {
    eliminarToken()
    setToken(null)
    setUser(null)
  }

  // Mientras verifica la sesión guardada, no renderiza nada
  if (cargando) return null

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuth: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
