import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'
import { login as loginApi, loginGoogle as loginGoogleApi } from '../api/authApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()

  // Detectar si viene de un registro exitoso
  const registradoExitoso = location.state?.registrado === true

  // Detectar si viene de un cierre de sesión por inactividad (state o sessionStorage)
  const [sesionExpirada, setSesionExpirada] = useState(
    () => location.state?.sesionExpirada === true || sessionStorage.getItem('sesion_expirada') === 'true'
  )

  useEffect(() => {
    if (sessionStorage.getItem('sesion_expirada') === 'true') {
      sessionStorage.removeItem('sesion_expirada')
      setSesionExpirada(true)
    }
  }, [])

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
        website: form.website,      // honeypot: siempre vacío para humanos
      })
      login(null, { email: res.data.email, rol: res.data.rol })

      // Redirección por rol 
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
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-50 dark:bg-gray-900 px-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-lg p-8 w-full max-w-md transition-colors">

        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
            Iniciar sesión
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Bienvenido de vuelta a Plantopolis
          </p>
        </div>

        {/* Banner de registro exitoso */}
        {registradoExitoso && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300
                          rounded-lg p-3 mb-4 text-sm text-center">
            ✅ ¡Cuenta creada! Ya puedes iniciar sesión
          </div>
        )}

        {/* Banner de sesión cerrada por inactividad */}
        {sesionExpirada && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300
                          rounded-lg p-3 mb-4 text-sm text-center">
            ⏱ Tu sesión se cerró por inactividad. Inicia sesión de nuevo.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300
                            rounded-lg p-3 text-sm">
              ⚠ {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Ingresar
          </Button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          <span className="px-3 text-sm text-gray-400 dark:text-gray-500">o continuar con</span>
          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Falló la autenticación con Google')}
            useOneTap
          />
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/registro"
                className="text-green-700 dark:text-green-400 font-medium hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}