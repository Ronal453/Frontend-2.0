import { NavLink, Outlet } from 'react-router-dom'

/**
 * Layout del panel de administración con sidebar de navegación.
 *
 * Estructura visual:
 *   ┌─────────────────────────────────┐
 *   │  Navbar (global — ya existe)    │
 *   ├──────────┬──────────────────────┤
 *   │ Sidebar  │  <Outlet />          │
 *   │ (admin)  │  (página activa)     │
 *   └──────────┴──────────────────────┘
 *
 * El <Outlet /> renderiza la ruta anidada activa:
 *   /admin/dashboard → <AdminDashboard />
 *   /admin/productos → <AdminProductos />
 *   /admin/pedidos   → <AdminPedidos />
 *
 * Uso en App.jsx con rutas anidadas:
 *   <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
 *     <Route path="dashboard" element={<AdminDashboard />} />
 *     <Route path="productos" element={<AdminProductos />} />
 *     <Route path="pedidos"   element={<AdminPedidos />} />
 *   </Route>
 *
 * Ruta destino: From/src/components/layout/AdminLayout.jsx
 */

// Links del sidebar con sus rutas, íconos y etiquetas
const ADMIN_LINKS = [
  { to: '/admin/dashboard', icono: '📊', label: 'Dashboard' },
  { to: '/admin/productos', icono: '🌿', label: 'Inventario' },
  { to: '/admin/pedidos',   icono: '📦', label: 'Pedidos' },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">

      {/* ── Sidebar de navegación admin ─────────────────────── */}
      <aside className="w-52 bg-green-900 text-white flex-shrink-0
                        flex flex-col py-6 px-3 gap-1">
        {/* Encabezado del sidebar */}
        <div className="px-3 mb-4">
          <p className="text-xs font-semibold text-green-400 uppercase
                        tracking-wider">
            Panel Admin
          </p>
        </div>

        {/* Links de navegación */}
        <nav className="flex flex-col gap-1">
          {ADMIN_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              // NavLink detecta la ruta activa y aplica la clase active
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg
                 text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-green-700 text-white'          // link activo
                   : 'text-green-300 hover:bg-green-800 hover:text-white'  // inactivo
                 }`
              }
            >
              <span className="text-lg">{link.icono}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Separador y link al catálogo (para no perder contexto) */}
        <div className="mt-auto pt-4 border-t border-green-700">
          <a
            href="/catalogo"
            className="flex items-center gap-3 px-3 py-2 rounded-lg
                       text-xs text-green-400 hover:text-green-200
                       transition-colors"
          >
            ← Ver sitio público
          </a>
        </div>
      </aside>

      {/* ── Contenido principal (página activa) ─────────────── */}
      <main className="flex-1 bg-gray-50 overflow-auto">
        {/* <Outlet /> renderiza la sub-ruta activa dentro del layout */}
        <Outlet />
      </main>
    </div>
  )
}