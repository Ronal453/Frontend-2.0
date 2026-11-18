import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../context/CartContext'
import { useLayoutContext } from '../../context/LayoutContext'
import { LayoutGrid, Package, Sprout, Wrench, ShoppingCart, LogOut, Menu } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Barra de navegación superior responsiva para Plantopolis.
 * Adapta sus enlaces, estilos, espaciados móviles y comportamiento de ocultación por scroll
 * según el rol del usuario y el modo de layout (`public`, `dashboard` u `operativo`).
 * En modos internos (`dashboard` / `operativo`), incluye un botón hamburguesa en móviles
 * para desplegar el menú lateral sin comprimir el área de trabajo.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {'public'|'dashboard'|'operativo'} [props.layoutMode='public'] - Modo visual de la barra.
 * @param {Function} [props.onToggleSidebar] - Callback para abrir/cerrar el menú lateral en móviles.
 * @returns {JSX.Element}
 */
export default function Navbar({ layoutMode = 'public', onToggleSidebar }) {
  const { isAuth, user, logout } = useAuth()
  const { totalItems, refreshCart, clearCart, openCart } = useCart()
  const { pageTitle, pageSubtitle } = useLayoutContext()
  const { t } = useLanguage()
  const navigate = useNavigate()

  // Estado para la visibilidad del navbar al hacer scroll (solo para layout público)
  const [showNavbar, setShowNavbar] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    if (layoutMode === 'dashboard' || layoutMode === 'operativo') return // En paneles internos no ocultamos el navbar

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
        setShowNavbar(false)
      } else {
        setShowNavbar(true)
      }
      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [layoutMode])

  useEffect(() => {
    if (isAuth) {
      refreshCart()
    } else {
      clearCart()
    }
  }, [isAuth])

  /**
   * Cierra la sesión actual del usuario, limpia el carrito y redirige a `/login` vía React Router.
   */
  const handleLogout = () => {
    sessionStorage.removeItem('sesion_expirada')
    logout({ redirect: false })
    clearCart()
    navigate('/login')
  }

  const esAdmin = user?.rol === 'ADMINISTRADOR'
  const esTrabajador = user?.rol === 'TRABAJADOR'
  const esCliente = !esAdmin && !esTrabajador

  const isDashboard = layoutMode === 'dashboard' || layoutMode === 'operativo'
  const isOperativo = layoutMode === 'operativo'

  /**
   * Genera las clases CSS de los enlaces de navegación adaptando el padding a pantallas móviles.
   */
  const getNavLinkClass = (isActive) => {
    if (isOperativo) {
      return `flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-colors ${isActive ? 'bg-white/25 text-white border border-white/40 shadow-inner' : 'text-emerald-50 hover:bg-white/20 hover:text-white'}`
    }
    if (isDashboard) {
      return `flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-colors ${isActive ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/30' : 'text-slate-300 hover:bg-white/10 hover:text-cyan-300'}`
    }
    return `flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-colors ${isActive ? 'bg-white/20 text-white border border-white/30 shadow-sm' : 'text-emerald-50 hover:bg-white/10 hover:text-white'}`
  }

  /**
   * Genera las clases CSS para botones de acción rápida en la barra superior.
   */
  const getActionClass = () => {
    if (isOperativo) {
      return 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-emerald-50 hover:bg-white/20 hover:text-white transition-colors'
    }
    if (isDashboard) {
      return 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-slate-300 hover:bg-white/10 hover:text-cyan-300 transition-colors'
    }
    return 'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-emerald-50 hover:bg-white/10 hover:text-white transition-colors'
  }

  /**
   * Define el fondo y posicionamiento del Navbar según el modo de layout activo.
   */
  const getNavBackground = () => {
    if (isOperativo) return 'relative w-full rounded-2xl mb-2 sm:mb-4 bg-gradient-to-r from-emerald-800 to-teal-950 text-white border border-emerald-700/30 shadow-lg shadow-teal-900/20'
    if (isDashboard) return 'relative w-full rounded-2xl mb-2 sm:mb-4 bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white border border-teal-600/40 shadow-lg shadow-teal-900/10'
    return `bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-800 dark:to-teal-900 text-white border-b border-emerald-400/50 shadow-md fixed top-0 w-full ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`
  }

  return (
    <nav className={`px-3 sm:px-4 md:px-8 py-2.5 sm:py-3 backdrop-blur-md shadow-sm z-50 flex items-center justify-between gap-2 transition-all duration-300 ease-in-out ${getNavBackground()}`}>
      
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Botón hamburguesa exclusivo para móviles cuando estamos en paneles con Sidebar */}
        {isDashboard && onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={t('nav.openMenu', 'Abrir menú lateral')}
            aria-label={t('nav.openMenu', 'Abrir menú lateral')}
            className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
        )}

        {pageTitle ? (
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-white tracking-tight truncate">{pageTitle}</h1>
            {pageSubtitle && <p className="text-[11px] sm:text-xs text-slate-300 font-bold truncate hidden sm:block">{pageSubtitle}</p>}
          </div>
        ) : (
          <Link to="/catalogo" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/95 flex items-center justify-center shadow-md overflow-hidden p-1 group-hover:scale-105 transition-transform border border-white/50 flex-shrink-0">
              <img 
                src="/logo-plantopolis.png" 
                alt="Plantopolis Logo" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            {/* En móvil cuando no hay sesión iniciada ocultamos el texto de marca para dar espacio a Ingresar/Registrarse sin desbordar */}
            <span className={`text-base sm:text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-100 transition-colors drop-shadow-sm truncate ${!isAuth ? 'hidden sm:inline' : ''}`}>
              Plantopolis
            </span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 text-xs sm:text-sm font-bold flex-shrink-0">

        {!pageTitle && (
          <NavLink to="/catalogo" className={({ isActive }) => getNavLinkClass(isActive)} title={t('nav.catalogo')}>
            <LayoutGrid size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">{t('nav.catalogo')}</span>
          </NavLink>
        )}

        {isAuth ? (
          <>
            {esCliente && (
              <Link to="/pedidos" className={getActionClass()} title={t('nav.misPedidos')}>
                <Package size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">{t('nav.misPedidos')}</span>
              </Link>
            )}

            {(esTrabajador || esAdmin) && (
              <NavLink to="/trabajador" className={({ isActive }) => getNavLinkClass(isActive)} title={t('nav.panelOperativo')}>
                <Sprout size={18} strokeWidth={2.5} />
                <span className="hidden md:inline">{t('nav.panelOperativo')}</span>
              </NavLink>
            )}

            {esAdmin && (
              <NavLink to="/admin" className={({ isActive }) => getNavLinkClass(isActive)} title={t('nav.panelAdmin')}>
                <Wrench size={18} strokeWidth={2.5} />
                <span className="hidden md:inline">{t('nav.panelAdmin')}</span>
              </NavLink>
            )}

            {esCliente && (
              <button onClick={openCart} className={`relative ${getActionClass()}`} title={t('nav.carrito')}>
                <ShoppingCart size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">{t('nav.carrito')}</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-md border border-white dark:border-slate-800">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            )}

            {/* Botón de cerrar sesión visible en pantallas móviles (< lg) */}
            <button
              onClick={handleLogout}
              title={t('nav.salir')}
              aria-label={t('nav.salir')}
              className={`lg:hidden flex items-center gap-1 text-xs font-black transition-colors p-2 rounded-lg ${isDashboard ? 'text-slate-300 hover:text-red-400 hover:bg-red-500/10' : 'text-emerald-50 hover:text-red-200 hover:bg-white/10'}`}
            >
              <LogOut size={18} strokeWidth={2.5} />
            </button>

            <div className={`items-center gap-3 pl-2 ml-2 border-l hidden lg:flex ${isDashboard ? 'border-slate-700/50' : 'border-gray-200/50 dark:border-slate-700/50'}`}>
              <span className={`text-xs font-black px-3 py-1.5 rounded-lg ${isDashboard ? 'text-slate-300 bg-white/10' : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
                {user?.email}
              </span>
              <button onClick={handleLogout}
                      className={`flex items-center gap-1 text-xs font-black transition-colors p-2 rounded-lg ${isDashboard ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                <LogOut size={16} strokeWidth={2.5} />
                {t('nav.salir')}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2 ml-0.5 sm:ml-2">
            <Link to="/login"
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-emerald-50 hover:bg-white/10 hover:text-white transition-colors font-bold text-xs sm:text-sm whitespace-nowrap">
              {t('nav.ingresar')}
            </Link>
            <Link to="/registro"
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl shadow-md transition-colors font-bold text-xs sm:text-sm whitespace-nowrap">
              {t('nav.registrarse')}
            </Link>
          </div>
        )}

        <div className={`ml-1 sm:ml-2 pl-1.5 sm:pl-2 border-l flex items-center gap-1.5 sm:gap-2 ${isDashboard ? 'border-slate-700/50' : 'border-gray-200/50 dark:border-slate-700/50'}`}>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}