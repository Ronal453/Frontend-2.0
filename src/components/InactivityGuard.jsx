import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import { useInactivityGuard } from '../hooks/useInactivityGuard'
import LockScreen from './LockScreen'

// 2:30 min → bloqueo de pantalla
const LOCK_AFTER_MS = 2.5 * 60 * 1000
// 5:00 min → cierre de sesión forzado
const LOGOUT_AFTER_MS = 5 * 60 * 1000

/**
 * Componente guardián de inactividad de sesión.
 * Bloquea la pantalla tras 2.5 minutos de inactividad y cierra la sesión tras 5 minutos,
 * preservando el estado `sesionExpirada: true` en la navegación hacia `/login`.
 *
 * @component
 * @returns {JSX.Element|null}
 */
export default function InactivityGuard() {
  const { isAuth, logout } = useAuth()
  const { clearCart } = useCart()
  const navigate = useNavigate()

  const handleTimeoutLogout = useCallback(() => {
    sessionStorage.setItem('sesion_expirada', 'true')
    logout({ redirect: false })
    clearCart()
    navigate('/login', { state: { sesionExpirada: true }, replace: true })
  }, [logout, clearCart, navigate])

  const handleManualLogout = useCallback(() => {
    sessionStorage.removeItem('sesion_expirada')
    logout({ redirect: false })
    clearCart()
    navigate('/login', { replace: true })
  }, [logout, clearCart, navigate])

  const { locked, unlock } = useInactivityGuard({
    enabled: isAuth,
    lockAfterMs: LOCK_AFTER_MS,
    logoutAfterMs: LOGOUT_AFTER_MS,
    onLogout: handleTimeoutLogout,
  })

  if (!isAuth || !locked) return null

  return <LockScreen onUnlock={unlock} onForceLogout={handleManualLogout} />
}