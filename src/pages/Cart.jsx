import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCarrito,
  actualizarCantidad,
  eliminarItem,
  vaciarCarrito
} from '../api/carritoApi'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'

export default function Cart() {
  const navigate = useNavigate()
  const { refreshCart, clearCart } = useCart()

  const [carrito,     setCarrito]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [actualizando,setActualizando]= useState(null)

  useEffect(() => {
    cargarCarrito()
  }, [])

  const cargarCarrito = async () => {
    setLoading(true)
    try {
      const res = await getCarrito()
      setCarrito(res.data)
      if (res.data.totalItems === 0) {
        clearCart()
      } else {
        refreshCart()
      }
    } catch {
      setError('No se pudo cargar el carrito')
      clearCart()
    } finally {
      setLoading(false)
    }
  }

  const handleCantidad = async (idItem, nuevaCantidad) => {
    if (nuevaCantidad < 0) return
    setActualizando(idItem)
    setError('')
    try {
      const res = await actualizarCantidad(idItem, nuevaCantidad)
      setCarrito(res.data)
      if (res.data.totalItems === 0) {
        clearCart()
      } else {
        refreshCart()
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al actualizar cantidad')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActualizando(null)
    }
  }

  const handleEliminar = async (idItem) => {
    setActualizando(idItem)
    setError('')
    try {
      const res = await eliminarItem(idItem)
      setCarrito(res.data)
      if (res.data.totalItems === 0) {
        clearCart()
      } else {
        refreshCart()
      }
    } catch {
      setError('Error al eliminar el producto')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActualizando(null)
    }
  }

  const handleVaciar = async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return
    try {
      await vaciarCarrito()
      clearCart()
      await cargarCarrito()
    } catch {
      setError('Error al vaciar el carrito')
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700 dark:border-green-500" />
    </div>
  )

  const estaVacio = !carrito?.items || carrito.items.length === 0

  if (estaVacio) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
        Tu carrito está vacío
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Agrega plantas desde el catálogo para empezar tu compra
      </p>
      <Link to="/catalogo">
        <Button size="lg">Ver catálogo 🌿</Button>
      </Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-6">
        🛒 Mi carrito
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800
                        text-red-700 dark:text-red-400
                        rounded-lg p-3 mb-4 text-sm">
          ⚠ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-3">

          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {carrito.totalItems} producto(s)
            </span>
            <button
              onClick={handleVaciar}
              className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300
                         hover:underline transition-colors"
            >
              Vaciar carrito
            </button>
          </div>

          {carrito.items.map(item => (
            <div key={item.idItem}
                 className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                            p-4 flex gap-4 shadow-sm dark:shadow-none">

              <div className="w-20 h-20 bg-green-50 dark:bg-gray-900 rounded-lg
                              overflow-hidden flex-shrink-0 flex
                              items-center justify-center">
                {item.imagenUrl
                  ? <img src={item.imagenUrl} alt={item.nombreProducto}
                         className="w-full h-full object-cover" />
                  : <span className="text-3xl">🌿</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {item.nombreProducto}
                </h3>
                <p className="text-green-700 dark:text-green-400 font-medium text-sm">
                  ${item.precioUnitario?.toLocaleString('es-CO')} c/u
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      handleCantidad(item.idItem, item.cantidad - 1)}
                    disabled={actualizando === item.idItem}
                    className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600
                               flex items-center justify-center text-gray-600 dark:text-gray-300
                               hover:border-green-500 hover:text-green-700 dark:hover:text-green-400
                               disabled:opacity-50 transition-colors font-bold"
                  >−</button>

                  <span className="w-8 text-center font-semibold text-gray-800 dark:text-gray-100">
                    {actualizando === item.idItem
                      ? <span className="inline-block w-4 h-4 border-2
                                         border-green-500 border-t-transparent
                                         rounded-full animate-spin" />
                      : item.cantidad}
                  </span>

                  <button
                    onClick={() =>
                      handleCantidad(item.idItem, item.cantidad + 1)}
                    disabled={actualizando === item.idItem}
                    className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-600
                               flex items-center justify-center text-gray-600 dark:text-gray-300
                               hover:border-green-500 hover:text-green-700 dark:hover:text-green-400
                               disabled:opacity-50 transition-colors font-bold"
                  >+</button>

                  <button
                    onClick={() => handleEliminar(item.idItem)}
                    disabled={actualizando === item.idItem}
                    className="ml-2 text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400
                               text-sm disabled:opacity-50 transition-colors"
                    title="Eliminar del carrito"
                  >🗑</button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  ${item.subtotal?.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                          p-5 shadow-sm dark:shadow-none sticky top-24">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-4">
              Resumen
            </h2>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
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

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
              <div className="flex justify-between font-bold
                              text-lg text-gray-800 dark:text-gray-100">
                <span>Total</span>
                <span className="text-green-800 dark:text-green-400">
                  ${carrito.total?.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              Ir al pago ✅
            </Button>

            <Link to="/catalogo"
                  className="block text-center text-sm text-green-700 dark:text-green-400
                             hover:underline mt-3">
              ← Seguir comprando
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}