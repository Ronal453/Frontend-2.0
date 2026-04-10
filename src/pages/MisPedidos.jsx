import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const ESTADO_COLOR = {
  PENDIENTE:  'bg-yellow-100 text-yellow-800',
  PREPARANDO: 'bg-blue-100 text-blue-800',
  ENVIADO:    'bg-purple-100 text-purple-800',
  ENTREGADO:  'bg-green-100 text-green-800',
  CANCELADO:  'bg-red-100 text-red-800',
}

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/pedidos')
      .then(r => setPedidos(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Mis pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">📦</p>
          <p>Aún no tienes pedidos</p>
          <Link to="/catalogo"
                className="mt-4 inline-block text-green-700 underline">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map(p => (
            <Link key={p.idPedido} to={`/pedidos/${p.idPedido}`}
                  className="block border border-gray-200 rounded-xl p-4
                             hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">
                    {p.numeroPedido}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(p.fechaPedido).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-1
                                    rounded-full ${ESTADO_COLOR[p.estado]
                                     ?? 'bg-gray-100 text-gray-700'}`}>
                    {p.estado}
                  </span>
                  <p className="mt-2 font-bold text-green-800">
                    ${p.total?.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}