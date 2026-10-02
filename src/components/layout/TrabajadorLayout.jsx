import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Navbar from './Navbar'

const TRABAJADOR_LINKS = [
  { to: '/trabajador/tareas', icono: '📋', label: 'Tablero Kanban' },
  { to: '/trabajador/lotes',  icono: '🌱', label: 'Lotes de Cultivo' },
  { to: '/trabajador/mermas', icono: '⚠️', label: 'Registro de Mermas' },
  { to: '/trabajador/zonas', icono: '📍', label: 'Zonas / Invernaderos' },
]

export default function TrabajadorLayout() {
  const { user } = useAuth()

  return (
    <div className="flex h-screen p-4 gap-4 overflow-hidden">
      {/* Sidebar Operativa */}
      <aside className="w-60 bg-gradient-to-b from-emerald-900/90 to-emerald-950/90 dark:from-emerald-950/90 dark:to-black/90 backdrop-blur-xl text-white flex-shrink-0 flex flex-col py-6 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/20 dark:border-white/5 rounded-2xl transition-all overflow-y-auto z-10">
        {/* Cabecera Sidebar */}
        <div className="px-2 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl filter drop-shadow-md">🧑‍🌾</span>
            <div>
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider drop-shadow-sm">
                Panel Operativo
              </p>
              <h2 className="text-sm font-bold text-white truncate max-w-[150px]">
                {user?.email || 'Trabajador'}
              </h2>
            </div>
          </div>
          <span className="inline-block mt-2 px-2 py-0.5 text-[11px] font-semibold bg-emerald-800/50 dark:bg-emerald-950/70 text-emerald-200 rounded-full border border-emerald-500/50">
            Rol: {user?.rol || 'TRABAJADOR'}
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 flex-1">
          {TRABAJADOR_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                 ${isActive
                   ? 'bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-white/40'
                   : 'text-emerald-100 hover:bg-white/10 hover:text-white'}`
              }
            >
              <span className="text-lg filter drop-shadow-md">{link.icono}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Pie de sidebar */}
        <div className="pt-4 border-t border-emerald-700/50 dark:border-white/10">
          <NavLink
            to="/catalogo"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            ← Ir a Tienda Pública
          </NavLink>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col gap-4 relative z-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 bg-white/30 dark:bg-black/30 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-white/40 dark:border-white/10 overflow-auto relative p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
