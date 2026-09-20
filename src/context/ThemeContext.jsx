import { createContext, useContext, useEffect, useState } from 'react'

/**
 * Contexto global del tema (claro/oscuro).
 *
 * - Persiste la preferencia en localStorage bajo la clave 'theme'.
 * - Si no hay preferencia guardada, respeta el modo del sistema operativo.
 * - Aplica/quita la clase 'dark' en <html> para que Tailwind renderice
 *   las variantes dark:* en toda la app.
 *
 * Ruta destino: src/context/ThemeContext.jsx
 */
const ThemeContext = createContext(null)
const STORAGE_KEY = 'theme'

function obtenerThemeInicial() {
  const guardado = localStorage.getItem(STORAGE_KEY)
  if (guardado === 'light' || guardado === 'dark') return guardado

  const prefiereOscuro = window.matchMedia?.(
    '(prefers-color-scheme: dark)'
  ).matches
  return prefiereOscuro ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(obtenerThemeInicial)

  // Sincroniza la clase 'dark' en <html> y guarda la preferencia
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider')
  }
  return context
}