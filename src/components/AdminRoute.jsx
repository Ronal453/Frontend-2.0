import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Componente de guardia para rutas del panel admin.
 *
 * Verifica DOS condiciones antes de renderizar el contenido:
 *   1. El usuario está autenticado (tiene token JWT válido)
 *   2. El usuario tiene rol ADMINISTRADOR
 *
 * Redirecciones:
 *   - Sin sesión     → /login
 *   - Sin rol admin  → /catalogo (es cliente, no admin)
 *
 * Uso en App.jsx:
 *   <Route path="/admin/dashboard" element={
 *     <AdminRoute><AdminDashboard /></AdminRoute>
 *   } />
 *
 * Ruta destino: From/src/components/AdminRoute.jsx
 */
export default function AdminRoute({ children }) {
  const { isAuth, user } = useAuth()

  // Si no está autenticado → redirigir al login
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  // Si está autenticado pero NO es administrador → redirigir al catálogo
  // El rol viene del JWT decodificado: user = { email, rol }
  if (user?.rol !== 'ADMINISTRADOR') {
    return <Navigate to="/catalogo" replace />
  }

  // Si pasa ambas verificaciones → renderizar el contenido protegido
  return children
}