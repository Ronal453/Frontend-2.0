import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getCarrito } from '../../api/carritoApi'

export default function Navbar() {
  const { isAuth, user, logout } = useAuth()
  const navigate = useNavigate()
  const [totalItems, setTotalItems] = useState(0)

  // Cargar cantidad de ítems del carrito cuando el usuario está logueado
  useEffect(() => {
    if (!isAuth) {
      setTotalItems(0)
      return
    }
    getCarrito()
      .then(res => setTotalItems(res.data.totalItems ?? 0))
      .catch(() => setTotalItems(0))
  }, [isAuth])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-green-800 text-white px-6 py-3 flex items-center
                    justify-between shadow-md sticky top-0 z-50">

      {/* ── Logo ─────────────────────────────────────── */}
      <Link to="/catalogo"
            className="flex items-center gap-2 text-xl font-bold
                       hover:text-green-200 transition-colors">
        🌱 Plantopolis
      </Link>

      {/* ── Links ────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-sm font-medium">

        <Link to="/catalogo"
              className="hover:text-green-200 transition-colors">
          Catálogo
        </Link>

        {isAuth ? (
          <>
            {/* Mis pedidos */}
            <Link to="/pedidos"
                  className="hover:text-green-200 transition-colors">
              Mis pedidos
            </Link>

            {/* Carrito con contador */}
            <Link to="/carrito"
                  className="relative bg-white text-green-800 px-3 py-1
                             rounded-lg font-semibold hover:bg-green-100
                             transition-colors flex items-center gap-1">
              🛒 Carrito
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500
                                 text-white text-xs rounded-full w-5 h-5
                                 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Email del usuario */}
            <span className="text-green-300 text-xs hidden md:block">
              {user?.email}
            </span>

            {/* Salir */}
            <button
              onClick={handleLogout}
              className="hover:text-red-300 transition-colors"
            >
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