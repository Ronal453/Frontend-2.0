import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProductos, getCategorias, getTipos } from '../api/productosApi'
import { agregarItem } from '../api/carritoApi'           // ← para el botón en tarjeta
import { getImagenProducto } from '../utils/imageUtils'
import { useAuth } from '../hooks/useAuth'                // ← verificar sesión antes de agregar
import { useCart } from '../context/CartContext'          // ← actualizar contador navbar

export default function Catalog() {
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos,      setTipos]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [totalPages, setTotalPages] = useState(0)

  // Estado de filtros: todos opcionales y combinables entre sí
  const [filtros, setFiltros] = useState({
    nombre:      '',
    idCategoria: '',
    idTipo:      '',
    precioMin:   '',
    precioMax:   '',
    page:        0,
    size:        12
  })

  // Carga categorías y tipos una sola vez al montar el componente
  useEffect(() => {
    getCategorias()
      .then(r => {
        // Elimina categorías duplicadas por nombre y ordena alfabéticamente
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

  // Recarga productos cada vez que cambian los filtros o la página
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

  // Actualiza un filtro de búsqueda y resetea a página 0
  // EXCEPTO cuando el campo que cambia es precisamente 'page'
  const handleFiltro = (campo, valor) =>
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      ...(campo !== 'page' && { page: 0 }) // solo resetea si NO es navegación de página
    }))

  // Restablece todos los filtros al estado inicial
  const limpiarFiltros = () =>
    setFiltros({
      nombre: '', idCategoria: '', idTipo: '',
      precioMin: '', precioMax: '', page: 0, size: 12
    })

  // Determina si hay algún filtro activo para mostrar el botón "Limpiar"
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

        {/* Fila 1: búsqueda por nombre, categoría y tipo */}
        <div className="flex gap-3 flex-wrap">

          {/* Búsqueda por nombre parcial, insensible a mayúsculas (backend) */}
          <input
            type="text"
            placeholder="🔍 Buscar planta..."
            value={filtros.nombre}
            onChange={e => handleFiltro('nombre', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500
                       flex-1 min-w-48"
          />

          {/* Filtro por categoría: usa los IDs devueltos por el backend */}
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

          {/* Filtro por tipo: Planta, Semilla, Accesorio, Sustrato */}
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

        {/* Fila 2: rango de precio y tags de filtros activos */}
        <div className="flex gap-3 flex-wrap items-center">

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 whitespace-nowrap">
              💰 Precio:
            </label>
            {/* Precio mínimo */}
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
            {/* Precio máximo */}
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

          {/* Tags visuales de filtros activos con botón de eliminar individual */}
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

          {/* Botón limpiar todos los filtros a la vez */}
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
        // Spinner centrado mientras se cargan los productos
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10
                          border-b-2 border-green-700" />
        </div>
      ) : productos.length === 0 ? (
        // Estado vacío cuando ningún producto coincide con los filtros
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
          {/* Contador de resultados */}
          <p className="text-sm text-gray-500 mb-4">
            {productos.length} producto(s) encontrado(s)
          </p>

          {/* Grid responsivo: 1 col móvil → 2 tablet → 3 md → 4 lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
                          lg:grid-cols-4 gap-6">
            {productos.map(p => (
              <ProductoCard key={p.idProducto} producto={p} tipos={tipos} />
            ))}
          </div>

          {/* Paginación: solo se muestra si hay más de una página */}
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
// Muestra el nombre del filtro y permite eliminarlo individualmente
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
// Requisito: botón "Agregar al carrito" en catálogo con validación de stock
// y actualización del contador de la navbar
function ProductoCard({ producto: p }) {
  const navigate          = useNavigate()
  const { isAuth }        = useAuth()          // determina si el usuario tiene sesión
  const { refreshCart }   = useCart()          // para actualizar el contador del navbar

  // Estado local de carga por tarjeta: evita bloquear toda la UI
  const [agregando, setAgregando] = useState(false)
  // Mensaje temporal de éxito o error al agregar
  const [mensaje,   setMensaje]   = useState(null)

  // Resuelve la URL de imagen con fallback por categoría y luego genérico
  const imagenSrc = getImagenProducto(p.imagenUrl, p.categoria)

  // Agrega exactamente 1 unidad al carrito desde la vista de catálogo
  // Si el usuario no tiene sesión, lo redirige al login
  const handleAgregar = async (e) => {
    // Detiene la propagación para que el clic no active el Link de la tarjeta
    e.preventDefault()
    e.stopPropagation()

    if (!isAuth) {
      navigate('/login')
      return
    }

    setAgregando(true)
    setMensaje(null)

    try {
      // POST /api/carrito/items — el backend valida stock antes de agregar
      await agregarItem(p.idProducto, 1)

      // Actualiza el contador de ítems en la Navbar (CU-008: sin recargar)
      await refreshCart()

      setMensaje({ tipo: 'ok', texto: '✅ Agregado' })
    } catch (err) {
      // El backend devuelve el mensaje específico (ej: "Stock insuficiente")
      const msg = err.response?.data?.mensaje || 'Error al agregar'
      setMensaje({ tipo: 'error', texto: '❌ ' + msg })
    } finally {
      setAgregando(false)
      // El mensaje desaparece automáticamente después de 2 segundos
      setTimeout(() => setMensaje(null), 2000)
    }
  }

  // Un producto sin stock no puede agregarse al carrito
  const sinStock = p.stock === 0

  return (
    // Link al detalle: toda la tarjeta es clickeable salvo el botón
    <Link
      to={`/producto/${p.idProducto}`}
      className="bg-white rounded-xl shadow hover:shadow-lg
                 transition-all duration-200 overflow-hidden group
                 border border-gray-100 hover:border-green-200
                 flex flex-col"
    >
      {/* ── Imagen con badges y overlay de sin stock ── */}
      <div className="aspect-square bg-green-50 overflow-hidden relative flex-shrink-0 flex
                items-center justify-center">
        <img
          src={imagenSrc}
          alt={p.nombreProducto}
          className="w-full h-full object-cover group-hover:scale-105
                     transition-transform duration-300"
          onError={e => {
            // Fallback si la imagen falla: placeholder con el nombre del producto
            e.target.onerror = null
            e.target.src = `https://placehold.co/400x400/d1fae5/166534?text=${encodeURIComponent(p.nombreProducto)}`
          }}
        />

        {/* Badge de categoría en esquina superior izquierda */}
        {p.categoria && (
          <span className="absolute top-2 left-2 bg-green-700 text-white
                           text-xs px-2 py-0.5 rounded-full font-medium">
            {p.categoria}
          </span>
        )}

        {/* Badge de tipo en esquina superior derecha */}
        {p.tipo && (
          <span className="absolute top-2 right-2 bg-white text-green-800
                           text-xs px-2 py-0.5 rounded-full font-medium
                           border border-green-200">
            {p.tipo}
          </span>
        )}

        {/* Overlay semitransparente cuando no hay stock disponible */}
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

      {/* ── Info: nombre, precio, stock y botón ─────── */}
      <div className="p-4 flex flex-col flex-1">

        {/* Nombre del producto: limita a 2 líneas con ellipsis */}
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2
                       group-hover:text-green-700 transition-colors flex-1">
          {p.nombreProducto}
        </h3>

        {/* Precio y stock disponible */}
        <div className="flex justify-between items-center mt-2 mb-3">
          <span className="text-green-800 font-bold text-lg">
            ${p.precio?.toLocaleString('es-CO')}
          </span>
          <span className={`text-xs ${sinStock
            ? 'text-red-400 font-medium'
            : 'text-gray-400'}`}>
            Stock: {p.stock}
          </span>
        </div>

        {/* ── Botón "Agregar al carrito" ─────────────
            Requisito: presente en catálogo con validación de stock.
            e.preventDefault() evita navegar al detalle al hacer clic.
            Deshabilitado si no hay stock o si ya está procesando. */}
        <button
          onClick={handleAgregar}
          disabled={sinStock || agregando}
          className={`w-full py-2 px-3 rounded-lg text-sm font-semibold
                      transition-all duration-200 flex items-center
                      justify-center gap-1
                      ${sinStock
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : agregando
                          ? 'bg-green-100 text-green-600 cursor-wait'
                          : 'bg-green-700 text-white hover:bg-green-800 active:scale-95'
                      }`}
        >
          {/* Spinner durante la petición al backend */}
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

        {/* Feedback temporal debajo del botón (éxito o error de stock) */}
        {mensaje && (
          <p className={`text-xs text-center mt-2 font-medium
                         ${mensaje.tipo === 'ok'
                           ? 'text-green-600'
                           : 'text-red-500'}`}>
            {mensaje.texto}
          </p>
        )}
      </div>
    </Link>
  )
}