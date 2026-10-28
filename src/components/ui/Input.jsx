import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Componente Input reutilizable con soporte para etiquetas, estados de error,
 * textarea y botón integrado de mostrar/ocultar contraseña (Eye/EyeOff)
 * para optimizar la seguridad y la experiencia de usuario.
 *
 * @component
 * @param {Object} props Propiedades del componente
 * @param {string} [props.label] Etiqueta superior del campo
 * @param {string} [props.error] Mensaje de error de validación
 * @param {string|React.ElementType} [props.as='input'] Elemento HTML o componente a renderizar
 * @param {string} [props.className=''] Clases CSS adicionales
 * @param {boolean} [props.required=false] Indica si el campo es obligatorio
 * @param {string} [props.type='text'] Tipo de entrada HTML
 * @param {boolean} [props.showPasswordToggle=true] Habilita o deshabilita el botón de alternar visibilidad de contraseña
 * @returns {JSX.Element} Campo de formulario estilizado con soporte de accesibilidad
 */
export default function Input({
  label,
  error,
  as: Tag = 'input',
  className = '',
  required = false,
  type = 'text',
  showPasswordToggle = true,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const lang = useLanguage?.()
  const t = lang?.t || ((key, fallback) => fallback || key)

  const isPassword = Tag === 'input' && type === 'password' && showPasswordToggle
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

  const baseClasses = `
    w-full border rounded-lg px-3 py-2 text-sm text-gray-800
    placeholder-gray-400 transition-colors
    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    dark:text-gray-100 dark:placeholder-gray-500
    dark:disabled:bg-gray-800 dark:focus:ring-green-500
    ${isPassword ? 'pr-10' : ''}
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

      <div className="relative w-full">
        <Tag
          type={Tag === 'textarea' ? undefined : effectiveType}
          className={baseClasses}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword
                ? t('auth.hidePassword', 'Ocultar contraseña')
                : t('auth.showPassword', 'Mostrar contraseña')
            }
            title={
              showPassword
                ? t('auth.hidePassword', 'Ocultar contraseña')
                : t('auth.showPassword', 'Mostrar contraseña')
            }
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={18} className="shrink-0" />
            ) : (
              <Eye size={18} className="shrink-0" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}