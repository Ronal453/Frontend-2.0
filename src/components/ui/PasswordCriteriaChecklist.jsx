import { CheckCircle2, Circle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Componente interactivo de lista de verificación (checklist) para los criterios
 * de seguridad de contraseñas de Plantopolis.
 *
 * Evalúa dinámicamente en tiempo real:
 * - Mínimo 8 caracteres
 * - Al menos una letra mayúscula (A-Z)
 * - Al menos un dígito numérico (0-9)
 * - Al menos un carácter especial (@$!%*?&)
 * - Opcionalmente, coincidencia con confirmación de contraseña
 *
 * @component
 * @param {Object} props Propiedades del componente
 * @param {string} [props.password=''] Contraseña ingresada por el usuario
 * @param {string} [props.confirmPassword] Contraseña de confirmación opcional para validar coincidencia
 * @param {boolean} [props.showTitle=true] Si se debe renderizar el título superior
 * @param {string} [props.className=''] Clases CSS adicionales para el contenedor
 * @returns {JSX.Element} Panel interactivo con el estado de cada criterio
 */
export default function PasswordCriteriaChecklist({
  password = '',
  confirmPassword,
  showTitle = true,
  className = '',
}) {
  const { t } = useLanguage()

  // Validación de criterios individuales de la política
  const hasLength = password.length >= 8
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[@$!%*?&]/.test(password)

  // Cálculo de progreso (0 a 4)
  const cumplidos = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  const porcentaje = (cumplidos / 4) * 100

  // Coincidencia opcional si se provee confirmPassword
  const hasConfirm = typeof confirmPassword === 'string'
  const passwordsMatch = hasConfirm && password.length > 0 && password === confirmPassword

  return (
    <div
      className={`bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/60 
                 rounded-2xl p-3.5 space-y-2.5 text-xs transition-all ${className}`}
    >
      {showTitle && (
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {t('auth.passwordPolicyTitle', 'Requisitos de la contraseña:')}
          </p>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {cumplidos}/4
          </span>
        </div>
      )}

      {/* Barra de progreso de fortaleza */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            porcentaje === 100
              ? 'bg-green-500'
              : porcentaje >= 50
              ? 'bg-amber-500'
              : 'bg-red-400'
          }`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      {/* Lista de criterios interactivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
        {/* Criterio 1: Longitud mínima */}
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            hasLength ? 'text-green-600 dark:text-green-400 font-medium' : ''
          }`}
        >
          {hasLength ? (
            <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <Circle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
          )}
          <span>{t('auth.criteriaMinLength', 'Mínimo 8 caracteres')}</span>
        </div>

        {/* Criterio 2: Mayúscula */}
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            hasUpper ? 'text-green-600 dark:text-green-400 font-medium' : ''
          }`}
        >
          {hasUpper ? (
            <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <Circle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
          )}
          <span>{t('auth.criteriaUppercase', 'Al menos una mayúscula (A-Z)')}</span>
        </div>

        {/* Criterio 3: Número */}
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            hasNumber ? 'text-green-600 dark:text-green-400 font-medium' : ''
          }`}
        >
          {hasNumber ? (
            <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <Circle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
          )}
          <span>{t('auth.criteriaNumber', 'Al menos un número (0-9)')}</span>
        </div>

        {/* Criterio 4: Carácter especial */}
        <div
          className={`flex items-center gap-1.5 transition-colors ${
            hasSpecial ? 'text-green-600 dark:text-green-400 font-medium' : ''
          }`}
        >
          {hasSpecial ? (
            <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <Circle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
          )}
          <span>{t('auth.criteriaSpecial', 'Al menos un carácter especial (@$!%*?&)')}</span>
        </div>
      </div>

      {/* Validación opcional de coincidencia */}
      {hasConfirm && confirmPassword.length > 0 && (
        <div
          className={`pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center gap-1.5 transition-colors ${
            passwordsMatch
              ? 'text-green-600 dark:text-green-400 font-medium'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {passwordsMatch ? (
            <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0" />
          ) : (
            <Circle size={14} className="text-slate-300 dark:text-slate-600 shrink-0" />
          )}
          <span>
            {passwordsMatch
              ? t('auth.criteriaMatch', 'Las contraseñas coinciden')
              : t('auth.passwordsDoNotMatch', 'Las contraseñas no coinciden.')}
          </span>
        </div>
      )}
    </div>
  )
}
