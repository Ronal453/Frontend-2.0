import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../hooks/useAuth'
import { registro as registroApi, loginGoogle as loginGoogleApi } from '../api/authApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

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
    if (form.password.length < 6)
      nuevosErrores.password = 'Mínimo 6 caracteres'
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
      setError(err.response?.data?.mensaje || 'Error al registrarse con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-50 dark:bg-gray-900 px-4 py-8 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-none
                      dark:border dark:border-gray-700 p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
            Crear cuenta
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Únete a Plantopolis y empieza a comprar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

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
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
          />

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              Datos adicionales (opcionales)
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            value={form.telefono}
            onChange={handleChange}
            placeholder="Ej: 3001234567"
            error={errors.telefono}
          />

          <Input
            label="Dirección"
            name="direccion"
            type="text"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Calle, número, barrio, ciudad"
            error={errors.direccion}
          />

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800
                            text-red-700 dark:text-red-400
                            rounded-lg p-3 text-sm">
              ⚠ {error}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                name="aceptaPolitica"
                checked={form.aceptaPolitica}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
              />
              <span>
                Acepto la <Link to="/politica-datos" target="_blank" className="text-green-700 dark:text-green-400 hover:underline">política de tratamiento de datos</Link>
              </span>
            </label>
            {errors.aceptaPolitica && (
              <span className="text-red-500 text-xs mt-1">{errors.aceptaPolitica}</span>
            )}
          </div>

          <Button type="submit" fullWidth loading={loading}>
            Crear cuenta
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
            onError={() => setError('Falló el registro con Google')}
            useOneTap
          />
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login"
                className="text-green-700 dark:text-green-400 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}