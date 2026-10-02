import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'
import { registro as registroApi, loginGoogle as loginGoogleApi } from '../api/authApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import { UserPlus, ShieldCheck } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    nombre:    '',
    email:     '',
    password:  '',
    telefono:  '',
    direccion: '',
    aceptaPolitica: false
  })
  const [errors, setErrors]   = useState({})
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm(prev => ({ ...prev, [name]: val }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validar = () => {
    const nuevosErrores = {}
    if (!form.nombre.trim())
      nuevosErrores.nombre = 'El nombre es obligatorio'
    if (!form.email.trim())
      nuevosErrores.email = 'El email es obligatorio'
    if (!form.password) {
      nuevosErrores.password = 'La contraseña es obligatoria'
    } else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(form.password)) {
      nuevosErrores.password = 'Debe tener mín. 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial'
    }
    if (!form.aceptaPolitica)
      nuevosErrores.aceptaPolitica = 'Debe aceptar la política de tratamiento de datos'
    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    setLoading(true)
    setError('')
    try {
      await registroApi(form)
      navigate('/login', { state: { registrado: true } })
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!form.aceptaPolitica) {
      setErrors(prev => ({
        ...prev,
        aceptaPolitica: 'Debe aceptar la política de tratamiento de datos antes de continuar'
      }))
      setError('Debe aceptar la política de tratamiento de datos antes de registrarse')
      return
    }
    try {
      setLoading(true)
      setError('')
      const res = await loginGoogleApi(credentialResponse.credential, 'registro')
      login(null, { email: res.data.email, rol: res.data.rol })
      if (res.data.rol === 'TRABAJADOR') {
        navigate('/trabajador')
      } else if (res.data.rol === 'ADMINISTRADOR') {
        navigate('/admin/dashboard')
      } else {
        navigate('/catalogo')
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse con Google')
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

      {/* Tarjeta con max-height y overflow-y-auto para scroll interno */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl 
                      shadow-2xl shadow-green-900/10 dark:shadow-black/40 
                      border border-white/60 dark:border-slate-700/50
                      p-8 sm:p-10 w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar relative z-10">

        <div className="text-center mb-8 flex-shrink-0">
          <Link to="/" className="inline-block mb-4">
            <img 
              src="/logo-plantopolis.jpg" 
              alt="Plantopolis Logo" 
              className="w-28 h-28 mx-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:filter dark:invert dark:opacity-90 drop-shadow-md" 
            />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <UserPlus className="text-green-600 dark:text-green-500" size={28} />
            Crear cuenta
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            Únete a Plantopolis y empieza tu experiencia
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <Input
            label="Nombre completo"
            name="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            error={errors.nombre}
          />

          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            error={errors.email}
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="Mín. 8 caracteres, 1 mayúscula y 1 especial"
            error={errors.password}
          />

          <div className="flex items-center gap-3 pt-4 pb-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Datos adicionales
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <Input
            label="Teléfono (Opcional)"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ej: 3001234567"
            error={errors.telefono}
          />

          <Input
            label="Dirección (Opcional)"
            name="direccion"
            type="text"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Calle, número, barrio, ciudad"
            error={errors.direccion}
          />

          {error && (
            <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200/80 dark:border-red-800/50 text-red-700 dark:text-red-400 font-medium
                            rounded-xl p-4 text-sm animate-in fade-in backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1 pt-2">
            <label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 group cursor-pointer">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  name="aceptaPolitica"
                  checked={form.aceptaPolitica}
                  onChange={handleChange}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 dark:border-slate-600 checked:border-green-600 dark:checked:border-green-500 checked:bg-green-600 dark:checked:bg-green-500 transition-all"
                />
                <ShieldCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" size={14} strokeWidth={3} />
              </div>
              <span className="leading-relaxed">
                He leído y acepto la <Link to="/politica-datos" target="_blank" className="font-bold text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:underline transition-colors">política de tratamiento de datos</Link>
              </span>
            </label>
            {errors.aceptaPolitica && (
              <span className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">{errors.aceptaPolitica}</span>
            )}
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth loading={loading} className="py-3 text-lg font-bold shadow-lg shadow-green-600/20">
              Crear cuenta
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
              onError={() => setError('Falló el registro con Google')}
              useOneTap
              shape="pill"
              theme="outline"
              size="large"
            />
          </div>
        </div>

        <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-200/60 dark:border-slate-700/50">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login"
                className="text-green-700 dark:text-green-400 font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}