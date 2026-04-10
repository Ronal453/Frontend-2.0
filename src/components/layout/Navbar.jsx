import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { isAuth, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-green-800 text-white px-6 py-3 flex items-center
                    justify-between shadow-md">
      {/* Logo */}
      <Link to="/catalogo"
            className="flex items-center gap-2 text-xl font-bold
                       hover:text-green-200 transition-colors">
        🌱 Plantopolis
      </Link>

      {/* Links */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link to="/catalogo"
              className="hover:text-green-200 transition-colors">
          Catálogo
        </Link>

        {isAuth ? (
          <>
            <Link to="/pedidos"
                  className="hover:text-green-200 transition-colors">
              Mis pedidos
            </Link>
            <Link to="/checkout"
                  className="bg-white text-green-800 px-3 py-1 rounded-lg
                             font-semibold hover:bg-green-100 transition-colors">
              🛒 Carrito
            </Link>
            <span className="text-green-300 text-xs">
              {user?.email}
            </span>
            <button onClick={handleLogout}
                    className="hover:text-green-200 transition-colors">
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