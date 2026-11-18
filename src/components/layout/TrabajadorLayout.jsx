import { useMemo, useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Navbar from './Navbar'
import { Kanban, Sprout, AlertTriangle, MapPin, ArrowLeft, X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Componente de diseño para el panel operativo del trabajador (TrabajadorLayout).
 * Renderiza el menú lateral de operaciones de vivero y el área de trabajo principal.
 * En móviles (< lg), transforma la barra lateral en un cajón deslizable (drawer)
 * para evitar que el contenido operativo se corte o comprima horizontalmente.
 *
 * @component
 * @returns {JSX.Element} Estructura visual del panel operativo de vivero.
 */
export default function TrabajadorLayout() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  // Estado para controlar la apertura del menú lateral en pantallas móviles
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Cierra automáticamente el menú móvil al cambiar de ruta operativa
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  /**
   * Enlaces de navegación operativa memoizados según el idioma activo.
   */
  const TRABAJADOR_LINKS = useMemo(() => [
    { to: '/trabajador/tareas', icono: Kanban,        label: t('worker.kanban') },
    { to: '/trabajador/zonas',  icono: MapPin,        label: t('worker.zones') },
    { to: '/trabajador/lotes',  icono: Sprout,        label: t('worker.batches') },
    { to: '/trabajador/mermas', icono: AlertTriangle, label: t('worker.waste') },
  ], [t])

  return (
    <div className="flex h-screen p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden bg-slate-50 dark:bg-[#060A11] relative">
      {/* Fondo oscuro traslúcido en móviles cuando la barra lateral está abierta */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Operativa: cajón deslizable en móvil (< lg) y fija en escritorio (lg+) */}
      <aside
        className={`fixed inset-y-2 left-2 z-[100] w-72 max-w-[85vw] lg:static lg:w-64 bg-gradient-to-b from-emerald-800 to-teal-950 text-white flex-shrink-0 flex flex-col py-6 px-4 gap-2 rounded-[2rem] shadow-2xl shadow-teal-900/40 border border-emerald-700/30 transition-transform duration-300 ease-in-out overflow-y-auto custom-scrollbar ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-[115%] lg:translate-x-0'
        }`}
      >
        {/* Cabecera Sidebar */}
        <div className="px-2 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-white/95 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 border border-white/50 p-1">
              <img src="/logo-plantopolis.png" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black tracking-tight text-white leading-none truncate">
                {t('worker.title')}
              </p>
              <p className="text-xs font-bold text-emerald-100/70 mt-1 uppercase tracking-widest truncate max-w-[130px]" title={user?.email}>
                {user?.email || 'Trabajador'}
              </p>
            </div>
          </div>

          {/* Botón para cerrar el menú lateral en móviles */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            title={t('nav.closeMenu', 'Cerrar menú lateral')}
            aria-label={t('nav.closeMenu', 'Cerrar menú lateral')}
            className="lg:hidden p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 flex-1">
          {TRABAJADOR_LINKS.map(link => {
            const Icon = link.icono
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group
                   ${isActive
                     ? 'bg-white/20 text-white shadow-inner border border-white/10'
                     : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md text-emerald-400' : 'text-emerald-100/70 group-hover:scale-110 group-hover:text-emerald-300'}`} 
                    />
                    {link.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Pie de sidebar */}
        <div className="pt-4 mt-auto border-t border-emerald-700/30">
          <NavLink
            to="/catalogo"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-emerald-100/70 hover:text-white hover:bg-white/10 transition-colors group mt-2"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            {t('worker.backToStore')}
          </NavLink>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col relative z-0 overflow-hidden min-w-0">
        <Navbar layoutMode="operativo" onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-auto relative p-1 sm:p-2 sm:pr-4 custom-scrollbar">
          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-white/80 dark:border-slate-700/50 min-h-full p-3 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

