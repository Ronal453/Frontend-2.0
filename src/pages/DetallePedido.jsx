import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getDetallePedido } from '../api/pedidosApi'

const PASOS = ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO']

/**
 * Mapa completo de métodos de pago internos → nombres visibles al usuario.
 * Cubre el nombre en BD (TARJETA_CREDITO), con espacios (TARJETA CREDITO)
 * y variaciones de capitalización.
 *
 * El backend almacena: TARJETA_CREDITO, TARJETA_DEBITO, TRANSFERENCIA, EFECTIVO
 * El frontend muestra: Tarjeta de Crédito, Tarjeta de Débito, PSE, Contra entrega
 */
const NOMBRES_METODO = {
  'TARJETA_CREDITO':  'Tarjeta de Crédito',
  'TARJETA CREDITO':  'Tarjeta de Crédito',
  'TARJETA_DEBITO':   'Tarjeta de Débito',
  'TARJETA DEBITO':   'Tarjeta de Débito',
  'TRANSFERENCIA':    'PSE',           // id=3 en BD es TRANSFERENCIA → mostrar PSE
  'EFECTIVO':         'Contra entrega', // id=4 en BD es EFECTIVO → mostrar Contra entrega
}

/**
 * Página de Detalle de Pedido.
 *
 * Ruta destino: From/src/pages/DetallePedido.jsx
 */
