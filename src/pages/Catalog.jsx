import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProductos, getCategorias, getTipos } from '../api/productosApi'
import { getImagenProducto } from '../utils/imageUtils'

export default function Catalog() {
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos,      setTipos]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  const [filtros, setFiltros] = useState({
    nombre:     '',
    idCategoria: '',
    idTipo:      '',
    precioMin:   '',
    precioMax:   '',
    page:        0,
    size:        12
  })

  // ── Cargar categorías y tipos una sola vez ────────────
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

  // ── Cargar productos cuando cambian filtros ────────────
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
    setFiltros(prev => ({ ...prev, [campo]: valor, page: 0 }))

  const limpiarFiltros = () =>
    setFiltros({
      nombre: '', idCategoria: '', idTipo: '',
      precioMin: '', precioMax: '', page: 0, size: 12
    })

  const hayFiltros = filtros.nombre || filtros.idCategoria ||
                     filtros.idTipo || filtros.precioMin || filtros.precioMax

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Encabezado ──────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-800">
          🌿 Catálogo de plantas
        </h1>
        <p className="text-gray-500 mt-1">
          Encuentra la planta perfecta para tu hogar
        </p>
      </div>

      {/* ── Panel de filtros ─────────────────────────── */}
      <div className="bg-white p-4 rounded-xl shadow-sm border
                      border-gray-100 mb-8 space-y-3">

        {/* Fila 1: búsqueda + categoría + tipo */}
        <div className="flex gap-3 flex-wrap">

          {/* Búsqueda por nombre */}
          <input
            type="text"
            placeholder="🔍 Buscar planta..."
            value={filtros.nombre}
            onChange={e => handleFiltro('nombre', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       flex-1 min-w-48"
          />

          {/* Filtro por categoría */}
          <select
            value={filtros.idCategoria}
            onChange={e => handleFiltro('idCategoria', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       bg-white min-w-48"
          >
            <option value="">🏷 Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.idCategoria} value={c.idCategoria}>
                {c.nombreCategoria}
              </option>
            ))}
          </select>

          {/* Filtro por tipo */}
          <select
            value={filtros.idTipo}
            onChange={e => handleFiltro('idTipo', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       bg-white min-w-40"
          >
            <option value="">🌱 Todos los tipos</option>
            {tipos.map(t => (
              <option key={t.idTipo} value={t.idTipo}>
                {t.nombreTipo}
              </option>
            ))}
          </select>
        </div>

        {/* Fila 2: rango de precio + botón limpiar */}
        <div className="flex gap-3 flex-wrap items-center">

          {/* Precio mínimo */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap">
              💰 Precio:
            </label>
            <input
              type="number"
              placeholder="Mínimo"
              min="0"
              value={filtros.precioMin}
              onChange={e => handleFiltro('precioMin', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         w-32"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="number"
              placeholder="Máximo"
              min="0"
              value={filtros.precioMax}
              onChange={e => handleFiltro('precioMax', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-green-500
                         w-32"
            />
          </div>

          {/* Tags de filtros activos */}
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
                onRemove={() => {
                  handleFiltro('precioMin', '')
                  setFiltros(prev => ({ ...prev, precioMax: '', page: 0 }))
                }}
              />
            )}
          </div>

          {/* Botón limpiar todo */}
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-red-500 hover:text-red-700 border
                         border-red-200 hover:border-red-400 px-3 py-2
                         rounded-lg transition-colors whitespace-nowrap"
            >
              ✕ Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* ── Resultados ──────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10
                          border-b-2 border-green-700" />
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-3">🌱</p>
          <p className="font-medium text-lg">No se encontraron productos</p>
          <p className="text-sm mt-1">Intenta con otros filtros</p>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="mt-4 text-green-700 underline text-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {productos.length} producto(s) encontrado(s)
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-6">
            {productos.map(p => (
              <ProductoCard key={p.idProducto} producto={p} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handleFiltro('page', filtros.page - 1)}
                disabled={filtros.page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg
                           text-sm hover:bg-gray-50 disabled:opacity-40
                           disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {filtros.page + 1} de {totalPages}
              </span>
              <button
                onClick={() => handleFiltro('page', filtros.page + 1)}
                disabled={filtros.page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg
                           text-sm hover:bg-gray-50 disabled:opacity-40
                           disabled:cursor-not-allowed"
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

// ── Tag de filtro activo ─────────────────────────────────
function FiltroTag({ texto, onRemove }) {
  if (!texto) return null
  return (
    <span className="inline-flex items-center gap-1 bg-green-100
                     text-green-800 text-xs font-medium px-2 py-1
                     rounded-full">
      {texto}
      <button
        onClick={onRemove}
        className="hover:text-red-600 transition-colors ml-1 font-bold"
      >
        ×
      </button>
    </span>
  )
}

// ── Tarjeta de producto ──────────────────────────────────
function ProductoCard({ producto: p }) {
  const imagenSrc = getImagenProducto(p.imagenUrl, p.categoria)

  return (
    <Link
      to={`/producto/${p.idProducto}`}
      className="bg-white rounded-xl shadow hover:shadow-lg
                 transition-all duration-200 overflow-hidden group
                 border border-gray-100 hover:border-green-200"
    >
      {/* Imagen */}
      <div className="h-48 bg-green-50 overflow-hidden relative">
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

        {/* Badge categoría */}
        {p.categoria && (
          <span className="absolute top-2 left-2 bg-green-700 text-white
                           text-xs px-2 py-0.5 rounded-full font-medium">
            {p.categoria}
          </span>
        )}

        {/* Badge tipo */}
        {p.tipo && (
          <span className="absolute top-2 right-2 bg-white text-green-800
                           text-xs px-2 py-0.5 rounded-full font-medium
                           border border-green-200">
            {p.tipo}
          </span>
        )}

        {/* Sin stock */}
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-40
                          flex items-center justify-center">
            <span className="bg-red-500 text-white text-sm font-bold
                             px-3 py-1 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2
                       group-hover:text-green-700 transition-colors">
          {p.nombreProducto}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-green-800 font-bold text-lg">
            ${p.precio?.toLocaleString('es-CO')}
          </span>
          <span className={`text-xs ${p.stock > 0
            ? 'text-gray-400'
            : 'text-red-400 font-medium'}`}>
            Stock: {p.stock}
          </span>
        </div>
      </div>
    </Link>
  )
}