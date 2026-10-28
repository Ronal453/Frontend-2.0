import { useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitarRecuperacionPassword } from '../api/authApi'
import { useLanguage } from '../context/LanguageContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { KeyRound, ArrowLeft, CheckCircle2, Mail, AlertCircle } from 'lucide-react'

/**
 * Página de solicitud de recuperación de contraseña (HU2).
 * Permite a cualquier usuario ingresar su correo para recibir un enlace
 * con un token temporal seguro de 15 minutos emitido por el backend.
 *
 * @component
 * @returns {JSX.Element} Formulario de solicitud de reseteo
 */
export default function RecuperarPassword() {
  const { t } = useLanguage()

  const [email, setEmail]     = useState('')
  const [website, setWebsite] = useState('') // Honeypot anti-bot
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (website) return // Bot detectado

    if (!email.trim()) {
      setError(t('auth.emailRequired', 'Por favor ingresa tu correo electrónico'))
      return
    }

    setLoading(true)
    setError('')

    try {
      await solicitarRecuperacionPassword(email.trim().toLowerCase())
      setEnviado(true)
    } catch (err) {
      setError(err.response?.data?.mensaje || t('auth.recoveryError', 'Ocurrió un error al procesar la solicitud. Intenta nuevamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center relative
                    bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 
                    dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/40 
                    px-4 py-8 transition-colors overflow-hidden">
      
      {/* Elementos decorativos */}
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
            <KeyRound className="text-green-600 dark:text-green-500" size={26} />
            {t('auth.forgotPasswordTitle', 'Recuperar contraseña')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-sm">
            {t('auth.forgotPasswordSubtitle', 'Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu clave')}
          </p>
        </div>

        {enviado ? (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Mail size={32} />
            </div>

            <div className="bg-green-50/80 dark:bg-green-900/20 border border-green-200/80 dark:border-green-800/50 rounded-2xl p-5 text-left">
              <h3 className="font-bold text-green-900 dark:text-green-300 text-base mb-1.5 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                {t('auth.recoveryEmailSentTitle', 'Revisa tu bandeja de entrada')}
              </h3>
              <p className="text-green-800/90 dark:text-green-400 text-sm leading-relaxed">
                {t('auth.recoveryEmailSentDesc', 'Si tu correo coincide con una cuenta activa en Plantopolis, te hemos enviado un enlace temporal válido por 15 minutos.')}
              </p>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500">
              {t('auth.checkSpamNote', '¿No lo ves? Revisa también tu carpeta de correo no deseado o spam.')}
            </p>

            <Link to="/login">
              <Button fullWidth className="py-3 font-bold shadow-lg shadow-green-600/20">
                {t('auth.backToLogin', 'Volver a iniciar sesión')}
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.email', 'Correo electrónico')}
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />

            {/* Honeypot anti-bot */}
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
              <Button type="submit" fullWidth loading={loading} className="py-3 text-base font-bold shadow-lg shadow-green-600/20">
                {t('auth.sendRecoveryLink', 'Enviar enlace de recuperación')}
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
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
