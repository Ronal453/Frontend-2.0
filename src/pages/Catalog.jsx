import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProductos, getCategorias } from '../api/productosApi'

export default function Catalog() {
  const [productos,   setProductos]   = useState([])
  const [categorias,  setCategorias]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [totalPages,  setTotalPages]  = useState(0)
  const [filtros, setFiltros] = useState({
    nombre: '', idCategoria: '', page: 0, size: 12
  })

  // Cargar categorías una sola vez
  useEffect(() => {
    getCategorias()
      .then(r => setCategorias(r.data))
      .catch(console.error)
  }, [])

  // Cargar productos cuando cambian los filtros
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

      {/* ── Filtros ──────────────────────────────────── */}
      <div className="flex gap-3 mb-8 flex-wrap bg-white p-4
                      rounded-xl shadow-sm border border-gray-100">
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
                     bg-white"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.idCategoria} value={c.idCategoria}>
              {c.nombreCategoria}
            </option>
          ))}
        </select>

        {/* Botón limpiar filtros */}
        {(filtros.nombre || filtros.idCategoria) && (
          <button
            onClick={() => setFiltros({ nombre: '', idCategoria: '', page: 0, size: 12 })}
            className="text-sm text-gray-500 hover:text-red-500
                       transition-colors px-2"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* ── Grid de productos ─────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10
                          border-b-2 border-green-700" />
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-3">🌱</p>
          <p className="font-medium">No se encontraron productos</p>
          <p className="text-sm mt-1">Intenta con otros filtros</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-6">
            {productos.map(p => (
              <Link
                key={p.idProducto}
                to={`/producto/${p.idProducto}`}
                className="bg-white rounded-xl shadow hover:shadow-lg
                           transition-all duration-200 overflow-hidden
                           group border border-gray-100 hover:border-green-200"
              >
                {/* Imagen */}
                <div className="h-48 bg-green-50 overflow-hidden relative">
                  {p.imagenUrl ? (
                    <img
                      src={p.imagenUrl}
                      alt={p.nombreProducto}
                      className="w-full h-full object-cover
                                 group-hover:scale-105 transition-transform
                                 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center
                                    justify-center text-5xl">
                      🌿
                    </div>
                  )}
                  {/* Badge de categoría */}
                  {p.categoria && (
                    <span className="absolute top-2 left-2 bg-green-700
                                     text-white text-xs px-2 py-0.5
                                     rounded-full font-medium">
                      {p.categoria}
                    </span>
                  )}
                  {/* Badge sin stock */}
                  {p.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-40
                                    flex items-center justify-center">
                      <span className="bg-red-500 text-white text-sm
                                       font-bold px-3 py-1 rounded-full">
                        Sin stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1
                                 line-clamp-2 group-hover:text-green-700
                                 transition-colors">
                    {p.nombreProducto}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-800 font-bold text-lg">
                      ${p.precio?.toLocaleString('es-CO')}
                    </span>
                    <span className="text-xs text-gray-400">
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Paginación ──────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handleFiltro('page', filtros.page - 1)}
                disabled={filtros.page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {filtros.page + 1} de {totalPages}
              </span>
              <button
                onClick={() => handleFiltro('page', filtros.page + 1)}
                disabled={filtros.page >= totalPages - 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm
                           hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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