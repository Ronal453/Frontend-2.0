import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Catalog      from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Checkout     from './pages/Checkout'
import MisPedidos   from './pages/MisPedidos'
import DetallePedido from './pages/DetallePedido'
import Navbar       from './components/layout/Navbar'
import Footer       from './components/layout/Footer'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Públicas */}
              <Route path="/login"        element={<Login />} />
              <Route path="/registro"     element={<Register />} />
              <Route path="/catalogo"     element={<Catalog />} />
              <Route path="/producto/:id" element={<ProductDetail />} />

              {/* Privadas */}
              <Route path="/checkout" element={
                <PrivateRoute><Checkout /></PrivateRoute>
              }/>
              <Route path="/pedidos" element={
                <PrivateRoute><MisPedidos /></PrivateRoute>
              }/>
              <Route path="/pedidos/:id" element={
                <PrivateRoute><DetallePedido /></PrivateRoute>
              }/>

              {/* Default */}
              <Route path="/"  element={<Navigate to="/catalogo" />} />
              <Route path="*"  element={<Navigate to="/catalogo" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
