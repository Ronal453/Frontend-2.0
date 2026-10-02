import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../context/CartContext'
import { useLayoutContext } from '../../context/LayoutContext'
import { Bot, LayoutGrid, Package, Sprout, Wrench, ShoppingCart, LogOut } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

export default function Navbar({ layoutMode = 'public' }) {
  const { isAuth, user, logout } = useAuth()
  const { totalItems, refreshCart, clearCart, openCart } = useCart()
  const { pageTitle, pageSubtitle } = useLayoutContext()
  const navigate = useNavigate()

  // Estado para la visibilidad del navbar al hacer scroll (solo para layout público)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    if (layoutMode === 'dashboard') return // En dashboards no ocultamos el navbar

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false)
      } else {
        setShowNavbar(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, layoutMode])

  useEffect(() => {
    if (isAuth) {
      refreshCart()
    } else {
      clearCart()
    }
  }, [isAuth])

  const handleLogout = () => {
    sessionStorage.removeItem('sesion_expirada')
    logout()
    clearCart()
    navigate('/login')
  }

  const esAdmin = user?.rol === 'ADMINISTRADOR'
  const esTrabajador = user?.rol === 'TRABAJADOR'
  const esCliente = !esAdmin && !esTrabajador

  const isDashboard = layoutMode === 'dashboard'

  return (
    <nav className={`px-4 md:px-8 py-3 backdrop-blur-md shadow-sm z-50 flex items-center justify-between transition-all duration-300 ease-in-out
      ${isDashboard 
        ? 'relative w-full rounded-2xl mb-4 bg-gradient-to-r from-slate-600 via-slate-600 to-emerald-700 text-white border border-slate-500/40 shadow-lg shadow-emerald-700/10' 
        : `bg-white/90 dark:bg-slate-900/90 border-b border-gray-200/50 dark:border-slate-800/50 fixed top-0 w-full ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}`}>
      
      <div className="flex items-center gap-4">
        {pageTitle ? (
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{pageTitle}</h1>
            {pageSubtitle && <p className="text-xs text-slate-400 font-bold">{pageSubtitle}</p>}
          </div>
        ) : (
          <Link to="/catalogo" className="flex items-center gap-3 group">
            <img 
              src="/logo-plantopolis.jpg" 
              alt="Plantopolis Logo" 
              className="w-10 h-10 object-contain mix-blend-multiply dark:mix-blend-screen dark:filter dark:invert dark:opacity-90 group-hover:scale-105 transition-transform" 
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              Plantopolis
            </span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 text-sm font-bold">

        {!pageTitle && (
          <NavLink to="/catalogo"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-emerald-400'}`
                }>
            <LayoutGrid size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Catálogo</span>
          </NavLink>
        )}

        {isAuth ? (
          <>
            {esCliente && (
              <Link to="/pedidos"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-emerald-400 transition-colors">
                <Package size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Mis pedidos</span>
              </Link>
            )}

            {(esTrabajador || esAdmin) && (
              <NavLink to="/trabajador"
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-emerald-400'}`
                    }>
                <Sprout size={18} strokeWidth={2.5} />
                <span className="hidden md:inline">Panel Operativo</span>
              </NavLink>
            )}

            {esAdmin && (
              <NavLink to="/admin"
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-white/10 hover:text-emerald-400'}`
                    }>
                <Wrench size={18} strokeWidth={2.5} />
                <span className="hidden md:inline">Panel Admin</span>
              </NavLink>
            )}

            {esCliente && (
              <button onClick={openCart}
                    className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-emerald-400 transition-colors">
                <ShoppingCart size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-md border border-white dark:border-slate-800">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-3 pl-2 ml-2 border-l border-slate-700/50 hidden lg:flex">
              <span className="text-slate-300 text-xs font-black bg-white/10 px-3 py-1.5 rounded-lg">{user?.email}</span>
              <button onClick={handleLogout}
                      className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                <LogOut size={16} strokeWidth={2.5} />
                Salir
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link to="/login"
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-sm">
              Ingresar
            </Link>
            <Link to="/registro"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-colors font-bold text-sm">
              Registrarse
            </Link>
          </div>
        )}

        <div className="ml-2 pl-2 border-l border-slate-700/50">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}