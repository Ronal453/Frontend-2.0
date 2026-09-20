import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../context/CartContext'
import ThemeToggle from '../ui/ThemeToggle'

export default function Navbar() {
  const { isAuth, user, logout } = useAuth()
  const { totalItems, refreshCart, clearCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuth) {
      refreshCart()
    } else {
      clearCart()
    }
  }, [isAuth])

  const handleLogout = () => {
    logout()
    clearCart()
    navigate('/login')
  }

  const esAdmin = user?.rol === 'ADMINISTRADOR'
  const esTrabajador = user?.rol === 'TRABAJADOR'
  const esCliente = !esAdmin && !esTrabajador

  return (
    <nav className="bg-green-800 dark:bg-gray-950 text-white px-6 py-3 flex items-center
                    justify-between shadow-md sticky top-0 z-50 transition-colors
                    border-b border-transparent dark:border-gray-800">

      <Link to="/catalogo"
            className="flex items-center gap-2 text-xl font-bold
                       hover:text-green-200 transition-colors">
        🌱 Plantopolis
      </Link>

      <div className="flex items-center gap-4 text-sm font-medium">

        <Link to="/catalogo"
              className="hover:text-green-200 transition-colors">
          Catálogo
        </Link>

        {isAuth ? (
          <>
            {esCliente && (
              <Link to="/pedidos"
                    className="hover:text-green-200 transition-colors">
                Mis pedidos
              </Link>
            )}

            {(esTrabajador || esAdmin) && (
              <Link to="/trabajador"
                    className="bg-emerald-600 dark:bg-emerald-700 text-white px-3 py-1
                               rounded-lg font-semibold hover:bg-emerald-500 dark:hover:bg-emerald-600
                               transition-colors text-xs flex items-center gap-1 shadow-sm">
                🧑‍🌾 Panel Operativo
              </Link>
            )}

            {esAdmin && (
              <Link to="/admin"
                    className="bg-yellow-500 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-50 px-3 py-1
                               rounded-lg font-semibold hover:bg-yellow-400 dark:hover:bg-yellow-500
                               transition-colors text-xs">
                🛠 Panel Admin
              </Link>
            )}

            {esCliente && (
              <Link to="/carrito"
                    className="relative bg-white dark:bg-gray-800 text-green-800 dark:text-green-300 px-3 py-1
                               rounded-lg font-semibold hover:bg-green-100 dark:hover:bg-gray-700
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
            )}

            <span className="text-green-300 dark:text-gray-400 text-xs hidden md:block">
              {user?.email}
              {esAdmin && (
                <span className="ml-1 text-yellow-400 font-semibold">(admin)</span>
              )}
              {esTrabajador && (
                <span className="ml-1 text-emerald-300 font-semibold">(operativo)</span>
              )}
            </span>

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
                  className="bg-white dark:bg-gray-800 text-green-800 dark:text-green-300 px-3 py-1 rounded-lg
                             font-semibold hover:bg-green-100 dark:hover:bg-gray-700 transition-colors">
              Registrarse
            </Link>
          </>
        )}

        {/* Botón de tema — siempre visible al final */}
        <ThemeToggle />
      </div>
    </nav>
  )
}