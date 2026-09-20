import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistorial } from '../api/pedidosApi'

const ESTADO_ESTILO = {
  PENDIENTE:       { clase: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300', icono: '⏳' },
  EN_PREPARACION:  { clase: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',     icono: '🌿' },
  ENVIADO:         { clase: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300', icono: '🚚' },
  ENTREGADO:       { clase: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',   icono: '✅' },
  CANCELADO:       { clase: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',       icono: '❌' },
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
                      border-b-2 border-green-700 dark:border-green-500" />
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-600 dark:text-red-400">
      ⚠ {error}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-6">
        📦 Mis pedidos
      </h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
            Aún no tienes pedidos
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Explora el catálogo y realiza tu primera compra
          </p>
          <Link to="/catalogo"
                className="bg-green-700 dark:bg-green-600 text-white px-5 py-2 rounded-lg
                           font-semibold hover:bg-green-800 dark:hover:bg-green-700 transition-colors">
            Ver catálogo 🌿
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => {
            const estilo = ESTADO_ESTILO[p.estado] ?? {
              clase: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300', icono: '📦'
            }
            return (
              <Link
                key={p.idPedido}
                to={`/pedidos/${p.idPedido}`}
                className="block bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl
                           p-4 hover:shadow-md dark:hover:border-green-700 hover:border-green-200
                           transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {p.numeroPedido}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date((p.fechaPedido || '') + 'Z')
                        .toLocaleDateString('es-CO', {
                          year:     'numeric',
                          month:    'long',
                          day:      'numeric',
                          timeZone: 'America/Bogota'
                    })}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {p.detalles?.length ?? 0} producto(s)
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-xs
                                      font-semibold px-2 py-1 rounded-full
                                      ${estilo.clase}`}>
                      {estilo.icono} {p.estado}
                    </span>
                    <p className="mt-2 font-bold text-green-800 dark:text-green-400 text-lg">
                      ${p.total?.toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
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