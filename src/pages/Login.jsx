import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'
import { login as loginApi, loginGoogle as loginGoogleApi } from '../api/authApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { LogIn, CheckCircle2, Clock } from 'lucide-react'

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()

  const registradoExitoso = location.state?.registrado === true

  const [sesionExpirada, setSesionExpirada] = useState(
    () => location.state?.sesionExpirada === true || sessionStorage.getItem('sesion_expirada') === 'true'
  )

  useEffect(() => {
    let timeoutId;

    if (sessionStorage.getItem('sesion_expirada') === 'true') {
      sessionStorage.removeItem('sesion_expirada')
      setSesionExpirada(true)
    }

    if (sesionExpirada) {
      // Remover del location.state para que no aparezca si el usuario refresca (F5)
      if (location.state?.sesionExpirada) {
        navigate(location.pathname, { 
          replace: true, 
          state: { ...location.state, sesionExpirada: false } 
        })
      }

      // Quitar el mensaje después de 5 segundos
      timeoutId = setTimeout(() => {
        setSesionExpirada(false)
      }, 5000)
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [sesionExpirada, location, navigate])

  const [form, setForm]       = useState({ email: '', password: '', website: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      sessionStorage.removeItem('sesion_expirada')
      const res = await loginApi({
        email: form.email,
        password: form.password,
        website: form.website, 
      })
      login(null, { email: res.data.email, rol: res.data.rol })

      if (res.data.rol === 'TRABAJADOR') {
        navigate('/trabajador')
      } else if (res.data.rol === 'ADMINISTRADOR') {
        navigate('/admin/dashboard')
      } else {
        navigate('/catalogo')
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      setError('')
      const res = await loginGoogleApi(credentialResponse.credential)
      login(null, { email: res.data.email, rol: res.data.rol })
      if (res.data.rol === 'TRABAJADOR') {
        navigate('/trabajador')
      } else if (res.data.rol === 'ADMINISTRADOR') {
        navigate('/admin/dashboard')
      } else {
        navigate('/catalogo')
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center relative
                    bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 
                    dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/40 
                    px-4 py-8 transition-colors overflow-hidden">
      
      {/* Elementos decorativos de fondo (opcionales para dar más vida) */}
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
              className="w-28 h-28 mx-auto object-contain drop-shadow-md" 
            />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <LogIn className="text-green-600 dark:text-green-500" size={28} />
            Iniciar sesión
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            Bienvenido de vuelta a Plantopolis
          </p>
        </div>

        {/* Banner de registro exitoso */}
        {registradoExitoso && (
          <div className="bg-green-50/80 dark:bg-green-900/30 border border-green-200/80 dark:border-green-800/50 text-green-700 dark:text-green-400 font-medium
                          rounded-xl p-4 mb-6 text-sm flex items-center justify-center gap-2 animate-in fade-in backdrop-blur-sm">
            <CheckCircle2 size={18} /> ¡Cuenta creada! Ya puedes iniciar sesión
          </div>
        )}

        {/* Banner de sesión cerrada por inactividad */}
        {sesionExpirada && (
          <div className="bg-amber-50/80 dark:bg-amber-900/30 border border-amber-200/80 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 font-medium
                          rounded-xl p-4 mb-6 text-sm flex items-center justify-center gap-2 animate-in fade-in backdrop-blur-sm">
            <Clock size={18} /> Tu sesión expiró por inactividad.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
          />

          {/* Honeypot anti-bot: campo invisible para humanos, los bots lo llenan */}
          <div aria-hidden="true"
               className="absolute opacity-0 w-0 h-0 overflow-hidden -z-10"
               style={{ position: 'absolute', left: '-9999px' }}>
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={form.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <Input
            label="Contraseña"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200/80 dark:border-red-800/50 text-red-700 dark:text-red-400 font-medium
                            rounded-xl p-4 text-sm animate-in fade-in backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" fullWidth loading={loading} className="py-3 text-lg font-bold shadow-lg shadow-green-600/20">
              Ingresar
            </Button>
          </div>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
          <span className="px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">o continuar con</span>
          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="hover:scale-105 transition-transform duration-200">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Falló la autenticación con Google')}
              useOneTap
              shape="pill"
              theme="outline"
              size="large"
            />
          </div>
        </div>

        <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
          ¿No tienes cuenta?{' '}
          <Link to="/registro"
                className="text-green-700 dark:text-green-400 font-bold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}