import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── Páginas públicas y de cliente ────────────────────────────────────────
import Login         from './pages/Login'
import Register      from './pages/Register'
import Catalog       from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import MisPedidos    from './pages/MisPedidos'
import DetallePedido from './pages/DetallePedido'

// ── Páginas del panel admin ─────────────────────────────
import AdminDashboard from './pages/AdminDashboard'
import AdminProductos from './pages/AdminProductos'
import AdminPedidos   from './pages/AdminPedidos'

// ── Layout y guardias de rutas ────────────────────────────────────────────
import Navbar      from './components/layout/Navbar'
import Footer      from './components/layout/Footer'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute   from './components/AdminRoute'    
import AdminLayout  from './components/layout/AdminLayout'

// ── Contextos globales ────────────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

/**
 * Componente raíz de la aplicación.
 *
 * Estructura de rutas Sprint 5 (añadido bloque admin):
 *
 * Rutas públicas:
 *   /catalogo, /producto/:id, /login, /registro
 *
 * Rutas privadas (requieren JWT):
 *   /carrito, /checkout, /pedidos, /pedidos/:id
 *
 * [NUEVO] Rutas admin (requieren JWT + rol ADMINISTRADOR):
 *   /admin              → redirige a /admin/dashboard
 *   /admin/dashboard    → AdminDashboard (KPIs + gráfica + top productos)
 *   /admin/productos    → AdminProductos (CRUD de inventario)
 *   /admin/pedidos      → AdminPedidos (cambio de estados)
 *
 * Las rutas admin usan AdminLayout con sidebar, anidado dentro de AdminRoute.
 * AdminRoute verifica que el usuario tenga rol ADMINISTRADOR.
 *
 * Ruta destino: From/src/App.jsx
 * REEMPLAZA el archivo existente — copia todo el contenido.
 */
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50">

            {/* Navbar global — visible en todas las rutas */}
            <Navbar />

            {/* Área de contenido principal */}
            <main className="flex-1">
              <Routes>

                {/* ── Rutas públicas ─────────────────────────────────── */}
                <Route path="/login"        element={<Login />} />
                <Route path="/registro"     element={<Register />} />
                <Route path="/catalogo"     element={<Catalog />} />
                <Route path="/producto/:id" element={<ProductDetail />} />

                {/* ── Rutas privadas (requieren JWT) ──────────────────── */}
                <Route path="/carrito" element={
                  <PrivateRoute><Cart /></PrivateRoute>
                } />
                <Route path="/checkout" element={
                  <PrivateRoute><Checkout /></PrivateRoute>
                } />
                <Route path="/pedidos" element={
                  <PrivateRoute><MisPedidos /></PrivateRoute>
                } />
                <Route path="/pedidos/:id" element={
                  <PrivateRoute><DetallePedido /></PrivateRoute>
                } />

                {/* ── [NUEVO Sprint 5] Rutas admin ─────────────────────
                    AdminRoute verifica: isAuth && rol === 'ADMINISTRADOR'
                    AdminLayout provee el sidebar y el <Outlet /> para sub-rutas
                ──────────────────────────────────────────────────────── */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }>
                  {/* /admin → redirige automáticamente a /admin/dashboard */}
                  <Route index element={<Navigate to="dashboard" replace />} />

                  {/* Dashboard de métricas y reportes */}
                  <Route path="dashboard" element={<AdminDashboard />} />

                  {/* CRUD de inventario de productos */}
                  <Route path="productos" element={<AdminProductos />} />

                  {/* Gestión de estados de pedidos */}
                  <Route path="pedidos" element={<AdminPedidos />} />
                </Route>

                {/* ── Redirecciones por defecto ────────────────────────── */}
                <Route path="/"  element={<Navigate to="/catalogo" replace />} />
                <Route path="*"  element={<Navigate to="/catalogo" replace />} />

              </Routes>
            </main>

            {/* Footer global */}
            <Footer />

          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App