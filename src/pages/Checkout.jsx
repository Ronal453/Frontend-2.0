import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkout as checkoutApi } from '../api/pedidosApi'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

const METODOS_PAGO = [
  { id: 1, nombre: 'Tarjeta de Crédito', icono: '💳' },
  { id: 2, nombre: 'Tarjeta de Débito',  icono: '🏦' },
  { id: 3, nombre: 'PSE',                icono: '🔄' },
  { id: 4, nombre: 'Contra entrega',     icono: '📦' },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [metodoPago,  setMetodoPago]  = useState(null)
  const [direccion,   setDireccion]   = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const handleSubmit = async () => {
    if (!metodoPago)       return setError('Selecciona un método de pago')
    if (!direccion.trim()) return setError('Ingresa la dirección de envío')

    setLoading(true)
    setError('')

    try {
      const res = await checkoutApi(metodoPago, direccion)
      clearCart()
      navigate(`/pedidos/${res.data.idPedido}`, { state: { nuevo: true } })
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      <div className="mb-6">
        <Link to="/carrito"
              className="text-sm text-green-700 dark:text-green-400 hover:underline mb-2 block">
          ← Volver al carrito
        </Link>
        <h1 className="text-2xl font-bold text-green-800 dark:text-green-400">
          Confirmar pedido
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Revisa los datos antes de confirmar
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700
                      shadow-sm dark:shadow-none p-5 mb-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
          📦 Dirección de envío
        </h2>
        <Input
          as="textarea"
          rows={3}
          value={direccion}
          onChange={e => setDireccion(e.target.value)}
          placeholder="Calle, número, barrio, ciudad, departamento..."
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700
                      shadow-sm dark:shadow-none p-5 mb-5">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
          💳 Método de pago
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {METODOS_PAGO.map(m => (
            <button
              key={m.id}
              onClick={() => setMetodoPago(m.id)}
              className={`flex items-center gap-2 p-3 border-2 rounded-xl
                          text-sm font-medium transition-all
                          ${metodoPago === m.id
                            ? 'border-green-600 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-green-300 text-gray-700 dark:text-gray-300'}`}
            >
              <span className="text-xl">{m.icono}</span>
              <span>{m.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800
                        text-red-700 dark:text-red-400
                        rounded-lg p-3 mb-4 text-sm">
          ⚠ {error}
        </div>
      )}

      <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
        ✅ Confirmar y pagar
      </Button>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-3">
        Al confirmar, recibirás un email de confirmación
      </p>
    </div>
  )
}