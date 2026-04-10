import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import api from '../api/axios'

const PASOS = ['PENDIENTE', 'PREPARANDO', 'ENVIADO', 'ENTREGADO']

export default function DetallePedido() {
  const { id } = useParams()
  const { state } = useLocation()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/pedidos/${id}`)
      .then(r => setPedido(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700" />
    </div>
  )

  if (!pedido) return (
    <p className="text-center py-10 text-gray-500">Pedido no encontrado</p>
  )

  const pasoActual = PASOS.indexOf(pedido.estado)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {state?.nuevo && (
        <div className="bg-green-50 border border-green-200 rounded-xl
                        p-4 mb-6 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-semibold text-green-800">
            ¡Pedido confirmado! Revisa tu email.
          </p>
        </div>
      )}

      <h1 className="text-2xl font-bold text-green-800 mb-1">
        {pedido.numeroPedido}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {new Date(pedido.fechaPedido).toLocaleString('es-CO')}
      </p>

      {/* Timeline */}
      <div className="flex items-center justify-between mb-8">
        {PASOS.map((paso, i) => (
          <div key={paso} className="flex-1 flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center
                             justify-center text-xs font-bold
                             ${i <= pasoActual
                               ? 'bg-green-700 text-white'
                               : 'bg-gray-200 text-gray-500'}`}>
              {i < pasoActual ? '✓' : i + 1}
            </div>
            <p className="text-xs mt-1 text-center text-gray-600">{paso}</p>
          </div>
        ))}
      </div>

      {/* Productos */}
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
        <div className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600">
          Productos
        </div>
        {pedido.detalles?.map(d => (
          <div key={d.idProducto}
               className="flex items-center gap-3 p-4 border-t border-gray-100">
            {d.imagenUrl && (
              <img src={d.imagenUrl} alt={d.nombreProducto}
                   className="w-12 h-12 object-cover rounded-lg" />
            )}
            <div className="flex-1">
              <p className="font-medium text-gray-800">{d.nombreProducto}</p>
              <p className="text-sm text-gray-500">
                {d.cantidad} × ${d.precioUnitario?.toLocaleString('es-CO')}
              </p>
            </div>
            <p className="font-semibold">
              ${d.subtotal?.toLocaleString('es-CO')}
            </p>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3 border-t border-gray-200
                        bg-gray-50">
          <span className="font-bold">Total</span>
          <span className="font-bold text-green-800">
            ${pedido.total?.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="font-semibold text-gray-600 mb-1">📦 Envío a</p>
          <p className="text-gray-800">{pedido.direccionEnvio}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="font-semibold text-gray-600 mb-1">💳 Pago</p>
          <p className="text-gray-800">{pedido.pago?.metodoPago}</p>
          <p className="text-green-700">{pedido.pago?.estadoPago}</p>
        </div>
      </div>
    </div>
  )
}
