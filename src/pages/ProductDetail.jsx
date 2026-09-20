import { getImagenProducto } from '../utils/imageUtils'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { getProducto } from '../api/productosApi'
import { agregarItem } from '../api/carritoApi'

import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'

export default function ProductDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const { isAuth }      = useAuth()
  const { refreshCart } = useCart()

  const [producto,  setProducto]  = useState(null)
  const [cantidad,  setCantidad]  = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [agregando, setAgregando] = useState(false)
  const [mensaje,   setMensaje]   = useState(null)

  useEffect(() => {
    getProducto(id)
      .then(r => setProducto(r.data))
      .catch(() => navigate('/catalogo'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAgregar = async () => {
    if (!isAuth) return navigate('/login')

    setAgregando(true)
    setMensaje(null)

    try {
      await agregarItem(Number(id), cantidad)
      await refreshCart()
      setMensaje({ tipo: 'ok', texto: `✅ ${cantidad} unidad(es) agregada(s) al carrito` })
    } catch (e) {
      setMensaje({
        tipo: 'error',
        texto: '❌ ' + (e.response?.data?.mensaje || 'Error al agregar al carrito')
      })
    } finally {
      setAgregando(false)
      setTimeout(() => setMensaje(null), 3000)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700 dark:border-green-500" />
    </div>
  )

  if (!producto) return null

  const sinStock = producto.stock === 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex gap-2">
        <Link to="/catalogo" className="hover:text-green-700 dark:hover:text-green-400">Catálogo</Link>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200">{producto.nombreProducto}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className="bg-green-50 dark:bg-gray-800 rounded-2xl overflow-hidden aspect-[3/4]
                        flex items-center justify-center relative">

          {producto.imagenUrl ? (
            <img
              src={getImagenProducto(producto.imagenUrl, producto.categoria)}
              alt={producto.nombreProducto}
              className="w-full h-full object-cover"
              onError={e => {
                e.target.onerror = null
                e.target.src = `https://placehold.co/600x800/d1fae5/166534?text=${encodeURIComponent(producto.nombreProducto)}`
              }}
            />
          ) : (
            <span className="text-9xl">🌿</span>
          )}

          {sinStock && (
            <div className="absolute inset-0 bg-black bg-opacity-40
                            flex items-center justify-center">
              <span className="bg-red-500 text-white text-lg
                               font-bold px-4 py-2 rounded-full">
                Sin stock
              </span>
            </div>
          )}
        </div>

        <div>

          <div className="flex gap-2 mb-2">
            {producto.categoria && (
              <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300
                               px-2 py-1 rounded-full font-medium">
                {producto.categoria}
              </span>
            )}
            {producto.tipo && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                               px-2 py-1 rounded-full font-medium">
                {producto.tipo}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {producto.nombreProducto}
          </h1>

          <p className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">
            ${producto.precio?.toLocaleString('es-CO')}
          </p>

          {producto.descripcion && (
            <p className="text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
              {producto.descripcion}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-5">

            {producto.luz && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-3 rounded-xl">
                <p className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-0.5">☀️ Luz</p>
                <p className="text-yellow-700 dark:text-yellow-400 text-sm">{producto.luz}</p>
              </div>
            )}

            {producto.riego && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-xl">
                <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-0.5">💧 Riego</p>
                <p className="text-blue-700 dark:text-blue-400 text-sm">{producto.riego}</p>
              </div>
            )}

            {producto.tamanioEstimado && (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl">
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-0.5">📏 Tamaño</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{producto.tamanioEstimado}</p>
              </div>
            )}

            {producto.stock > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-3 rounded-xl">
                <p className="font-semibold text-green-800 dark:text-green-300 text-sm mb-0.5">📦 Stock</p>
                <p className="text-green-700 dark:text-green-400 text-sm">{producto.stock} disponibles</p>
              </div>
            )}
          </div>

          {producto.cuidados && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-5">
              <p className="font-semibold text-green-800 dark:text-green-300 mb-1">🌱 Cuidados</p>
              <p className="text-green-700 dark:text-green-400 text-sm leading-relaxed">{producto.cuidados}</p>
            </div>
          )}

          {!sinStock && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad:</span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">

                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-colors"
                >−</button>

                <span className="px-4 py-2 font-semibold border-x border-gray-300 dark:border-gray-600
                                 min-w-[3rem] text-center text-gray-800 dark:text-gray-100">
                  {cantidad}
                </span>

                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-600 dark:text-gray-300 transition-colors"
                >+</button>
              </div>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            onClick={handleAgregar}
            loading={agregando}
            disabled={sinStock}
          >
            {sinStock ? '❌ Sin stock' : '🛒 Agregar al carrito'}
          </Button>

          {mensaje && (
            <div className={`mt-3 p-3 rounded-lg text-sm text-center
                            ${mensaje.tipo === 'ok'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>
              {mensaje.texto}
              {mensaje.tipo === 'ok' && (
                <Link to="/carrito" className="ml-2 underline font-medium">
                  Ver carrito →
                </Link>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}