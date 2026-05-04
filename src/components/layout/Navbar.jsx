import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../context/CartContext'

/**
 * Barra de navegación principal de Plantopolis.
 *
 * FIXES:
 *   - Al hacer login: refreshCart() para cargar el contador real del carrito
 *   - Al hacer logout: clearCart() para poner el contador en 0
 *   - NO llama refreshCart() en cada render, solo cuando cambia isAuth
 *     Esto evita que el carrito se "reactive" después del checkout.
 *
 * Ruta destino: From/src/components/layout/Navbar.jsx
 */
export default function Navbar() {
  const { isAuth, user, logout } = useAuth()
  const { totalItems, refreshCart, clearCart } = useCart()
  const navigate = useNavigate()

  // Cuando el usuario inicia sesión → cargar el contador real del carrito
  // Cuando cierra sesión → limpiar el contador a 0
  // Se ejecuta SOLO cuando cambia isAuth, no en cada render
  useEffect(() => {
    if (isAuth) {
      // Usuario acaba de iniciar sesión → cargar contador desde BD
      refreshCart()
    } else {
      // Usuario cerró sesión → limpiar contador del navbar
      clearCart()
    }
  }, [isAuth]) // solo depende de isAuth, no de refreshCart/clearCart

  const handleLogout = () => {
    logout()    // limpiar token y datos del usuario
    clearCart() // limpiar contador del carrito
    navigate('/login')
  }

  return (
    <nav className="bg-green-800 text-white px-6 py-3 flex items-center
                    justify-between shadow-md sticky top-0 z-50">

      {/* Logo y nombre */}
      <Link to="/catalogo"
            className="flex items-center gap-2 text-xl font-bold
                       hover:text-green-200 transition-colors">
        🌱 Plantopolis
      </Link>

      {/* Links de navegación */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link to="/catalogo"
              className="hover:text-green-200 transition-colors">
          Catálogo
        </Link>

        {isAuth ? (
          <>
            {/* Link a mis pedidos */}
            <Link to="/pedidos"
                  className="hover:text-green-200 transition-colors">
              Mis pedidos
            </Link>

            {/* Botón del carrito con contador de ítems */}
            <Link to="/carrito"
                  className="relative bg-white text-green-800 px-3 py-1
                             rounded-lg font-semibold hover:bg-green-100
                             transition-colors flex items-center gap-1">
              🛒 Carrito
              {/* Badge del contador: solo visible si hay ítems */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500
                                 text-white text-xs rounded-full w-5 h-5
                                 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Email del usuario autenticado (solo en desktop) */}
            <span className="text-green-300 text-xs hidden md:block">
              {user?.email}
            </span>

            {/* Botón de cerrar sesión */}
            <button onClick={handleLogout}
                    className="hover:text-red-300 transition-colors">
              Salir
            </button>
          </>
        ) : (
          <>
            <Link to="/login"
                  className="hover:text-green-200 transition-colors">
              Iniciar sesión
            </Link>
            <Link to="/registro"
                  className="bg-white text-green-800 px-3 py-1 rounded-lg
                             font-semibold hover:bg-green-100 transition-colors">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}