export default function DetallePedido() {
  const { id }    = useParams()
  const { state } = useLocation()

  const [pedido,  setPedido]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getDetallePedido(id)
      .then(r  => setPedido(r.data))
      .catch(() => setError('No se pudo cargar el pedido'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700" />
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-600">
      ⚠ {error}
    </div>
  )

  if (!pedido) return null

  const pasoActual = PASOS.indexOf(pedido.estado)
  const cancelado  = pedido.estado === 'CANCELADO'

  // ── Formatear fecha en hora Colombia (UTC-5) ─────────────────────────────
  // El backend corre en Docker UTC. Agregar 'Z' indica que la fecha está
  // en UTC y el navegador la convierte a la zona horaria indicada (Bogotá).
  const formatearFechaColombia = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible'
    try {
      const fechaUTC = fechaStr.includes('Z') || fechaStr.includes('+')
        ? fechaStr
        : fechaStr + 'Z' // tratar como UTC (Docker siempre corre en UTC)

      return new Date(fechaUTC).toLocaleString('es-CO', {
        year:     'numeric',
        month:    'long',
        day:      'numeric',
        hour:     '2-digit',
        minute:   '2-digit',
        hour12:   true,
        timeZone: 'America/Bogota' // Colombia UTC-5, sin horario de verano
      })
    } catch {
      return fechaStr
    }
  }

  // ── Formatear precio en pesos colombianos ────────────────────────────────
  const formatearPrecio = (valor) => {
    if (valor == null) return '$0'
    return '$' + Number(valor).toLocaleString('es-CO')
  }

  // ── Obtener nombre legible del método de pago ─────────────────────────────
  // Busca en el mapa usando el valor en mayúsculas para evitar problemas
  // de capitalización. Si no encuentra, convierte _ por espacio.
  const obtenerNombreMetodo = (metodoPago) => {
    if (!metodoPago) return null // null = el backend no envió el método
    const clave = metodoPago.toUpperCase().trim()
    return NOMBRES_METODO[clave]
        || metodoPago.replace(/_/g, ' ')
                     .toLowerCase()
                     .replace(/\b\w/g, l => l.toUpperCase())
  }

  // ── Determinar estado del pago ───────────────────────────────────────────
  // Contra entrega (EFECTIVO) → PENDIENTE hasta que se reciba el pago físico
  // Todos los demás métodos → APROBADO inmediatamente (pago electrónico)
  const obtenerEstadoPago = () => {
    // Usar el estado que viene del backend si está disponible
    if (pedido.pago?.estadoPago) return pedido.pago.estadoPago

    // Inferir según el método si el backend no lo envió
    const metodo = (pedido.pago?.metodoPago || '').toUpperCase()
    return metodo === 'EFECTIVO' ? 'PENDIENTE' : 'APROBADO'
  }

  // Valores calculados para la tarjeta de pago
  const nombreMetodo = obtenerNombreMetodo(pedido.pago?.metodoPago)
  const estadoPago   = obtenerEstadoPago()
  const esAprobado   = estadoPago === 'APROBADO'
  const montoPago    = pedido.pago?.monto ?? pedido.total

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <Link to="/pedidos"
            className="text-sm text-green-700 hover:underline mb-4 block">
        ← Mis pedidos
      </Link>

      {/* Banner pedido nuevo */}
      {state?.nuevo && (
        <div className="bg-green-50 border border-green-200 rounded-xl
                        p-4 mb-6 text-center">
          <p className="text-3xl mb-1">🎉</p>
          <p className="font-bold text-green-800">¡Pedido confirmado!</p>
          <p className="text-green-700 text-sm mt-1">
            Revisa tu email para ver la confirmación
          </p>
        </div>
      )}

      {/* Encabezado: número, fecha y estado */}
      <div className="bg-white border border-gray-100 rounded-xl
                      p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {pedido.numeroPedido}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {formatearFechaColombia(pedido.fechaPedido)}
            </p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full
                            ${cancelado
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-800'}`}>
            {pedido.estado}
          </span>
        </div>
      </div>

      {/* Línea de tiempo */}
      {!cancelado && (
        <div className="bg-white border border-gray-100 rounded-xl
                        p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm">
            Estado del pedido
          </h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5
                            bg-gray-200 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-green-600 z-0
                         transition-all duration-500"
              style={{
                width: pasoActual >= 0
                  ? `${(pasoActual / (PASOS.length - 1)) * 100}%`
                  : '0%'
              }}
            />
            {PASOS.map((paso, i) => (
              <div key={paso}
                   className="flex flex-col items-center z-10 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center
                                 justify-center text-xs font-bold border-2
                                 transition-colors
                                 ${i <= pasoActual
                                   ? 'bg-green-700 border-green-700 text-white'
                                   : 'bg-white border-gray-300 text-gray-400'}`}>
                  {i < pasoActual ? '✓' : i + 1}
                </div>
                <p className={`text-xs mt-2 text-center font-medium
                               ${i <= pasoActual
                                 ? 'text-green-700'
                                 : 'text-gray-400'}`}>
                  {paso}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos */}
      <div className="bg-white border border-gray-100 rounded-xl
                      overflow-hidden mb-4 shadow-sm">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">Productos</h2>
        </div>
        {pedido.detalles?.map((d, idx) => (
          <div key={idx}
               className="flex items-center gap-3 px-5 py-4
                          border-b border-gray-50 last:border-0">
            <div className="w-12 h-12 bg-green-50 rounded-lg overflow-hidden
                            flex-shrink-0 flex items-center justify-center">
              {d.imagenUrl
                ? <img src={d.imagenUrl} alt={d.nombreProducto}
                       className="w-full h-full object-cover" />
                : <span className="text-xl">🌿</span>}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">
                {d.nombreProducto}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {d.cantidad} × {formatearPrecio(d.precioUnitario)}
              </p>
            </div>
            <p className="font-semibold text-gray-800">
              {formatearPrecio(d.subtotal)}
            </p>
          </div>
        ))}
        <div className="flex justify-between px-5 py-4 bg-gray-50
                        border-t border-gray-100">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-green-800 text-lg">
            {formatearPrecio(pedido.total)}
          </span>
        </div>
      </div>

      {/* Envío y pago */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Dirección */}
        <div className="bg-white border border-gray-100 rounded-xl
                        p-4 shadow-sm">
          <p className="font-semibold text-gray-700 text-sm mb-1">
            📦 Envío a
          </p>
          <p className="text-gray-600 text-sm">
            {pedido.direccionEnvio || 'No especificada'}
          </p>
        </div>

        {/* Pago */}
        <div className="bg-white border border-gray-100 rounded-xl
                        p-4 shadow-sm">
          <p className="font-semibold text-gray-700 text-sm mb-2">
            💳 Pago
          </p>

          {/* Método de pago — con indicador si el backend no lo envió */}
          <p className="text-gray-700 text-sm font-medium">
            {nombreMetodo || (
              <span className="text-amber-600 text-xs">
                Cargando método...
              </span>
            )}
          </p>

          {/* Badge estado del pago */}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                            mt-1 inline-block
                            ${esAprobado
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'}`}>
            {estadoPago}
          </span>

          {/* Monto */}
          <p className="text-green-800 font-bold mt-1">
            {formatearPrecio(montoPago)}
          </p>
        </div>

      </div>
    </div>
  )
}