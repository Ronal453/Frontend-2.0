/**
 * Componente Button reutilizable
 *
 * Variantes disponibles:
 *   primary   → verde oscuro (acción principal)
 *   secondary → borde verde (acción secundaria)
 *   danger    → rojo (eliminar, cancelar)
 *   ghost     → transparente (acción sutil)
 *
 * Tamaños:
 *   sm → pequeño
 *   md → mediano (por defecto)
 *   lg → grande
 *
 * Uso:
 *   <Button onClick={fn}>Texto</Button>
 *   <Button variant="danger" size="sm">Eliminar</Button>
 *   <Button loading>Guardando...</Button>
 *   <Button fullWidth>Pantalla completa</Button>
 */

const VARIANTS = {
  primary:   'bg-green-700 text-white hover:bg-green-800 disabled:bg-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:disabled:bg-green-900',
  secondary: 'border-2 border-green-700 text-green-700 hover:bg-green-50 disabled:opacity-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/30',
  danger:    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 dark:bg-red-700 dark:hover:bg-red-800 dark:disabled:bg-red-950',
  ghost:     'text-green-700 hover:bg-green-50 disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-900/30',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  fullWidth = false,
  disabled = false,
  type     = 'button',
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-lg transition-colors
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}