import { useState } from 'react'
import { login as loginApi } from '../api/authApi'
import { useAuth } from '../hooks/useAuth'
import Button from './ui/Button'
import Input from './ui/Input'

/**
 * Overlay de bloqueo por inactividad.
 * Reutiliza POST /api/auth/login para validar la contraseña del usuario
 * de la sesión actual; si es correcta, refresca el token (sigue logueado)
 * y desbloquea. La sesión NUNCA se cierra desde aquí salvo que el usuario
 * pulse "Cerrar sesión" explícitamente.
 */
export default function LockScreen({ onUnlock, onForceLogout }) {
  const { user, login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const res = await loginApi({ email: user?.email, password, website: '' })
      // Refresca el token (nuevo JWT de 24h) — la sesión "sigue viva"
      login(null, { email: res.data.email, rol: res.data.rol })
      setPassword('')
      onUnlock()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Contraseña incorrecta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center
                    bg-gray-900/90 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🔒</p>
          <h1 className="text-xl font-bold text-green-800 dark:text-green-400">
            Sesión bloqueada por inactividad
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Ingresa la contraseña de{' '}
            <strong className="text-gray-700 dark:text-gray-200">{user?.email || 'tu cuenta'}</strong> para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoFocus
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            error={error}
          />

          <Button type="submit" fullWidth loading={loading}>
            Desbloquear
          </Button>
        </form>

        <button
          onClick={onForceLogout}
          className="w-full text-center text-xs text-gray-400 dark:text-gray-500
                     hover:text-red-500 dark:hover:text-red-400 transition-colors mt-4"
        >
          ¿No eres tú? Cerrar sesión
        </button>
      </div>
    </div>
  )
}