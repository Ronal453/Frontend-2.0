import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login         from './pages/Login'
import Register      from './pages/Register'
import Catalog       from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import MisPedidos    from './pages/MisPedidos'
import DetallePedido from './pages/DetallePedido'

import AdminDashboard from './pages/AdminDashboard'
import AdminProductos from './pages/AdminProductos'
import AdminPedidos   from './pages/AdminPedidos'
import AdminUsuarios  from './pages/AdminUsuarios'   // ← NUEVO (HU9)

import TrabajadorLayout  from './components/layout/TrabajadorLayout'
import TrabajadorRoute   from './components/TrabajadorRoute'
import TrabajadorKanban  from './pages/trabajador/TrabajadorKanban'
import TrabajadorLotes   from './pages/trabajador/TrabajadorLotes'
import TrabajadorMermas  from './pages/trabajador/TrabajadorMermas'

import Navbar      from './components/layout/Navbar'
import Footer      from './components/layout/Footer'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute   from './components/AdminRoute'
import AdminLayout  from './components/layout/AdminLayout'

import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1">
              <Routes>

                <Route path="/login"        element={<Login />} />
                <Route path="/registro"     element={<Register />} />
                <Route path="/catalogo"     element={<Catalog />} />
                <Route path="/producto/:id" element={<ProductDetail />} />

                <Route path="/carrito" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/pedidos" element={<PrivateRoute><MisPedidos /></PrivateRoute>} />
                <Route path="/pedidos/:id" element={<PrivateRoute><DetallePedido /></PrivateRoute>} />

                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="productos" element={<AdminProductos />} />
                  <Route path="pedidos" element={<AdminPedidos />} />
                  {/* [NUEVO — HU9] */}
                  <Route path="usuarios" element={<AdminUsuarios />} />
                </Route>

                {/* ── Panel del Trabajador ────────────────────── */}
                <Route path="/trabajador" element={<TrabajadorRoute><TrabajadorLayout /></TrabajadorRoute>}>
                  <Route index element={<Navigate to="tareas" replace />} />
                  <Route path="tareas" element={<TrabajadorKanban />} />
                  <Route path="kanban" element={<Navigate to="tareas" replace />} />
                  <Route path="lotes"  element={<TrabajadorLotes />} />
                  <Route path="mermas" element={<TrabajadorMermas />} />
                </Route>

                <Route path="/"  element={<Navigate to="/catalogo" replace />} />
                <Route path="*"  element={<Navigate to="/catalogo" replace />} />

              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App