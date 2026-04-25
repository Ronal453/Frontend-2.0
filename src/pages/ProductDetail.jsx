// ── Importaciones de utilidades y librerías ──────────────────────────────────
import { getImagenProducto } from '../utils/imageUtils' // Resuelve URL de imagen con fallback
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

// ── Importaciones de API ──────────────────────────────────────────────────────
import { getProducto } from '../api/productosApi'   // GET /api/productos/{id}
import { agregarItem } from '../api/carritoApi'      // POST /api/carrito/items

// ── Importaciones de contextos y componentes ─────────────────────────────────
import { useAuth } from '../hooks/useAuth'           // Verifica si el usuario tiene sesión
import { useCart } from '../context/CartContext'      // Actualiza contador del Navbar
import Button from '../components/ui/Button'          // Botón reutilizable con variantes

export default function ProductDetail() {
  // ── Hooks de navegación ────────────────────────────────────────────────────
  const { id }     = useParams()    // ID del producto desde la URL: /producto/:id
  const navigate   = useNavigate()  // Para redirigir si el producto no existe o no hay sesión

  // ── Hooks de contexto ──────────────────────────────────────────────────────
  const { isAuth }      = useAuth()      // true si el usuario está autenticado con JWT
  const { refreshCart } = useCart()      // Recarga el contador de ítems del Navbar

  // ── Estado del componente ──────────────────────────────────────────────────
  const [producto,  setProducto]  = useState(null)   // Datos del producto desde el backend
  const [cantidad,  setCantidad]  = useState(1)       // Cantidad seleccionada para agregar
  const [loading,   setLoading]   = useState(true)    // Controla el spinner de carga
  const [agregando, setAgregando] = useState(false)   // Controla el estado del botón agregar
  const [mensaje,   setMensaje]   = useState(null)    // Mensaje de éxito o error al agregar

  // ── Carga del producto al montar o cuando cambia el ID ────────────────────
  useEffect(() => {
    getProducto(id)
      .then(r => setProducto(r.data))         // Guarda los datos del producto
      .catch(() => navigate('/catalogo'))      // Si no existe, redirige al catálogo
      .finally(() => setLoading(false))        // Oculta el spinner en cualquier caso
  }, [id])

  // ── Handler: agregar al carrito ───────────────────────────────────────────
  // Valida sesión, llama al backend, actualiza el navbar y muestra feedback
  const handleAgregar = async () => {
    // Si no hay sesión activa, redirige al login
    if (!isAuth) return navigate('/login')

    setAgregando(true)
    setMensaje(null)

    try {
      // POST /api/carrito/items — el backend valida stock antes de agregar
      await agregarItem(Number(id), cantidad)

      // Actualiza el contador de ítems en la Navbar sin recargar la página
      await refreshCart()

      // Muestra mensaje de éxito con la cantidad agregada
      setMensaje({ tipo: 'ok', texto: `✅ ${cantidad} unidad(es) agregada(s) al carrito` })

    } catch (e) {
      // El backend devuelve el mensaje específico (ej: "Stock insuficiente")
      setMensaje({
        tipo: 'error',
        texto: '❌ ' + (e.response?.data?.mensaje || 'Error al agregar al carrito')
      })
    } finally {
      setAgregando(false)
      // El mensaje desaparece automáticamente después de 3 segundos
      setTimeout(() => setMensaje(null), 3000)
    }
  }

  // ── Render: estado de carga ───────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700" />
    </div>
  )

  // ── Render: producto no encontrado ────────────────────────────────────────
  if (!producto) return null

  // Determina si el producto está agotado para deshabilitar el botón
  const sinStock = producto.stock === 0

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* ── Breadcrumb de navegación ── */}
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link to="/catalogo" className="hover:text-green-700">Catálogo</Link>
        <span>/</span>
        <span className="text-gray-800">{producto.nombreProducto}</span>
      </nav>

      {/* ── Layout en dos columnas: imagen + info ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Columna izquierda: imagen del producto ── */}
        {/*
          aspect-[3/4] = proporción ancho:alto de 3:4 (formato vertical/retrato)
          Por cada 3px de ancho, la imagen ocupa 4px de alto.
          Se adapta automáticamente al ancho de la columna en cualquier pantalla.
        */}
        <div className="bg-green-50 rounded-2xl overflow-hidden aspect-[3/4]
                        flex items-center justify-center relative">

          {/* Imagen principal con fallback a placeholder si la URL falla */}
          {producto.imagenUrl ? (
            <img
              src={getImagenProducto(producto.imagenUrl, producto.categoria)}
              alt={producto.nombreProducto}
              className="w-full h-full object-cover" // Cubre todo el contenedor sin deformar
              onError={e => {
                // Si la imagen externa falla, muestra un placeholder generado
                e.target.onerror = null
                e.target.src = `https://placehold.co/600x800/d1fae5/166534?text=${encodeURIComponent(producto.nombreProducto)}`
              }}
            />
          ) : (
            // Emoji de planta cuando no hay imagen en la BD
            <span className="text-9xl">🌿</span>
          )}

          {/* Overlay semitransparente de "Sin stock" sobre la imagen */}
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

        {/* ── Columna derecha: información del producto ── */}
        <div>

          {/* Badges de categoría y tipo */}
          <div className="flex gap-2 mb-2">
            {producto.categoria && (
              <span className="text-xs bg-green-100 text-green-800
                               px-2 py-1 rounded-full font-medium">
                {producto.categoria}
              </span>
            )}
            {producto.tipo && (
              <span className="text-xs bg-gray-100 text-gray-600
                               px-2 py-1 rounded-full font-medium">
                {producto.tipo}
              </span>
            )}
          </div>

          {/* Nombre del producto */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {producto.nombreProducto}
          </h1>

          {/* Precio en formato colombiano */}
          <p className="text-3xl font-bold text-green-800 mb-4">
            ${producto.precio?.toLocaleString('es-CO')}
          </p>

          {/* Descripción larga del producto */}
          {producto.descripcion && (
            <p className="text-gray-600 mb-5 leading-relaxed">
              {producto.descripcion}
            </p>
          )}

          {/* Tarjetas de características: luz, riego, tamaño y stock */}
          <div className="grid grid-cols-2 gap-3 mb-5">

            {/* Característica: luz requerida */}
            {producto.luz && (
              <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl">
                <p className="font-semibold text-yellow-800 text-sm mb-0.5">☀️ Luz</p>
                <p className="text-yellow-700 text-sm">{producto.luz}</p>
              </div>
            )}

            {/* Característica: frecuencia de riego */}
            {producto.riego && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                <p className="font-semibold text-blue-800 text-sm mb-0.5">💧 Riego</p>
                <p className="text-blue-700 text-sm">{producto.riego}</p>
              </div>
            )}

            {/* Característica: tamaño estimado de la planta */}
            {producto.tamanioEstimado && (
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                <p className="font-semibold text-gray-700 text-sm mb-0.5">📏 Tamaño</p>
                <p className="text-gray-600 text-sm">{producto.tamanioEstimado}</p>
              </div>
            )}

            {/* Característica: unidades disponibles (solo si hay stock) */}
            {producto.stock > 0 && (
              <div className="bg-green-50 border border-green-100 p-3 rounded-xl">
                <p className="font-semibold text-green-800 text-sm mb-0.5">📦 Stock</p>
                <p className="text-green-700 text-sm">{producto.stock} disponibles</p>
              </div>
            )}
          </div>

          {/* Sección de cuidados especiales (solo si existe en la BD) */}
          {producto.cuidados && (
            <div className="bg-green-50 p-4 rounded-xl mb-5">
              <p className="font-semibold text-green-800 mb-1">🌱 Cuidados</p>
              <p className="text-green-700 text-sm leading-relaxed">{producto.cuidados}</p>
            </div>
          )}

          {/* Selector de cantidad — solo visible si hay stock */}
          {!sinStock && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">

                {/* Botón decrementar — mínimo 1 */}
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600 transition-colors"
                >−</button>

                {/* Cantidad actual */}
                <span className="px-4 py-2 font-semibold border-x border-gray-300
                                 min-w-[3rem] text-center">
                  {cantidad}
                </span>

                {/* Botón incrementar — máximo = stock disponible */}
                <button
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600 transition-colors"
                >+</button>
              </div>
            </div>
          )}

          {/* Botón principal: agregar al carrito o mostrar sin stock */}
          <Button
            fullWidth
            size="lg"
            onClick={handleAgregar}
            loading={agregando}       // Muestra spinner mientras procesa
            disabled={sinStock}       // Deshabilitado si no hay stock
          >
            {sinStock ? '❌ Sin stock' : '🛒 Agregar al carrito'}
          </Button>

          {/* Mensaje de feedback tras intentar agregar (éxito o error) */}
          {mensaje && (
            <div className={`mt-3 p-3 rounded-lg text-sm text-center
                            ${mensaje.tipo === 'ok'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-700'}`}>
              {mensaje.texto}
              {/* Link directo al carrito solo cuando el agregado fue exitoso */}
              {mensaje.tipo === 'ok' && (
                <Link to="/carrito" className="ml-2 underline font-medium">
                  Ver carrito →
                </Link>
              )}
            </div>
          )}

        </div>
        {/* ── Fin columna derecha ── */}

      </div>
      {/* ── Fin grid ── */}

    </div>
  )
}