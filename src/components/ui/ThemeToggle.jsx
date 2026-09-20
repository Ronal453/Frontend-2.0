import { useTheme } from '../../context/ThemeContext'

/**
 * Botón interactivo para alternar entre tema claro y tema oscuro.
 * Incluye iconos vectoriales SVG, microanimaciones y accesibilidad.
 *
 * Uso: <ThemeToggle />
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const esOscuro = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      aria-label={esOscuro ? 'Activar tema claro' : 'Activar tema oscuro'}
      className="relative p-2 rounded-full transition-all duration-300
                 bg-white/10 hover:bg-white/20 active:scale-95
                 dark:bg-gray-800 dark:hover:bg-gray-700
                 border border-white/20 dark:border-gray-700
                 shadow-sm hover:shadow focus:outline-none focus:ring-2
                 focus:ring-emerald-400 dark:focus:ring-emerald-500
                 flex items-center justify-center text-white"
    >
      {esOscuro ? (
        // Icono de Sol para regresar a modo claro
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-amber-300 transform transition-transform duration-300 rotate-0 hover:rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Icono de Luna para pasar a modo oscuro
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-emerald-100 hover:text-white transform transition-transform duration-300 -rotate-12 hover:rotate-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}