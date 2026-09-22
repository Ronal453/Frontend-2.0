import { NavLink, Outlet } from 'react-router-dom'

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icono: '📊', label: 'Dashboard' },
  { to: '/admin/productos', icono: '🌿', label: 'Inventario' },
  { to: '/admin/pedidos',   icono: '📦', label: 'Pedidos' },
  { to: '/admin/usuarios',  icono: '👥', label: 'Usuarios' },
  { to: '/admin/zonas', icono: '📍', label: 'Zonas' },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <aside className="w-52 bg-green-900 dark:bg-gray-950 text-white flex-shrink-0 flex flex-col py-6 px-3 gap-1 border-r border-transparent dark:border-gray-800 transition-colors">
        <div className="px-3 mb-4">
          <p className="text-xs font-semibold text-green-400 dark:text-emerald-400 uppercase tracking-wider">
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
                   ? 'bg-green-700 dark:bg-emerald-700/80 text-white shadow-sm'
                   : 'text-green-300 dark:text-gray-400 hover:bg-green-800 dark:hover:bg-gray-800 hover:text-white'}`
              }
            >
              <span className="text-lg">{link.icono}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-green-700 dark:border-gray-800">
          <a href="/catalogo"
             className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-green-400 dark:text-emerald-400 hover:text-green-200 dark:hover:text-emerald-200 transition-colors">
            ← Ver sitio público
          </a>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-auto transition-colors">
        <Outlet />
      </main>
    </div>
  )
}