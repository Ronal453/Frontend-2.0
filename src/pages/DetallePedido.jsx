import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getDetallePedido } from '../api/pedidosApi'

const PASOS = ['PENDIENTE', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO']

const NOMBRES_METODO = {
  'TARJETA_CREDITO':  'Tarjeta de Crédito',
  'TARJETA CREDITO':  'Tarjeta de Crédito',
  'TARJETA_DEBITO':   'Tarjeta de Débito',
  'TARJETA DEBITO':   'Tarjeta de Débito',
  'TRANSFERENCIA':    'PSE',
  'EFECTIVO':         'Contra entrega',
}

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
                      border-b-2 border-green-700 dark:border-green-500" />
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-600 dark:text-red-400">
      ⚠ {error}
    </div>
  )

  if (!pedido) return null

  const pasoActual = PASOS.indexOf(pedido.estado)
  const cancelado  = pedido.estado === 'CANCELADO'

  const formatearFechaColombia = (fechaStr) => {
    if (!fechaStr) return 'Fecha no disponible'
    try {
      const fechaUTC = fechaStr.includes('Z') || fechaStr.includes('+')
        ? fechaStr
        : fechaStr + 'Z'

      return new Date(fechaUTC).toLocaleString('es-CO', {
        year:     'numeric',
        month:    'long',
        day:      'numeric',
        hour:     '2-digit',
        minute:   '2-digit',
        hour12:   true,
        timeZone: 'America/Bogota'
      })
    } catch {
      return fechaStr
    }
  }

  const formatearPrecio = (valor) => {
    if (valor == null) return '$0'
    return '$' + Number(valor).toLocaleString('es-CO')
  }

  const obtenerNombreMetodo = (metodoPago) => {
    if (!metodoPago) return null
    const clave = metodoPago.toUpperCase().trim()
    return NOMBRES_METODO[clave]
        || metodoPago.replace(/_/g, ' ')
                     .toLowerCase()
                     .replace(/\b\w/g, l => l.toUpperCase())
  }

  const obtenerEstadoPago = () => {
    if (pedido.pago?.estadoPago) return pedido.pago.estadoPago
    const metodo = (pedido.pago?.metodoPago || '').toUpperCase()
    return metodo === 'EFECTIVO' ? 'PENDIENTE' : 'APROBADO'
  }

  const nombreMetodo = obtenerNombreMetodo(pedido.pago?.metodoPago)
  const estadoPago   = obtenerEstadoPago()
  const esAprobado   = estadoPago === 'APROBADO'
  const montoPago    = pedido.pago?.monto ?? pedido.total

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <Link to="/pedidos"
            className="text-sm text-green-700 dark:text-green-400 hover:underline mb-4 block">
        ← Mis pedidos
      </Link>

      {state?.nuevo && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl
                        p-4 mb-6 text-center">
          <p className="text-3xl mb-1">🎉</p>
          <p className="font-bold text-green-800 dark:text-green-300">¡Pedido confirmado!</p>
          <p className="text-green-700 dark:text-green-400 text-sm mt-1">
            Revisa tu email para ver la confirmación
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                      p-5 mb-4 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {pedido.numeroPedido}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {formatearFechaColombia(pedido.fechaPedido)}
            </p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full
                            ${cancelado
                              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                              : 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'}`}>
            {pedido.estado}
          </span>
        </div>
      </div>

      {!cancelado && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                        p-5 mb-4 shadow-sm dark:shadow-none">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 text-sm">
            Estado del pedido
          </h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5
                            bg-gray-200 dark:bg-gray-700 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-green-600 dark:bg-green-500 z-0
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
                                   ? 'bg-green-700 dark:bg-green-600 border-green-700 dark:border-green-600 text-white'
                                   : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`}>
                  {i < pasoActual ? '✓' : i + 1}
                </div>
                <p className={`text-xs mt-2 text-center font-medium
                               ${i <= pasoActual
                                 ? 'text-green-700 dark:text-green-400'
                                 : 'text-gray-400 dark:text-gray-500'}`}>
                  {paso}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                      overflow-hidden mb-4 shadow-sm dark:shadow-none">
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Productos</h2>
        </div>
        {pedido.detalles?.map((d, idx) => (
          <div key={idx}
               className="flex items-center gap-3 px-5 py-4
                          border-b border-gray-50 dark:border-gray-700 last:border-0">
            <div className="w-12 h-12 bg-green-50 dark:bg-gray-900 rounded-lg overflow-hidden
                            flex-shrink-0 flex items-center justify-center">
              {d.imagenUrl
                ? <img src={d.imagenUrl} alt={d.nombreProducto}
                       className="w-full h-full object-cover" />
                : <span className="text-xl">🌿</span>}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                {d.nombreProducto}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {d.cantidad} × {formatearPrecio(d.precioUnitario)}
              </p>
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {formatearPrecio(d.subtotal)}
            </p>
          </div>
        ))}
        <div className="flex justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900
                        border-t border-gray-100 dark:border-gray-700">
          <span className="font-bold text-gray-800 dark:text-gray-100">Total</span>
          <span className="font-bold text-green-800 dark:text-green-400 text-lg">
            {formatearPrecio(pedido.total)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                        p-4 shadow-sm dark:shadow-none">
          <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-1">
            📦 Envío a
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {pedido.direccionEnvio || 'No especificada'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                        p-4 shadow-sm dark:shadow-none">
          <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-2">
            💳 Pago
          </p>

          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
            {nombreMetodo || (
              <span className="text-amber-600 dark:text-amber-400 text-xs">
                Cargando método...
              </span>
            )}
          </p>

          <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                            mt-1 inline-block
                            ${esAprobado
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'}`}>
            {estadoPago}
          </span>

          <p className="text-green-800 dark:text-green-400 font-bold mt-1">
            {formatearPrecio(montoPago)}
          </p>
        </div>

      </div>
    </div>
  )
}