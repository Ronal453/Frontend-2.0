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

  const isDashboard = layoutMode === 'dashboard' || layoutMode === 'operativo'
  const isOperativo = layoutMode === 'operativo'

  const getNavLinkClass = (isActive) => {
    if (isOperativo) {
      return `flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'bg-white/25 text-white border border-white/40 shadow-inner' : 'text-emerald-50 hover:bg-white/20 hover:text-white'}`
    }
    if (isDashboard) {
      return `flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'text-slate-300 hover:bg-white/10 hover:text-cyan-300'}`
    }
    return `flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors ${isActive ? 'bg-white/20 text-white border border-white/30 shadow-sm' : 'text-emerald-50 hover:bg-white/10 hover:text-white'}`
  }

  const getActionClass = () => {
    if (isOperativo) {
      return 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-emerald-50 hover:bg-white/20 hover:text-white transition-colors'
    }
    if (isDashboard) {
      return 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-cyan-300 transition-colors'
    }
    return 'flex items-center gap-1.5 px-3 py-2 rounded-xl text-emerald-50 hover:bg-white/10 hover:text-white transition-colors'
  }

  const getNavBackground = () => {
    if (isOperativo) return 'relative w-full rounded-2xl mb-4 bg-gradient-to-r from-[#7BD389] to-[#2A9D8F] text-white border border-[#7BD389]/40 shadow-lg shadow-[#2A9D8F]/20'
    if (isDashboard) return 'relative w-full rounded-2xl mb-4 bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white border border-teal-600/40 shadow-lg shadow-teal-900/10'
    return `bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-800 dark:to-teal-900 text-white border-b border-emerald-400/50 shadow-md fixed top-0 w-full ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`
  }

  return (
    <nav className={`px-4 md:px-8 py-3 backdrop-blur-md shadow-sm z-50 flex items-center justify-between transition-all duration-300 ease-in-out ${getNavBackground()}`}>
      
      <div className="flex items-center gap-4">
        {pageTitle ? (
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{pageTitle}</h1>
            {pageSubtitle && <p className="text-xs text-slate-400 font-bold">{pageSubtitle}</p>}
          </div>
        ) : (
          <Link to="/catalogo" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center shadow-md overflow-hidden p-1 group-hover:scale-105 transition-transform border border-white/50">
              <img 
                src="/logo-plantopolis.png" 
                alt="Plantopolis Logo" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-100 transition-colors drop-shadow-sm">
              Plantopolis
            </span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4 text-sm font-bold">

        {!pageTitle && (
          <NavLink to="/catalogo" className={({ isActive }) => getNavLinkClass(isActive)}>
            <LayoutGrid size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Catálogo</span>
          </NavLink>
        )}

        {isAuth ? (
          <>
            {esCliente && (
              <Link to="/pedidos" className={getActionClass()}>
                <Package size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Mis pedidos</span>
              </Link>
            )}

            {(esTrabajador || esAdmin) && (
              <NavLink to="/trabajador" className={({ isActive }) => getNavLinkClass(isActive)}>
                <Sprout size={18} strokeWidth={2.5} />
                <span className="hidden md:inline">Panel Operativo</span>
              </NavLink>
            )}

            {esAdmin && (
              <NavLink to="/admin" className={({ isActive }) => getNavLinkClass(isActive)}>
                <Wrench size={18} strokeWidth={2.5} />
                <span className="hidden md:inline">Panel Admin</span>
              </NavLink>
            )}

            {esCliente && (
              <button onClick={openCart} className={`relative ${getActionClass()}`}>
                <ShoppingCart size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Carrito</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-md border border-white dark:border-slate-800">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            )}

            <div className={`flex items-center gap-3 pl-2 ml-2 border-l hidden lg:flex ${isDashboard ? 'border-slate-700/50' : 'border-gray-200/50 dark:border-slate-700/50'}`}>
              <span className={`text-xs font-black px-3 py-1.5 rounded-lg ${isDashboard ? 'text-slate-300 bg-white/10' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
                {user?.email}
              </span>
              <button onClick={handleLogout}
                      className={`flex items-center gap-1 text-xs font-black transition-colors p-2 rounded-lg ${isDashboard ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                <LogOut size={16} strokeWidth={2.5} />
                Salir
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link to="/login"
                  className="px-4 py-2 rounded-xl text-emerald-50 hover:bg-white/10 hover:text-white transition-colors font-bold text-sm">
              Ingresar
            </Link>
            <Link to="/registro"
                  className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl shadow-md transition-colors font-bold text-sm">
              Registrarse
            </Link>
          </div>
        )}

        <div className={`ml-2 pl-2 border-l ${isDashboard ? 'border-slate-700/50' : 'border-gray-200/50 dark:border-slate-700/50'}`}>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}