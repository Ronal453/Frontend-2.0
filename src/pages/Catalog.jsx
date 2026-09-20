import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProductos, getCategorias, getTipos } from '../api/productosApi'
import { agregarItem } from '../api/carritoApi'
import { getImagenProducto } from '../utils/imageUtils'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'

export default function Catalog() {
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos,      setTipos]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  const [filtros, setFiltros] = useState({
    nombre:      '',
    idCategoria: '',
    idTipo:      '',
    precioMin:   '',
    precioMax:   '',
    page:        0,
    size:        12
  })

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
      precioMin: '', precioMax: '', page: 0, size: 12
    })

  const hayFiltros = filtros.nombre || filtros.idCategoria ||
                     filtros.idTipo || filtros.precioMin || filtros.precioMax

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">
          🌿 Catálogo de plantas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Encuentra la planta perfecta para tu hogar
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border
                      border-gray-100 dark:border-gray-700 mb-8 space-y-3">

        <div className="flex gap-3 flex-wrap">

          <input
            type="text"
            placeholder="🔍 Buscar planta..."
            value={filtros.nombre}
            onChange={e => handleFiltro('nombre', e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                       bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                       placeholder-gray-400 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       flex-1 min-w-48"
          />

          <select
            value={filtros.idCategoria}
            onChange={e => handleFiltro('idCategoria', e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-w-48"
          >
            <option value="">🏷 Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.idCategoria} value={c.idCategoria}>
                {c.nombreCategoria}
              </option>
            ))}
          </select>

          <select
            value={filtros.idTipo}
            onChange={e => handleFiltro('idTipo', e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-w-40"
          >
            <option value="">🌱 Todos los tipos</option>
            {tipos.map(t => (
              <option key={t.idTipo} value={t.idTipo}>
                {t.nombreTipo}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 flex-wrap items-center">

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              💰 Precio:
            </label>
            <input
              type="number"
              placeholder="Mínimo"
              min="0"
              value={filtros.precioMin}
              onChange={e => handleFiltro('precioMin', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                         bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         w-32"
            />
            <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
            <input
              type="number"
              placeholder="Máximo"
              min="0"
              value={filtros.precioMax}
              onChange={e => handleFiltro('precioMax', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                         bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         w-32"
            />
          </div>

          <div className="flex gap-2 flex-wrap flex-1">
            {filtros.idCategoria && (
              <FiltroTag
                texto={categorias.find(c =>
                  c.idCategoria == filtros.idCategoria)?.nombreCategoria}
                onRemove={() => handleFiltro('idCategoria', '')}
              />
            )}
            {filtros.idTipo && (
              <FiltroTag
                texto={tipos.find(t =>
                  t.idTipo == filtros.idTipo)?.nombreTipo}
                onRemove={() => handleFiltro('idTipo', '')}
              />
            )}
            {(filtros.precioMin || filtros.precioMax) && (
              <FiltroTag
                texto={`$${filtros.precioMin || '0'} — $${filtros.precioMax || '∞'}`}
                onRemove={() =>
                  setFiltros(prev => ({ ...prev, precioMin: '', precioMax: '', page: 0 }))
                }
              />
            )}
          </div>

          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border
                         border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 px-3 py-2
                         rounded-lg transition-colors whitespace-nowrap"
            >
              ✕ Limpiar todo
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10
                          border-b-2 border-green-700 dark:border-green-500" />
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-5xl mb-3">🌱</p>
          <p className="font-medium text-lg">No se encontraron productos</p>
          <p className="text-sm mt-1">Intenta con otros filtros</p>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="mt-4 text-green-700 dark:text-green-400 underline text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {productos.length} producto(s) encontrado(s)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-6">
            {productos.map(p => (
              <ProductoCard key={p.idProducto} producto={p} tipos={tipos} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handleFiltro('page', filtros.page - 1)}
                disabled={filtros.page === 0}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-sm hover:bg-gray-50 dark:hover:bg-gray-800
                           text-gray-700 dark:text-gray-300
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                Página {filtros.page + 1} de {totalPages}
              </span>
              <button
                onClick={() => handleFiltro('page', filtros.page + 1)}
                disabled={filtros.page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-sm hover:bg-gray-50 dark:hover:bg-gray-800
                           text-gray-700 dark:text-gray-300
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FiltroTag({ texto, onRemove }) {
  if (!texto) return null
  return (
    <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/40
                     text-green-800 dark:text-green-300 text-xs font-medium px-2 py-1
                     rounded-full">
      {texto}
      <button
        onClick={onRemove}
        className="hover:text-red-600 dark:hover:text-red-400 transition-colors ml-1 font-bold"
      >
        ×
      </button>
    </span>
  )
}

function ProductoCard({ producto: p }) {
  const navigate          = useNavigate()
  const { isAuth }        = useAuth()
  const { refreshCart }   = useCart()

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
      setMensaje({ tipo: 'ok', texto: '✅ Agregado' })
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al agregar'
      setMensaje({ tipo: 'error', texto: '❌ ' + msg })
    } finally {
      setAgregando(false)
      setTimeout(() => setMensaje(null), 2000)
    }
  }

  const sinStock = p.stock === 0

  return (
    <Link
      to={`/producto/${p.idProducto}`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg dark:shadow-none
                 transition-all duration-200 overflow-hidden group
                 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700
                 flex flex-col"
    >
      <div className="aspect-square bg-green-50 dark:bg-gray-900 overflow-hidden relative flex-shrink-0 flex
                items-center justify-center">
        <img
          src={imagenSrc}
          alt={p.nombreProducto}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300"
          onError={e => {
            e.target.onerror = null
            e.target.src = `https://placehold.co/400x400/d1fae5/166534?text=${encodeURIComponent(p.nombreProducto)}`
          }}
        />

        {p.categoria && (
          <span className="absolute top-2 left-2 bg-green-700 dark:bg-green-600 text-white
                           text-xs px-2 py-0.5 rounded-full font-medium">
            {p.categoria}
          </span>
        )}

        {p.tipo && (
          <span className="absolute top-2 right-2 bg-white dark:bg-gray-800 text-green-800 dark:text-green-400
                           text-xs px-2 py-0.5 rounded-full font-medium
                           border border-green-200 dark:border-green-700">
            {p.tipo}
          </span>
        )}

        {sinStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40
                          flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold
                             px-3 py-1 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">

        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2
                       group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors flex-1">
          {p.nombreProducto}
        </h3>

        <div className="flex justify-between items-center mt-2 mb-3">
          <span className="text-green-800 dark:text-green-400 font-bold text-lg">
            ${p.precio?.toLocaleString('es-CO')}
          </span>
          <span className={`text-xs ${sinStock
            ? 'text-red-400 dark:text-red-500 font-medium'
            : 'text-gray-400 dark:text-gray-500'}`}>
            Stock: {p.stock}
          </span>
        </div>

        <button
          onClick={handleAgregar}
          disabled={sinStock || agregando}
          className={`w-full py-2 px-3 rounded-lg text-sm font-semibold
                      transition-all duration-200 flex items-center
                      justify-center gap-1
                      ${sinStock
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : agregando
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 cursor-wait'
                          : 'bg-green-700 dark:bg-green-600 text-white hover:bg-green-800 dark:hover:bg-green-700 active:scale-95'
                      }`}
        >
          {agregando ? (
            <>
              <span className="inline-block w-3 h-3 border-2
                               border-green-500 border-t-transparent
                               rounded-full animate-spin" />
              Agregando...
            </>
          ) : sinStock ? (
            'Sin stock'
          ) : (
            <>🛒 Agregar al carrito</>
          )}
        </button>

        {mensaje && (
          <p className={`text-xs text-center mt-2 font-medium
                         ${mensaje.tipo === 'ok'
                           ? 'text-green-600 dark:text-green-400'
                           : 'text-red-500 dark:text-red-400'}`}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </Link>
  )
}