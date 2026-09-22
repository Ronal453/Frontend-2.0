import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import { useInactivityGuard } from '../hooks/useInactivityGuard'
import LockScreen from './LockScreen'

// 2:30 min → bloqueo de pantalla
const LOCK_AFTER_MS = 10 * 1000
// 5:00 min → cierre de sesión forzado
const LOGOUT_AFTER_MS = 20 * 1000

export default function InactivityGuard() {
  const { isAuth, logout } = useAuth()
  const { clearCart } = useCart()
  const navigate = useNavigate()

  const handleLogout = useCallback(() => {
    logout()
    clearCart()
    navigate('/login', { state: { sesionExpirada: true } })
  }, [logout, clearCart, navigate])

  const { locked, unlock } = useInactivityGuard({
    enabled: isAuth,
    lockAfterMs: LOCK_AFTER_MS,
    logoutAfterMs: LOGOUT_AFTER_MS,
    onLogout: handleLogout,
  })

  if (!isAuth || !locked) return null

  return <LockScreen onUnlock={unlock} onForceLogout={handleLogout} />
}