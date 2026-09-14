import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Guardia de ruta para el panel del trabajador.
 * Permite el acceso únicamente a usuarios con rol TRABAJADOR o ADMINISTRADOR.
 */
export default function TrabajadorRoute({ children }) {
  const { isAuth, user } = useAuth()

  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  // Permitir tanto a TRABAJADOR como a ADMINISTRADOR supervisar
  if (user?.rol !== 'TRABAJADOR' && user?.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/catalogo" replace />
  }

  return children
}
