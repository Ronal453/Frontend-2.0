import { getImagenProducto } from '../utils/imageUtils'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { getProducto } from '../api/productosApi'
import { agregarItem } from '../api/carritoApi'

import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'

// Iconos lucide-react
import { Sun, Droplets, Ruler, Package, Leaf, ChevronLeft, ShoppingCart, Info } from 'lucide-react'

export default function ProductDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const { isAuth }      = useAuth()
  const { refreshCart, openCart } = useCart()

  const [producto,  setProducto]  = useState(null)
  const [cantidad,  setCantidad]  = useState(1)
  const [loading,   setLoading]   = useState(true)
  const [agregando, setAgregando] = useState(false)
  const [mensaje,   setMensaje]   = useState(null)
  
  // Para la animación de entrada
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    getProducto(id)
      .then(r => {
        setProducto(r.data)
        // Disparar animación un momento después de cargar
        setTimeout(() => setIsMounted(true), 50)
      })
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
      openCart() // Abre el carrito slide-over automáticamente
      setMensaje({ tipo: 'ok', texto: `Se agregó ${cantidad} unidad(es) exitosamente` })
    } catch (e) {
      setMensaje({
        tipo: 'error',
        texto: e.response?.data?.mensaje || 'Error al agregar al carrito'
      })
    } finally {
      setAgregando(false)
      setTimeout(() => setMensaje(null), 3000)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-32 min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-500" />
    </div>
  )

  if (!producto) return null

  const sinStock = producto.stock === 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Navegación Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
        <button 
          onClick={() => navigate('/catalogo')} 
          className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          <ChevronLeft size={16} />
          Catálogo
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white truncate">{producto.nombreProducto}</span>
      </nav>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 transition-all duration-700 ease-out transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-sm xl:max-w-md bg-white dark:bg-slate-800 rounded-3xl overflow-hidden aspect-[4/5]
                          flex items-center justify-center relative border border-slate-200 dark:border-slate-700 shadow-sm transition-transform duration-500 hover:scale-[1.02]">

            {producto.imagenUrl ? (
              <img
                src={getImagenProducto(producto.imagenUrl, producto.categoria)}
                alt={producto.nombreProducto}
                className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                onError={e => {
                  e.target.onerror = null
                  e.target.src = `https://placehold.co/600x800/f8fafc/94a3b8?text=${encodeURIComponent(producto.nombreProducto)}`
                }}
              />
            ) : (
              <Leaf className="text-slate-200 dark:text-slate-700" size={80} strokeWidth={1} />
            )}

            {sinStock && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-white text-slate-900 text-sm uppercase tracking-wider font-bold px-6 py-2 rounded-full shadow-lg">
                  Agotado
                </span>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: DETALLES */}
        <div className="flex flex-col pt-2 lg:pt-6">

          <div className="flex gap-2 mb-4">
            {producto.categoria && (
              <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400
                               px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-green-200/50 dark:border-green-800/50">
                {producto.categoria}
              </span>
            )}
            {producto.tipo && (
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                               px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                {producto.tipo}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            {producto.nombreProducto}
          </h1>

          <p className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400 mb-6">
            ${producto.precio?.toLocaleString('es-CO')}
          </p>

          {producto.descripcion && (
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed text-lg">
              {producto.descripcion}
            </p>
          )}

          {/* Características en Grid Minimalista */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {producto.luz && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <Sun className="text-amber-500 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Luz</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 leading-snug">{producto.luz}</p>
                </div>
              </div>
            )}

            {producto.riego && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <Droplets className="text-blue-500 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Riego</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 leading-snug">{producto.riego}</p>
                </div>
              </div>
            )}

            {producto.tamanioEstimado && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <Ruler className="text-indigo-500 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Tamaño</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 leading-snug">{producto.tamanioEstimado}</p>
                </div>
              </div>
            )}

            {producto.stock > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <Package className="text-emerald-500 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Stock</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 leading-snug">{producto.stock} uds.</p>
                </div>
              </div>
            )}
          </div>

          {producto.cuidados && (
            <div className="flex items-start gap-3 bg-green-50/50 dark:bg-green-900/10 p-5 rounded-2xl mb-8 border border-green-100 dark:border-green-900/30">
              <Info className="text-green-600 dark:text-green-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-green-800 dark:text-green-400 mb-1">Cuidados adicionales</p>
                <p className="text-green-700 dark:text-green-300/80 text-sm leading-relaxed">{producto.cuidados}</p>
              </div>
            </div>
          )}

          {!sinStock && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-auto">
              
              <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm sm:w-32">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-4 py-3 sm:py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >−</button>
                <span className="font-bold text-slate-900 dark:text-white w-8 text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  className="px-4 py-3 sm:py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >+</button>
              </div>

              <div className="flex-1">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleAgregar}
                  loading={agregando}
                  disabled={sinStock}
                  className="py-3 sm:py-2 shadow-md shadow-green-500/20"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    Agregar al carrito
                  </span>
                </Button>
              </div>
            </div>
          )}

          {mensaje && (
            <div className={`mt-4 p-4 rounded-xl text-sm text-center font-medium border
                            ${mensaje.tipo === 'ok'
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
              {mensaje.texto}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}