import { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    const t = localStorage.getItem('token')
    const u = localStorage.getItem('user')
    if (t && u) {
      setToken(t)
      setUser(JSON.parse(u))
    }
  }, [])

  const login = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}
