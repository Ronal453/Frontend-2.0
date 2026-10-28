import { getImagenProducto } from '../utils/imageUtils'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { getProducto } from '../api/productosApi'
import { agregarItem } from '../api/carritoApi'

import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import Button from '../components/ui/Button'

// Iconos lucide-react
import { Sun, Droplets, Ruler, Package, Leaf, ChevronLeft, ShoppingCart, Info, Sparkles } from 'lucide-react'
import { getCategoryVisual } from '../utils/categoryVisuals'

/**
 * Botanical technical sheet and product detail page with dynamic translations.
 */
export default function ProductDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const { isAuth }      = useAuth()
  const { refreshCart, openCart } = useCart()
  const { t }           = useLanguage()

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
          {t('catalog.title')}
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-slate-900 dark:text-white truncate">{t('product.name.' + producto.nombreProducto, producto.nombreProducto)}</span>
      </nav>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 transition-all duration-700 ease-out transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* COLUMNA IZQUIERDA: IMAGEN */}
        <div className="flex justify-center lg:sticky lg:top-24 self-start">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-[420px] aspect-square bg-white dark:bg-slate-800 rounded-3xl overflow-hidden
                          flex items-center justify-center relative border border-slate-200 dark:border-slate-700 shadow-sm">

            {producto.imagenUrl ? (
              <img
                src={getImagenProducto(producto.imagenUrl, producto.categoria)}
                alt={t('product.name.' + producto.nombreProducto, producto.nombreProducto)}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={e => {
                  e.target.onerror = null
                  e.target.src = `https://placehold.co/600x600/f8fafc/94a3b8?text=${encodeURIComponent(producto.nombreProducto)}`
                }}
              />
            ) : (
              <Leaf className="text-slate-200 dark:text-slate-700" size={80} strokeWidth={1} />
            )}

            {/* Badge de Categoría Botánica en la esquina superior izquierda */}
            {producto.categoria && (() => {
              const visual = getCategoryVisual(producto.categoria)
              const CatIcon = visual.Icon
              return (
                <div
                  className={`absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl shadow-md border ${visual.badgeBgClass} z-10 flex items-center justify-center`}
                  title={t('category.' + producto.categoria, producto.categoria)}
                >
                  <CatIcon size={20} strokeWidth={2.3} className={visual.colorClass} />
                </div>
              )
            })()}

            {sinStock && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                <span className="bg-white text-slate-900 text-sm uppercase tracking-wider font-bold px-6 py-2 rounded-full shadow-lg">
                  {t('catalog.outOfStock')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN, COMPRA Y CUIDADOS */}
        <div className="flex flex-col pt-1 lg:pt-2">

          {/* Encabezado: Categoría, Tipo y Badge de Stock */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              {producto.categoria && (() => {
                const visual = getCategoryVisual(producto.categoria)
                const CatIcon = visual.Icon
                return (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400
                                   px-3 py-1 rounded-full font-bold uppercase tracking-wide border border-green-200/50 dark:border-green-800/50">
                    <CatIcon size={14} strokeWidth={2.2} className={visual.colorClass} />
                    {t('category.' + producto.categoria, producto.categoria)}
                  </span>
                )
              })()}
            </div>

            {/* Badge de disponibilidad compacto */}
            <div>
              {sinStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {t('catalog.outOfStock')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {producto.stock} {t('common.units', 'unidades')}
                </span>
              )}
            </div>
          </div>

          {/* Título de la Planta */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            {t('product.name.' + producto.nombreProducto, producto.nombreProducto)}
          </h1>

          {/* Precio */}
          <div className="flex items-baseline gap-3 mb-4">
            <p className="text-2xl sm:text-3xl font-black text-green-600 dark:text-green-400">
              ${producto.precio?.toLocaleString('es-CO')}
            </p>
          </div>

          {/* Descripción del Producto - Estilizada en tarjeta sutil y compacta */}
          {producto.descripcion && (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                {t('product.desc.' + producto.nombreProducto, producto.descripcion)}
              </p>
            </div>
          )}

          {/* Fila de Compra Inmediata: Cantidad y Botón de Agregar */}
          {!sinStock && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm w-32 shrink-0">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-3.5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-lg select-none"
                  aria-label={t('product.decreaseQuantity', 'Disminuir cantidad')}
                >−</button>
                <span className="font-bold text-slate-900 dark:text-white w-8 text-center text-sm">
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  className="px-3.5 py-2.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-lg select-none"
                  aria-label={t('product.increaseQuantity', 'Aumentar cantidad')}
                >+</button>
              </div>

              <div className="flex-1">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleAgregar}
                  loading={agregando}
                  disabled={sinStock}
                  className="py-2.5 shadow-md shadow-green-500/20"
                >
                  <span className="flex items-center justify-center gap-2 font-bold text-sm sm:text-base">
                    <ShoppingCart size={18} />
                    {t('product.addToCart')}
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Mensaje de feedback tras agregar al carrito */}
          {mensaje && (
            <div className={`mb-4 p-3 rounded-xl text-sm text-center font-medium border
                            ${mensaje.tipo === 'ok'
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
              {mensaje.texto}
            </div>
          )}

          {/* Ficha Rápida de Especificaciones (Luz, Riego, Tamaño) en 3 columnas compactas */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {producto.luz && (
              <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <Sun className="text-amber-500 mb-1" size={18} />
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{t('catalog.light')}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 mt-0.5 leading-snug">
                  {t('care.light.' + producto.luz, producto.luz)}
                </span>
              </div>
            )}

            {producto.riego && (
              <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <Droplets className="text-blue-500 mb-1" size={18} />
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{t('catalog.water')}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 mt-0.5 leading-snug">
                  {t('care.water.' + producto.riego, producto.riego)}
                </span>
              </div>
            )}

            {producto.tamanioEstimado && (
              <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60">
                <Ruler className="text-indigo-500 mb-1" size={18} />
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{t('product.sizeDimension')}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 mt-0.5 leading-snug">
                  {producto.tamanioEstimado}
                </span>
              </div>
            )}
          </div>

          {/* Guía Botánica / Consejos de Cuidados */}
          {producto.cuidados && (
            <div className="flex items-start gap-3 bg-green-50/60 dark:bg-green-950/20 p-3.5 rounded-2xl border border-green-200/50 dark:border-green-800/30">
              <Sparkles className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-green-800 dark:text-green-400 uppercase tracking-wider mb-0.5">
                  {t('product.careGuide')}
                </p>
                <p className="text-xs sm:text-sm text-green-800/90 dark:text-green-300/80 leading-relaxed">
                  {t('product.care.' + producto.nombreProducto, producto.cuidados)}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}