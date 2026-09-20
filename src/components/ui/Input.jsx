/**
 * Componente Input reutilizable
 *
 * Uso:
 *   <Input label="Email" type="email" value={val} onChange={fn} />
 *   <Input label="Contraseña" type="password" error="Campo requerido" />
 *   <Input label="Descripción" as="textarea" rows={4} />
 */

export default function Input({
  label,
  error,
  as: Tag = 'input',
  className = '',
  required = false,
  ...props
}) {
  const baseClasses = `
    w-full border rounded-lg px-3 py-2 text-sm text-gray-800
    placeholder-gray-400 transition-colors
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    dark:text-gray-100 dark:placeholder-gray-500
    dark:disabled:bg-gray-800 dark:focus:ring-green-500
    ${error
      ? 'border-red-400 bg-red-50 focus:ring-red-400 dark:border-red-500 dark:bg-red-950/40'
      : 'border-gray-300 bg-white hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
    }
    ${className}
  `

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Tag className={baseClasses} {...props} />

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}