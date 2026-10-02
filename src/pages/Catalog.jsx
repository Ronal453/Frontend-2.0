import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProductos, getCategorias, getTipos } from '../api/productosApi'
import { agregarItem } from '../api/carritoApi'
import { getImagenProducto } from '../utils/imageUtils'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'
import Pagination from '../components/ui/Pagination'
import { Search, Droplets, Leaf, Sun, ChevronDown, ShoppingBag, Filter, FilterX } from 'lucide-react'

export default function Catalog() {
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos,      setTipos]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  
  // Nuevo estado para mostrar/ocultar barra lateral
  const [mostrarFiltros, setMostrarFiltros] = useState(true)

  const [filtros, setFiltros] = useState({
    nombre:      '',
    idCategoria: '',
    idTipo:      '',
    precioMin:   '',
    precioMax:   '',
    page:        0,
    size:        15 // Incrementado para la nueva grilla
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

    getTipos()
      .then(r => setTipos(r.data))
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
      nombre: '', idCategoria: '', idTipo: '',
      precioMin: '', precioMax: '', page: 0, size: 15
    })

  const hayFiltros = filtros.nombre || filtros.idCategoria ||
                     filtros.idTipo || filtros.precioMin || filtros.precioMax

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-100/50 dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/20 relative z-0 overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-green-300/20 dark:bg-green-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-teal-300/20 dark:bg-teal-600/5 blur-[100px]" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 relative z-10">
      
        {/* Botón flotante que reacciona al scroll */}
        <div className={`fixed right-4 sm:right-8 z-40 transition-all duration-300 ease-in-out ${showFloating ? 'top-[88px] translate-y-0' : 'top-0 -translate-y-[150%]'}`}>
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600/90 hover:bg-green-700 dark:bg-green-600/80 dark:hover:bg-green-500 text-white backdrop-blur-md rounded-full text-sm font-bold shadow-lg shadow-green-600/30 transition-all transform hover:scale-105 active:scale-95 border border-green-500/50"
          >
            {mostrarFiltros ? (
              <><FilterX size={18} /> Ocultar Filtros</>
            ) : (
              <><Filter size={18} /> Mostrar Filtros</>
            )}
          </button>
        </div>

        <div className="mb-6 border-b border-green-200/60 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-emerald-900 dark:text-white tracking-tight flex items-center gap-3 drop-shadow-sm">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-2xl shadow-sm">
                <Leaf className="text-green-600 dark:text-green-400" size={36} strokeWidth={2.5} />
              </div>
              Catálogo
            </h1>
            <p className="text-emerald-700/80 dark:text-slate-400 mt-3 font-medium text-lg">
              Encuentra la planta perfecta para tu ecosistema
            </p>
          </div>
          
          <div className="flex items-center gap-4 lg:hidden">
            <p className="text-sm font-bold text-emerald-600 dark:text-slate-500 bg-white/60 dark:bg-slate-800 px-3 py-1 rounded-full shadow-sm">
              {productos.length} resultados
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 transition-all duration-300">
          
          {/* Sticky Sidebar Filters - Colapsable */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${mostrarFiltros ? 'w-full lg:w-72 opacity-100' : 'w-0 h-0 lg:h-auto opacity-0'}`}>
            <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 rounded-3xl p-6 sticky top-24 shadow-xl shadow-green-900/5 w-full lg:w-72">
              
              <h2 className="font-extrabold text-emerald-900 dark:text-slate-100 mb-5 flex items-center gap-2 text-lg">
                <Search size={20} className="text-green-600 dark:text-green-500" />
                Explorar
              </h2>

              {/* Search */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Monstera..."
                  value={filtros.nombre}
                  onChange={e => handleFiltro('nombre', e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm
                             text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all shadow-sm"
                />
              </div>

              {/* Categories */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider">Categoría</label>
                <div className="relative">
                  <select
                    value={filtros.idCategoria}
                    onChange={e => handleFiltro('idCategoria', e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm
                               text-slate-900 dark:text-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm font-medium"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => (
                      <option key={c.idCategoria} value={c.idCategoria}>
                        {c.nombreCategoria}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider">Tipo</label>
                <div className="relative">
                  <select
                    value={filtros.idTipo}
                    onChange={e => handleFiltro('idTipo', e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm
                               text-slate-900 dark:text-slate-200 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all cursor-pointer shadow-sm font-medium"
                  >
                    <option value="">Todos los tipos</option>
                    {tipos.map(t => (
                      <option key={t.idTipo} value={t.idTipo}>
                        {t.nombreTipo}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-emerald-700 dark:text-slate-400 mb-2 uppercase tracking-wider">Rango de Precio</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min="0"
                    value={filtros.precioMin}
                    onChange={e => handleFiltro('precioMin', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-2 py-2.5 text-sm
                               text-slate-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-center shadow-sm"
                  />
                  <span className="text-green-300 font-bold">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min="0"
                    value={filtros.precioMax}
                    onChange={e => handleFiltro('precioMax', e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 rounded-xl px-2 py-2.5 text-sm
                               text-slate-900 dark:text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-center shadow-sm"
                  />
                </div>
              </div>

              {hayFiltros && (
                <button
                  onClick={limpiarFiltros}
                  className="w-full py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

        {/* Main Product Grid */}
        <div className={`transition-all duration-300 min-w-0 ${mostrarFiltros ? 'flex-1' : 'w-full'}`}>
          {loading ? (
            <div className="flex justify-center py-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 dark:border-green-500" />
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700 rounded-3xl">
              <Leaf className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={48} />
              <p className="font-bold text-lg text-slate-700 dark:text-slate-300">No se encontraron plantas</p>
              <p className="text-slate-500 dark:text-slate-500 mt-1 text-sm">Prueba ajustando o limpiando los filtros.</p>
              {hayFiltros && (
                <button onClick={limpiarFiltros} className="mt-4 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-bold text-sm">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Productos más pequeños, ajustando el grid a más columnas */}
              <div className={`grid gap-4 sm:gap-6 ${mostrarFiltros ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                {productos.map(p => (
                  <ProductoCard key={p.idProducto} producto={p} tipos={tipos} />
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
        
        {/* Type Icon Badge */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm border border-white dark:border-slate-700 group-hover:scale-110 transition-transform">
          {p.tipo?.toLowerCase().includes('suculenta') || p.categoria?.toLowerCase().includes('cactus') ? (
             <Sun size={20} className="text-amber-500 drop-shadow-sm" />
          ) : (
             <Droplets size={20} className="text-cyan-500 drop-shadow-sm" />
          )}
        </div>

        {sinStock && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-10">
        
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-lg leading-tight line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
            {p.nombreProducto}
          </h3>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-lg">
            ${p.precio?.toLocaleString('es-CO')}
          </span>
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">
          {p.tipo || 'Planta'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {p.categoria && (
              <span className="bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 text-[10px] font-bold tracking-wider px-2 py-1 rounded-md">
                {p.categoria}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAgregar}
            disabled={sinStock || agregando}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 group-hover:rotate-12"
            title="Agregar al carrito"
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