import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const METODOS = [
  { id: 1, nombre: 'Tarjeta de Crédito', icono: '💳' },
  { id: 2, nombre: 'Tarjeta de Débito',  icono: '🏦' },
  { id: 3, nombre: 'Transferencia',      icono: '🔄' },
  { id: 4, nombre: 'Efectivo',           icono: '💵' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const [metodoPago, setMetodoPago]   = useState(null)
  const [direccion, setDireccion]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const handleSubmit = async () => {
    if (!metodoPago) return setError('Selecciona un método de pago')
    if (!direccion.trim()) return setError('Ingresa la dirección de envío')
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/pedidos/checkout', {
        idMetodoPago: metodoPago,
        direccionEnvio: direccion,
      })
      navigate(`/pedidos/${res.data.idPedido}`, { state: { nuevo: true } })
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        Confirmar pedido
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección de envío
        </label>
        <textarea rows={3} value={direccion}
          onChange={e => setDireccion(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3
                     focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Calle, número, ciudad, departamento..."
        />
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Método de pago
        </p>
        <div className="grid grid-cols-2 gap-3">
          {METODOS.map(m => (
            <button key={m.id} onClick={() => setMetodoPago(m.id)}
                    className={`flex items-center gap-2 p-3 border-2
                                rounded-lg text-sm font-medium transition-colors
                                ${metodoPago === m.id
                                  ? 'border-green-600 bg-green-50 text-green-800'
                                  : 'border-gray-200 hover:border-green-300'}`}>
              <span>{m.icono}</span><span>{m.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-xl
                         font-semibold hover:bg-green-800 disabled:opacity-50
                         transition-colors">
        {loading ? 'Procesando...' : '✅ Confirmar y pagar'}
      </button>
    </div>
  )
}