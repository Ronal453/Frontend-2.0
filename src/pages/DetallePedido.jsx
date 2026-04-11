import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getDetallePedido } from '../api/pedidosApi'

const PASOS = ['PENDIENTE', 'PREPARANDO', 'ENVIADO', 'ENTREGADO']

export default function DetallePedido() {
  const { id }        = useParams()
  const { state }     = useLocation()
  const [pedido,    setPedido]   = useState(null)
  const [loading,   setLoading]  = useState(true)
  const [error,     setError]    = useState('')

  useEffect(() => {
    getDetallePedido(id)
      .then(r  => setPedido(r.data))
      .catch(() => setError('No se pudo cargar el pedido'))
      .finally(()=> setLoading(false))
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

  // Posición en la línea de tiempo (solo aplica para estados que no son CANCELADO)
  const pasoActual = PASOS.indexOf(pedido.estado)
  const cancelado  = pedido.estado === 'CANCELADO'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <Link to="/pedidos"
            className="text-sm text-green-700 hover:underline mb-4 block">
        ← Mis pedidos
      </Link>

      {/* Banner de pedido nuevo */}
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

      {/* Encabezado del pedido */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {pedido.numeroPedido}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {new Date(pedido.fechaPedido).toLocaleString('es-CO', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
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

      {/* Línea de tiempo del estado */}
      {!cancelado && (
        <div className="bg-white border border-gray-100 rounded-xl p-5
                        mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4 text-sm">
            Estado del pedido
          </h2>
          <div className="flex items-center justify-between relative">
            {/* Línea de fondo */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            {/* Línea de progreso */}
            <div
              className="absolute top-4 left-0 h-0.5 bg-green-600 z-0
                         transition-all duration-500"
              style={{ width: pasoActual >= 0
                ? `${(pasoActual / (PASOS.length - 1)) * 100}%`
                : '0%' }}
            />

            {PASOS.map((paso, i) => (
              <div key={paso}
                   className="flex flex-col items-center z-10 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center
                                 justify-center text-xs font-bold
                                 border-2 transition-colors
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

      {/* Productos del pedido */}
      <div className="bg-white border border-gray-100 rounded-xl
                      overflow-hidden mb-4 shadow-sm">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700 text-sm">
            Productos
          </h2>
        </div>

        {pedido.detalles?.map((d, idx) => (
          <div key={idx}
               className="flex items-center gap-3 px-5 py-4
                          border-b border-gray-50 last:border-0">
            {/* Imagen */}
            <div className="w-12 h-12 bg-green-50 rounded-lg
                            overflow-hidden flex-shrink-0 flex
                            items-center justify-center">
              {d.imagenUrl ? (
                <img src={d.imagenUrl} alt={d.nombreProducto}
                     className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">🌿</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">
                {d.nombreProducto}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {d.cantidad} × ${d.precioUnitario?.toLocaleString('es-CO')}
              </p>
            </div>

            {/* Subtotal */}
            <p className="font-semibold text-gray-800">
              ${d.subtotal?.toLocaleString('es-CO')}
            </p>
          </div>
        ))}

        {/* Total */}
        <div className="flex justify-between px-5 py-4 bg-gray-50
                        border-t border-gray-100">
          <span className="font-bold text-gray-800">Total</span>
          <span className="font-bold text-green-800 text-lg">
            ${pedido.total?.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* Info adicional: envío y pago */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl
                        p-4 shadow-sm">
          <p className="font-semibold text-gray-700 text-sm mb-1">
            📦 Envío a
          </p>
          <p className="text-gray-600 text-sm">{pedido.direccionEnvio}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl
                        p-4 shadow-sm">
          <p className="font-semibold text-gray-700 text-sm mb-1">
            💳 Pago
          </p>
          <p className="text-gray-600 text-sm">{pedido.pago?.metodoPago}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block
                            ${pedido.pago?.estadoPago === 'APROBADO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'}`}>
            {pedido.pago?.estadoPago}
          </span>
          <p className="text-green-800 font-bold mt-1">
            ${pedido.pago?.monto?.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

    </div>
  )
}