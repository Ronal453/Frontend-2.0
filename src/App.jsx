import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── Páginas ───────────────────────────────────────────────
import Login          from './pages/Login'
import Register       from './pages/Register'
import Catalog        from './pages/Catalog'
import ProductDetail  from './pages/ProductDetail'
import Cart           from './pages/Cart'
import Checkout       from './pages/Checkout'
import MisPedidos     from './pages/MisPedidos'
import DetallePedido  from './pages/DetallePedido'

// ── Layout ────────────────────────────────────────────────
import Navbar         from './components/layout/Navbar'
import Footer         from './components/layout/Footer'
import PrivateRoute   from './components/PrivateRoute'

// ── Contexto de autenticación ────────────────────────────
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <AuthProvider>
      {/* CartProvider va dentro de AuthProvider para poder usar useAuth si fuera necesario */}
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gray-50">

            {/* Siempre visible arriba */}
            <Navbar />

            {/* Contenido de la página actual */}
            <main className="flex-1">
              <Routes>

                {/* ── Rutas públicas (sin login) ──────────── */}
                <Route path="/login"          element={<Login />} />
                <Route path="/registro"       element={<Register />} />
                <Route path="/catalogo"       element={<Catalog />} />
                <Route path="/producto/:id"   element={<ProductDetail />} />

                {/* ── Rutas privadas (requieren login) ───── */}
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

                {/* ── Redirecciones ───────────────────────── */}
                <Route path="/"  element={<Navigate to="/catalogo" replace />} />
                <Route path="*"  element={<Navigate to="/catalogo" replace />} />

              </Routes>
            </main>

            {/* Siempre visible abajo */}
            <Footer />

          </div>
        </BrowserRouter>
       </CartProvider>
    </AuthProvider>
  )
 }

 export default App