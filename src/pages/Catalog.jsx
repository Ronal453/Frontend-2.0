import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function Catalog() {
  const [productos, setProductos]     = useState([])
  const [categorias, setCategorias]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [filtros, setFiltros]         = useState({
    nombre: '', idCategoria: '', page: 0
  })

  useEffect(() => {
    api.get('/productos/categorias')
      .then(r => setCategorias(r.data))
      .catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtros.nombre)      params.set('nombre',      filtros.nombre)
    if (filtros.idCategoria) params.set('idCategoria', filtros.idCategoria)
    params.set('page', filtros.page)
    params.set('size', 12)

    api.get(`/productos?${params}`)
      .then(r => setProductos(r.data.content ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filtros])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        🌿 Catálogo de plantas
      </h1>

      {/* Filtros */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <input
          type="text"
          placeholder="Buscar planta..."
          value={filtros.nombre}
          onChange={e => setFiltros({...filtros, nombre: e.target.value, page: 0})}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500 flex-1
                     min-w-48"
        />
        <select
          value={filtros.idCategoria}
          onChange={e => setFiltros({...filtros, idCategoria: e.target.value, page: 0})}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.idCategoria} value={c.idCategoria}>
              {c.nombreCategoria}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10
                          border-b-2 border-green-700" />
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">🌱</p>
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                        lg:grid-cols-4 gap-6">
          {productos.map(p => (
            <Link key={p.idProducto} to={`/producto/${p.idProducto}`}
                  className="bg-white rounded-xl shadow hover:shadow-lg
                             transition-shadow overflow-hidden group">
              <div className="h-48 bg-green-50 overflow-hidden">
                {p.imagenUrl ? (
                  <img src={p.imagenUrl} alt={p.nombreProducto}
                       className="w-full h-full object-cover
                                  group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center
                                  justify-center text-5xl">🌿</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-green-600 font-medium mb-1">
                  {p.categoria}
                </p>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {p.nombreProducto}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-bold text-lg">
                    ${p.precio?.toLocaleString('es-CO')}
                  </span>
                  <span className="text-xs text-gray-500">
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}