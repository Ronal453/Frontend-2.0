import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../hooks/useAuth'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuth } = useAuth()
  const [producto, setProducto] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [loading, setLoading]   = useState(true)
  const [msg, setMsg]           = useState('')

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(r => setProducto(r.data))
      .catch(() => navigate('/catalogo'))
      .finally(() => setLoading(false))
  }, [id])

  const agregarAlCarrito = async () => {
    if (!isAuth) return navigate('/login')
    try {
      await api.post('/carrito/items', { idProducto: id, cantidad })
      setMsg('✅ Agregado al carrito')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      setMsg('❌ ' + (e.response?.data?.mensaje || 'Error'))
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700" />
    </div>
  )

  if (!producto) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen */}
        <div className="bg-green-50 rounded-2xl overflow-hidden h-80
                        flex items-center justify-center">
          {producto.imagenUrl ? (
            <img src={producto.imagenUrl} alt={producto.nombreProducto}
                 className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">🌿</span>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-green-600 text-sm font-medium mb-1">
            {producto.categoria}
          </p>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {producto.nombreProducto}
          </h1>
          <p className="text-3xl font-bold text-green-800 mb-4">
            ${producto.precio?.toLocaleString('es-CO')}
          </p>
          <p className="text-gray-600 mb-4">{producto.descripcion}</p>

          {/* Detalles */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            {producto.luz && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="font-medium text-yellow-800">☀️ Luz</p>
                <p className="text-yellow-700">{producto.luz}</p>
              </div>
            )}
            {producto.riego && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-800">💧 Riego</p>
                <p className="text-blue-700">{producto.riego}</p>
              </div>
            )}
          </div>

          {/* Cantidad y botón */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      className="px-3 py-2 hover:bg-gray-100">−</button>
              <span className="px-4 py-2 font-medium">{cantidad}</span>
              <button onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                      className="px-3 py-2 hover:bg-gray-100">+</button>
            </div>
            <span className="text-sm text-gray-500">
              Stock: {producto.stock}
            </span>
          </div>

          <button
            onClick={agregarAlCarrito}
            disabled={producto.stock === 0}
            className="w-full bg-green-700 text-white py-3 rounded-xl
                       font-semibold hover:bg-green-800 disabled:opacity-50
                       transition-colors"
          >
            {producto.stock === 0 ? 'Sin stock' : '🛒 Agregar al carrito'}
          </button>

          {msg && (
            <p className="mt-3 text-center text-sm font-medium">{msg}</p>
          )}
        </div>
      </div>
    </div>
  )
}