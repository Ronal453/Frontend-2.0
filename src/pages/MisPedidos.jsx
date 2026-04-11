import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistorial } from '../api/pedidosApi'

const ESTADO_ESTILO = {
  PENDIENTE:  { clase: 'bg-yellow-100 text-yellow-800', icono: '⏳' },
  PREPARANDO: { clase: 'bg-blue-100 text-blue-800',     icono: '🌿' },
  ENVIADO:    { clase: 'bg-purple-100 text-purple-800', icono: '🚚' },
  ENTREGADO:  { clase: 'bg-green-100 text-green-800',   icono: '✅' },
  CANCELADO:  { clase: 'bg-red-100 text-red-800',       icono: '❌' },
}

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getHistorial()
      .then(r => setPedidos(r.data))
      .catch(() => setError('No se pudieron cargar los pedidos'))
      .finally(() => setLoading(false))
  }, [])

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        📦 Mis pedidos
      </h1>

      {/* Sin pedidos */}
      {pedidos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-semibold text-gray-700 mb-1">
            Aún no tienes pedidos
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Explora el catálogo y realiza tu primera compra
          </p>
          <Link to="/catalogo"
                className="bg-green-700 text-white px-5 py-2 rounded-lg
                           font-semibold hover:bg-green-800 transition-colors">
            Ver catálogo 🌿
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => {
            const estilo = ESTADO_ESTILO[p.estado] ?? {
              clase: 'bg-gray-100 text-gray-700', icono: '📦'
            }
            return (
              <Link
                key={p.idPedido}
                to={`/pedidos/${p.idPedido}`}
                className="block bg-white border border-gray-100 rounded-xl
                           p-4 hover:shadow-md hover:border-green-200
                           transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    {/* Número de pedido */}
                    <p className="font-bold text-gray-800">
                      {p.numeroPedido}
                    </p>
                    {/* Fecha */}
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(p.fechaPedido)
                        .toLocaleDateString('es-CO', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                    {/* Productos */}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.detalles?.length ?? 0} producto(s)
                    </p>
                  </div>

                  <div className="text-right">
                    {/* Estado */}
                    <span className={`inline-flex items-center gap-1 text-xs
                                      font-semibold px-2 py-1 rounded-full
                                      ${estilo.clase}`}>
                      {estilo.icono} {p.estado}
                    </span>
                    {/* Total */}
                    <p className="mt-2 font-bold text-green-800 text-lg">
                      ${p.total?.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-green-600 font-medium">
                  Ver detalle →
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}