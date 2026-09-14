import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'  // ← agrega useLocation
import { useAuth } from '../hooks/useAuth'
import { login as loginApi } from '../api/authApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()  // ← nuevo

  // Detectar si viene de un registro exitoso
  const registradoExitoso = location.state?.registrado === true  // ← nuevo

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await loginApi({ email: form.email, password: form.password })
      login(res.data.token, { email: res.data.email, rol: res.data.rol })

      // Redirección por rol (RF-18)
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

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-green-800">
            Iniciar sesión
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenido de vuelta a Plantopolis
          </p>
        </div>

        {/* ← Banner de registro exitoso */}
        {registradoExitoso && (
          <div className="bg-green-50 border border-green-200 text-green-700
                          rounded-lg p-3 mb-4 text-sm text-center">
            ✅ ¡Cuenta creada! Ya puedes iniciar sesión
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
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-lg p-3 text-sm">
              ⚠ {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Ingresar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/registro"
                className="text-green-700 font-medium hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}