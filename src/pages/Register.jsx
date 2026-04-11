import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registro as registroApi } from '../api/authApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm]       = useState({ nombre: '', email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    // Limpiar error del campo al escribir
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
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
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Encabezado */}
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🌱</p>
          <h1 className="text-2xl font-bold text-green-800">
            Crear cuenta
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Únete a Plantopolis y empieza a comprar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre completo"
            name="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={handleChange}
            placeholder="Tu nombre"
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700
                            rounded-lg p-3 text-sm">
              ⚠ {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login"
                className="text-green-700 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}