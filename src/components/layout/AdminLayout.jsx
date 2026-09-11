import { NavLink, Outlet } from 'react-router-dom'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icono: '📊', label: 'Dashboard' },
  { to: '/admin/productos', icono: '🌿', label: 'Inventario' },
  { to: '/admin/pedidos',   icono: '📦', label: 'Pedidos' },
  { to: '/admin/usuarios',  icono: '👥', label: 'Usuarios' },   
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-52 bg-green-900 text-white flex-shrink-0 flex flex-col py-6 px-3 gap-1">
        <div className="px-3 mb-4">
          <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">
            Panel Admin
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          {ADMIN_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-green-700 text-white'
                   : 'text-green-300 hover:bg-green-800 hover:text-white'}`
              }
            >
              <span className="text-lg">{link.icono}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-green-700">
          <a href="/catalogo"
             className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-green-400 hover:text-green-200 transition-colors">
            ← Ver sitio público
          </a>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}