import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetearPassword } from '../api/authApi'
import { useLanguage } from '../context/LanguageContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordCriteriaChecklist from '../components/ui/PasswordCriteriaChecklist'
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react'

/**
 * Página de restablecimiento de contraseña (HU2 / RF02).
 * Valida el token temporal firmado extraído de los parámetros de la URL y aplica
 * de forma estricta la política corporativa de contraseñas de Plantopolis:
 * - Mínimo 8 caracteres
 * - Al menos 1 letra mayúscula (A-Z)
 * - Al menos 1 número (0-9)
 * - Al menos 1 carácter especial (@$!%*?&)
 *
 * @component
 * @returns {JSX.Element} Formulario de cambio de contraseña con validación visual interactiva
 */
export default function ResetearPassword() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [website, setWebsite]                 = useState('') // Honeypot anti-bots
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')

  // Reglas individuales de la política de contraseñas de Plantopolis
  const tieneMinLongitud = password.length >= 8
  const tieneMayuscula   = /[A-Z]/.test(password)
  const tieneNumero      = /\d/.test(password)
  const tieneEspecial    = /[@$!%*?&]/.test(password)
  const esPasswordValida = tieneMinLongitud && tieneMayuscula && tieneNumero && tieneEspecial
  const coincidenClaves  = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword

  /**
   * Manejador de envío del formulario de restablecimiento.
   * Valida la política corporativa de contraseñas antes de invocar la API backend.
   *
   * @param {React.FormEvent<HTMLFormElement>} e Evento de envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (website) return // Ignorar sumisiones por bots

    if (!token) {
      setError(t('auth.missingTokenError', 'El enlace de recuperación no contiene un token válido.'))
      return
    }

    if (!esPasswordValida) {
      setError(
        t(
          'auth.passwordPolicyError',
          'La contraseña debe tener mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial (@$!%*?&)'
        )
      )
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch', 'Las contraseñas no coinciden.'))
      return
    }

    setLoading(true)
    setError('')

    try {
      await resetearPassword(token, password)
      // Redirigir a login indicando que la contraseña se actualizó exitosamente
      navigate('/login', { state: { passwordRestablecida: true } })
    } catch (err) {
      setError(
        err.response?.data?.mensaje ||
        t('auth.resetPasswordError', 'El token es inválido o ha expirado. Por favor solicita un nuevo enlace.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center relative
                    bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 
                    dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/40 
                    px-4 py-8 transition-colors overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-400/10 dark:bg-green-600/5 blur-[100px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-400/10 dark:bg-teal-600/5 blur-[120px]" />
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl 
                      shadow-2xl shadow-green-900/10 dark:shadow-black/40 
                      border border-white/60 dark:border-slate-700/50 
                      p-8 sm:p-10 w-full max-w-md relative z-10">

        <div className="text-center mb-8 flex-shrink-0">
          <Link to="/" className="inline-block mb-4">
            <img 
              src="/logo-plantopolis.png" 
              alt="Plantopolis Logo" 
              className="w-24 h-24 mx-auto object-contain drop-shadow-md" 
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <Lock className="text-green-600 dark:text-green-500" size={26} />
            {t('auth.resetPasswordTitle', 'Nueva contraseña')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm">
            {t('auth.resetPasswordSubtitle', 'Ingresa y confirma tu nueva contraseña de acceso')}
          </p>
        </div>

        {!token ? (
          <div className="text-center space-y-5 animate-in fade-in">
            <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/80 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 rounded-2xl p-4 text-sm font-medium">
              {t('auth.invalidTokenNotice', 'No se encontró un token de recuperación en el enlace o ya expiró.')}
            </div>
            <Link to="/recuperar-password">
              <Button fullWidth className="py-3 font-bold shadow-lg shadow-green-600/20">
                {t('auth.requestNewLink', 'Solicitar un nuevo enlace')}
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.newPassword', 'Nueva contraseña')}
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Input
              label={t('auth.confirmPassword', 'Confirmar nueva contraseña')}
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />

            <PasswordCriteriaChecklist
              password={password}
              confirmPassword={confirmPassword}
            />

            {/* Honeypot anti-bot oculto */}
            <div aria-hidden="true" className="absolute opacity-0 w-0 h-0 overflow-hidden -z-10" style={{ position: 'absolute', left: '-9999px' }}>
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50/80 dark:bg-red-900/30 border border-red-200/80 dark:border-red-800/50 text-red-700 dark:text-red-400 font-medium rounded-xl p-3.5 text-sm animate-in fade-in">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                fullWidth 
                loading={loading} 
                disabled={!esPasswordValida || !coincidenClaves}
                className="py-3 text-base font-bold shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('auth.saveNewPassword', 'Guardar nueva contraseña')}
              </Button>
            </div>

            <div className="text-center pt-3 border-t border-slate-200/60 dark:border-slate-700/50">
              <Link to="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-green-700 dark:hover:text-green-400 transition-colors">
                <ArrowLeft size={16} />
                {t('auth.backToLogin', 'Volver a iniciar sesión')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
