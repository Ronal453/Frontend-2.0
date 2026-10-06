import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Navbar from './Navbar'
import { Kanban, Sprout, AlertTriangle, MapPin, ArrowLeft } from 'lucide-react'

const TRABAJADOR_LINKS = [
  { to: '/trabajador/tareas', icono: Kanban, label: 'Tablero Kanban' },
  { to: '/trabajador/lotes',  icono: Sprout, label: 'Lotes de Cultivo' },
  { to: '/trabajador/mermas', icono: AlertTriangle, label: 'Registro de Mermas' },
  { to: '/trabajador/zonas', icono: MapPin, label: 'Zonas / Invernaderos' },
]

export default function TrabajadorLayout() {
  const { user } = useAuth()

  return (
    <div className="flex h-screen p-4 gap-4 overflow-hidden bg-slate-50 dark:bg-[#060A11]">
      {/* Sidebar Operativa */}
      <aside className="w-64 bg-gradient-to-b from-[#7BD389] to-[#2A9D8F] text-white flex-shrink-0 flex flex-col py-6 px-4 gap-2 rounded-[2rem] shadow-2xl shadow-[#2A9D8F]/30 border border-[#7BD389]/40 transition-all overflow-y-auto z-10 custom-scrollbar">
        {/* Cabecera Sidebar */}
        <div className="px-2 mb-6 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/95 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 border border-white/50 p-1">
            <img src="/logo-plantopolis.png" alt="Logo" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-white leading-none">
              Operativo
            </p>
            <p className="text-xs font-bold text-[#D0F0DB] mt-1 uppercase tracking-widest truncate max-w-[120px]" title={user?.email}>
              {user?.email || 'Trabajador'}
            </p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 flex-1">
          {TRABAJADOR_LINKS.map(link => {
            const Icon = link.icono
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group
                   ${isActive
                     ? 'bg-white/25 text-white shadow-inner border border-white/40'
                     : 'text-[#D0F0DB] hover:bg-white/20 hover:text-white'}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md text-white' : 'text-[#D0F0DB] group-hover:scale-110 group-hover:text-white'}`} 
                    />
                    {link.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Pie de sidebar */}
        <div className="pt-4 mt-auto">
          <NavLink
            to="/catalogo"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#D0F0DB] hover:text-white hover:bg-white/20 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Volver a Tienda
          </NavLink>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
        <Navbar layoutMode="operativo" />
        <main className="flex-1 overflow-auto relative p-2 pr-4 custom-scrollbar">
          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-white/80 dark:border-slate-700/50 min-h-full p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
