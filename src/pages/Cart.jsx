import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCarrito,
  actualizarCantidad,
  eliminarItem,
  vaciarCarrito
} from '../api/carritoApi'
import Button from '../components/ui/Button'

export default function Cart() {
  const navigate = useNavigate()
  const [carrito, setCarrito]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [actualizando, setActualizando] = useState(null) // id del ítem en proceso

  // ── Cargar carrito ──────────────────────────────────────
  useEffect(() => {
    cargarCarrito()
  }, [])

  const cargarCarrito = async () => {
    try {
      const res = await getCarrito()
      setCarrito(res.data)
    } catch (e) {
      setError('No se pudo cargar el carrito')
    } finally {
      setLoading(false)
    }
  }

  // ── Actualizar cantidad ─────────────────────────────────
  const handleCantidad = async (idItem, nuevaCantidad) => {
    if (nuevaCantidad < 0) return
    setActualizando(idItem)
    try {
      const res = await actualizarCantidad(idItem, nuevaCantidad)
      setCarrito(res.data)
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al actualizar cantidad')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActualizando(null)
    }
  }

  // ── Eliminar ítem ───────────────────────────────────────
  const handleEliminar = async (idItem) => {
    setActualizando(idItem)
    try {
      const res = await eliminarItem(idItem)
      setCarrito(res.data)
    } catch (e) {
      setError('Error al eliminar el producto')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActualizando(null)
    }
  }

  // ── Vaciar carrito ──────────────────────────────────────
  const handleVaciar = async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return
    try {
      await vaciarCarrito()
      await cargarCarrito()
    } catch (e) {
      setError('Error al vaciar el carrito')
    }
  }

  // ── Loading ─────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700" />
    </div>
  )

  // ── Carrito vacío ───────────────────────────────────────
  const estaVacio = !carrito?.items || carrito.items.length === 0

  if (estaVacio) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">
        Tu carrito está vacío
      </h2>
      <p className="text-gray-500 mb-6">
        Agrega plantas desde el catálogo para empezar tu compra
      </p>
      <Link to="/catalogo">
        <Button size="lg">Ver catálogo 🌿</Button>
      </Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        🛒 Mi carrito
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700
                        rounded-lg p-3 mb-4 text-sm">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Lista de ítems ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">

          {/* Encabezado */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">
              {carrito.totalItems} producto(s)
            </span>
            <button
              onClick={handleVaciar}
              className="text-sm text-red-500 hover:text-red-700
                         hover:underline transition-colors"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Tarjetas de ítems */}
          {carrito.items.map(item => (
            <div key={item.idItem}
                 className="bg-white border border-gray-100 rounded-xl
                            p-4 flex gap-4 shadow-sm">

              {/* Imagen */}
              <div className="w-20 h-20 bg-green-50 rounded-lg
                              overflow-hidden flex-shrink-0 flex
                              items-center justify-center">
                {item.imagenUrl ? (
                  <img src={item.imagenUrl} alt={item.nombreProducto}
                       className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🌿</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">
                  {item.nombreProducto}
                </h3>
                <p className="text-green-700 font-medium text-sm">
                  ${item.precioUnitario?.toLocaleString('es-CO')} c/u
                </p>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleCantidad(item.idItem, item.cantidad - 1)}
                    disabled={actualizando === item.idItem}
                    className="w-7 h-7 rounded-full border border-gray-300
                               flex items-center justify-center text-gray-600
                               hover:border-green-500 hover:text-green-700
                               disabled:opacity-50 transition-colors font-bold"
                  >
                    −
                  </button>

                  <span className="w-8 text-center font-semibold text-gray-800">
                    {actualizando === item.idItem ? (
                      <span className="inline-block w-4 h-4 border-2
                                       border-green-500 border-t-transparent
                                       rounded-full animate-spin" />
                    ) : item.cantidad}
                  </span>

                  <button
                    onClick={() => handleCantidad(item.idItem, item.cantidad + 1)}
                    disabled={actualizando === item.idItem}
                    className="w-7 h-7 rounded-full border border-gray-300
                               flex items-center justify-center text-gray-600
                               hover:border-green-500 hover:text-green-700
                               disabled:opacity-50 transition-colors font-bold"
                  >
                    +
                  </button>

                  <button
                    onClick={() => handleEliminar(item.idItem)}
                    disabled={actualizando === item.idItem}
                    className="ml-2 text-red-400 hover:text-red-600
                               text-sm disabled:opacity-50 transition-colors"
                    title="Eliminar del carrito"
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-800">
                  ${item.subtotal?.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Resumen del pedido ─────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl
                          p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-800 text-lg mb-4">
              Resumen
            </h2>

            {/* Desglose */}
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {carrito.items.map(item => (
                <div key={item.idItem} className="flex justify-between">
                  <span className="truncate mr-2">
                    {item.nombreProducto} ×{item.cantidad}
                  </span>
                  <span className="flex-shrink-0">
                    ${item.subtotal?.toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>

            {/* Separador */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between font-bold text-lg text-gray-800">
                <span>Total</span>
                <span className="text-green-800">
                  ${carrito.total?.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            {/* Botón checkout */}
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Ir al pago ✅
            </Button>

            {/* Seguir comprando */}
            <Link to="/catalogo"
                  className="block text-center text-sm text-green-700
                             hover:underline mt-3">
              ← Seguir comprando
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
