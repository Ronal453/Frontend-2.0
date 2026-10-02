import { NavLink, Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { LayoutDashboard, Package, ShoppingBag, Users, MapPin, Sprout, ArrowLeft } from 'lucide-react'

const ECOM_LINKS = [
  { to: '/admin/dashboard', icono: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/productos', icono: Package,         label: 'Inventario Catálogo' },
  { to: '/admin/pedidos',   icono: ShoppingBag,     label: 'Pedidos' },
  { to: '/admin/usuarios',  icono: Users,           label: 'Usuarios y Roles' },
]

const VIVERO_LINKS = [
  { to: '/admin/zonas',     icono: MapPin,          label: 'Gestión de Zonas' },
  { to: '/admin/lotes',     icono: Sprout,          label: 'Lotes de Cultivo' },
]

export default function AdminLayout() {
  return (
    <div className="flex h-screen p-4 gap-4 overflow-hidden bg-slate-50 dark:bg-[#060A11]">
      <aside className="w-64 bg-gradient-to-b from-slate-600 via-slate-600 to-emerald-700 text-white flex-shrink-0 flex flex-col py-6 px-4 gap-2 rounded-[2rem] shadow-2xl shadow-emerald-800/20 border border-slate-500/40 transition-all overflow-y-auto z-10 custom-scrollbar">
        <div className="px-2 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 border border-emerald-500/30">
            <Sprout className="text-emerald-400" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-white leading-none">
              Plantopolis
            </p>
            <p className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-widest">
              Admin
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">E-Commerce</p>
          <nav className="flex flex-col gap-1.5">
            {ECOM_LINKS.map(link => {
              const Icon = link.icono
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group
                     ${isActive
                       ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/50'
                       : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`} />
                      {link.label}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="mb-4">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operaciones de Vivero</p>
          <nav className="flex flex-col gap-1.5">
            {VIVERO_LINKS.map(link => {
              const Icon = link.icono
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group
                     ${isActive
                       ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500/50'
                       : 'text-slate-300 hover:bg-white/10 hover:text-white'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`} />
                      {link.label}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-700/50">
          <a href="/catalogo"
             className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors">
            <ArrowLeft size={16} strokeWidth={2.5} />
            Volver al Catálogo
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative z-0 overflow-hidden">
        <Navbar layoutMode="dashboard" />
        <main className="flex-1 overflow-auto relative p-2 pr-4 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}