import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const TRABAJADOR_LINKS = [
  { to: '/trabajador/tareas', icono: '📋', label: 'Tablero Kanban' },
  { to: '/trabajador/lotes',  icono: '🌱', label: 'Lotes de Cultivo' },
  { to: '/trabajador/mermas', icono: '⚠️', label: 'Registro de Mermas' },
]

export default function TrabajadorLayout() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-gray-50">
      {/* Sidebar Operativa */}
      <aside className="w-60 bg-emerald-900 text-white flex-shrink-0 flex flex-col py-6 px-4 shadow-lg">
        {/* Cabecera Sidebar */}
        <div className="px-2 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🧑‍🌾</span>
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Panel Operativo
              </p>
              <h2 className="text-sm font-bold text-white truncate max-w-[150px]">
                {user?.email || 'Trabajador'}
              </h2>
            </div>
          </div>
          <span className="inline-block mt-2 px-2 py-0.5 text-[11px] font-semibold bg-emerald-800 text-emerald-200 rounded-full border border-emerald-700">
            Rol: {user?.rol || 'TRABAJADOR'}
          </span>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {TRABAJADOR_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                   : 'text-emerald-200 hover:bg-emerald-800/70 hover:text-white'}`
              }
            >
              <span className="text-lg">{link.icono}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Pie de sidebar */}
        <div className="pt-4 border-t border-emerald-800/80">
          <NavLink
            to="/catalogo"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-emerald-300 hover:text-white hover:bg-emerald-800/50 transition-colors"
          >
            ← Ir a Tienda Pública
          </NavLink>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
