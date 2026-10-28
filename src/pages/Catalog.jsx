import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProductos, getCategorias } from '../api/productosApi'
import { agregarItem } from '../api/carritoApi'
import { getImagenProducto } from '../utils/imageUtils'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'
import Pagination from '../components/ui/Pagination'
import { Search, Droplets, Leaf, Sun, ChevronDown, ShoppingBag, Filter, FilterX } from 'lucide-react'
import { getCategoryVisual } from '../utils/categoryVisuals'

/**
 * Componente principal del catálogo de comercio electrónico de Plantopolis.
 * Integra filtrado botánico multi-criterio (categorías consolidadas, requerimiento de luz,
 * frecuencia de riego, búsqueda por texto y rango de precio) con soporte completo de i18n.
 * 
 * @returns {JSX.Element} Vista del catálogo botánico con grid de productos e información esencial.
 */
export default function Catalog() {
  const { t } = useLanguage()
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  
  // Nuevo estado para mostrar/ocultar barra lateral
  const [mostrarFiltros, setMostrarFiltros] = useState(true)

  const [filtros, setFiltros] = useState({
    nombre:      '',
    idCategoria: '',
    luz:         '',
    riego:       '',
    precioMin:   '',
    precioMax:   '',
    page:        0,
    size:        24 // Incrementado para mostrar 24 productos
  })

  // Lógica para detectar scroll y ocultar/mostrar botón flotante
  const [showFloating, setShowFloating] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowFloating(false)
      } else {
        setShowFloating(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    getCategorias()
      .then(r => {
        const unicas = Array.from(
          new Map(r.data.map(c => [c.nombreCategoria, c])).values()
        ).sort((a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria))
        setCategorias(unicas)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    getProductos(filtros)
      .then(r => {
        setProductos(r.data.content ?? [])
        setTotalPages(r.data.totalPages ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filtros])

  const handleFiltro = (campo, valor) =>
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      ...(campo !== 'page' && { page: 0 })
    }))

  const limpiarFiltros = () =>
    setFiltros({
      nombre: '', idCategoria: '', luz: '', riego: '',
      precioMin: '', precioMax: '', page: 0, size: 24
    })

  const hayFiltros = filtros.nombre || filtros.idCategoria ||
                     filtros.luz || filtros.riego || filtros.precioMin || filtros.precioMax

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-100/50 dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/20 relative z-0 overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-green-300/20 dark:bg-green-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-teal-300/20 dark:bg-teal-600/5 blur-[100px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 relative z-10">
      
        <div className="mb-6 border-b border-green-200/60 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-emerald-900 dark:text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-2xl shadow-sm">
                <Leaf className="text-green-600 dark:text-green-400" size={36} strokeWidth={2.5} />
              </div>
              {t('catalog.title')}
            </h1>
            <p className="text-emerald-700/80 dark:text-slate-400 mt-3 font-medium text-lg">
              {t('catalog.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <p className="hidden md:block text-sm font-bold text-emerald-600 dark:text-slate-500 bg-white/60 dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
              {t('common.resultsCount', { count: productos.length })}
            </p>
            <button 
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 border border-green-500"
            >
              {mostrarFiltros ? (
                <><FilterX size={18} /> {t('catalog.hideFilters')}</>
              ) : (
                <><Filter size={18} /> {t('catalog.showFilters')}</>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8 transition-all duration-300">
          
          {/* Top Bar Filters - Colapsable */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden origin-top ${mostrarFiltros ? 'opacity-100 max-h-[800px]' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 rounded-3xl p-6 shadow-xl shadow-green-900/5 w-full">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* 1. Búsqueda por Nombre */}
                <div className="w-full">
                  <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Search size={14} className="text-green-600 dark:text-green-500" /> {t('common.search')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('catalog.searchPlaceholder')}
                    value={filtros.nombre}
                    onChange={e => handleFiltro('nombre', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm
                               text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm"
                  />
                </div>

                {/* 2. Selector 1: Categorías Botánicas y de Insumos */}
                <div className="w-full">
                  <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Leaf size={14} className="text-green-600 dark:text-green-500" /> {t('catalog.category')}
                  </label>
                  <div className="relative">
                    <select
                      value={filtros.idCategoria}
                      onChange={e => handleFiltro('idCategoria', e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm
                                 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm font-medium truncate"
                    >
                      <option value="">{t('catalog.allCategories')}</option>
                      {categorias.map(c => (
                        <option key={c.idCategoria} value={c.idCategoria}>
                          {t('category.' + c.nombreCategoria, c.nombreCategoria)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* 3. Selector 2 (Filtro Clave 1): Requerimiento de Luz */}
                <div className="w-full">
                  <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Sun size={14} className="text-amber-500" /> {t('catalog.lightRequirement')}
                  </label>
                  <div className="relative">
                    <select
                      value={filtros.luz}
                      onChange={e => handleFiltro('luz', e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm
                                 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm font-medium"
                    >
                      <option value="">{t('catalog.allLight')}</option>
                      <option value="directa">{t('catalog.lightDirect')}</option>
                      <option value="indirecta">{t('catalog.lightIndirect')}</option>
                      <option value="sombra">{t('catalog.lightShade')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* 4. Selector 3 (Filtro Clave 2): Frecuencia de Riego */}
                <div className="w-full">
                  <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                    <Droplets size={14} className="text-blue-500" /> {t('catalog.wateringFrequency')}
                  </label>
                  <div className="relative">
                    <select
                      value={filtros.riego}
                      onChange={e => handleFiltro('riego', e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-8 text-sm
                                 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm font-medium"
                    >
                      <option value="">{t('catalog.allWatering')}</option>
                      <option value="escaso">{t('catalog.waterLow')}</option>
                      <option value="moderado">{t('catalog.waterModerate')}</option>
                      <option value="frecuente">{t('catalog.waterFrequent')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                {/* 5. Rango de Precio y Botón Limpiar */}
                <div className="w-full flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider">
                      {t('catalog.priceRange')}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder={t('catalog.minPrice')}
                        min="0"
                        value={filtros.precioMin}
                        onChange={e => handleFiltro('precioMin', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-2 py-2.5 text-xs sm:text-sm
                                   text-slate-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-center shadow-sm"
                      />
                      <span className="text-green-300 font-bold">-</span>
                      <input
                        type="number"
                        placeholder={t('catalog.maxPrice')}
                        min="0"
                        value={filtros.precioMax}
                        onChange={e => handleFiltro('precioMax', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-2 py-2.5 text-xs sm:text-sm
                                   text-slate-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-center shadow-sm"
                      />
                    </div>
                  </div>

                  {hayFiltros && (
                    <button
                      onClick={limpiarFiltros}
                      className="px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-xl text-xs sm:text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm shrink-0"
                      title={t('catalog.clearFilters')}
                    >
                      <FilterX size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Main Product Grid */}
        <div className="transition-all duration-300 w-full mt-2">
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 dark:border-green-500" />
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl">
              <Leaf className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
              <p className="font-bold text-lg text-slate-700 dark:text-slate-300">{t('catalog.noProducts')}</p>
              <p className="text-slate-500 dark:text-slate-500 mt-1 text-sm">{t('catalog.noProductsDesc')}</p>
              {hayFiltros && (
                <button onClick={limpiarFiltros} className="mt-4 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold text-sm">
                  {t('catalog.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grid de productos responsivo a ancho completo */}
              <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {productos.map(p => (
                  <ProductoCard key={p.idProducto} producto={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={filtros.page}
                    totalPages={totalPages}
                    onPageChange={page => handleFiltro('page', page)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

function ProductoCard({ producto: p }) {
  const navigate          = useNavigate()
  const { isAuth }        = useAuth()
  const { refreshCart, openCart } = useCart()
  const { t }             = useLanguage()

  const [agregando, setAgregando] = useState(false)
  const [mensaje,   setMensaje]   = useState(null)

  const imagenSrc = getImagenProducto(p.imagenUrl, p.categoria)

  const handleAgregar = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuth) {
      navigate('/login')
      return
    }

    setAgregando(true)
    setMensaje(null)

    try {
      await agregarItem(p.idProducto, 1)
      await refreshCart()
      openCart() // Open slide-over automatically
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al agregar'
      setMensaje({ tipo: 'error', texto: '❌ ' + msg })
      setTimeout(() => setMensaje(null), 2000)
    } finally {
      setAgregando(false)
    }
  }

  const sinStock = p.stock === 0

  return (
    <div
      onClick={() => navigate(`/producto/${p.idProducto}`)}
      className="group flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl overflow-hidden
                 border border-white dark:border-slate-800 hover:shadow-2xl hover:shadow-green-900/10 dark:hover:shadow-green-900/20 hover:-translate-y-2 hover:border-green-300 dark:hover:border-green-500/50 transition-all duration-300 cursor-pointer relative"
    >
      <div className="aspect-square bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden">
        <img
          src={imagenSrc}
          alt={p.nombreProducto}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={e => {
            e.target.onerror = null
            // Placeholder más orgánico y colorido (fondo dcfce7 verde claro, texto verde oscuro)
            e.target.src = `https://placehold.co/400x500/dcfce7/166534?text=${encodeURIComponent(p.nombreProducto)}`
          }}
        />
        
        {/* Badge de Categoría Botánica (esquina superior izquierda) */}
        {(() => {
          const visual = getCategoryVisual(p.categoria)
          const CategoryIcon = visual.Icon
          return (
            <div
              className={`absolute top-3.5 left-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl shadow-md border ${visual.badgeBgClass} group-hover:scale-110 transition-all duration-300 z-10 flex items-center justify-center`}
              title={t('category.' + p.categoria, p.categoria || '')}
            >
              <CategoryIcon size={18} strokeWidth={2.3} className={visual.colorClass} />
            </div>
          )
        })()}

        {sinStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
              {t('catalog.outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* Cuerpo de la tarjeta: Distribución equilibrada (Nombre arriba, Precio a la izquierda y Botón a la derecha) */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-10 justify-between gap-3">
        
        {/* Nombre del Producto */}
        <h3 className="font-extrabold text-slate-800 dark:text-white text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
          {t('product.name.' + p.nombreProducto, p.nombreProducto)}
        </h3>

        {/* Fila Inferior: Precio y Botón de Carrito alineados horizontalmente */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-3">
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight whitespace-nowrap">
            ${p.precio?.toLocaleString('es-CO')}
          </span>

          <button
            onClick={handleAgregar}
            disabled={sinStock || agregando}
            className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 group-hover:rotate-6 shrink-0"
            title={t('catalog.addToCart')}
          >
            {agregando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingBag size={20} />
            )}
          </button>
        </div>

        {mensaje && (
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-4 border z-20
                           ${mensaje.tipo === 'ok' ? 'bg-green-50/90 dark:bg-green-900/90 border-green-200 dark:border-green-700 text-green-700 dark:text-green-100' : 'bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-700 text-red-700 dark:text-red-100'}`}>
            {mensaje.texto}
          </div>
        )}
      </div>
    </div>
  )
}