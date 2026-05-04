import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkout as checkoutApi } from '../api/pedidosApi'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

/**
 * Métodos de pago disponibles.
 * Los IDs deben coincidir con los registros en METODOPAGO de Oracle:
 *   1 = TARJETA_CREDITO  → Tarjeta de Crédito
 *   2 = TARJETA_DEBITO   → Tarjeta de Débito
 *   3 = TRANSFERENCIA    → PSE
 *   4 = EFECTIVO         → Contra entrega
 *
 * Ruta destino: From/src/pages/Checkout.jsx
 */
const METODOS_PAGO = [
  { id: 1, nombre: 'Tarjeta de Crédito', icono: '💳' },
  { id: 2, nombre: 'Tarjeta de Débito',  icono: '🏦' },
  { id: 3, nombre: 'PSE',                icono: '🔄' },
  { id: 4, nombre: 'Contra entrega',     icono: '📦' },
]

export default function Checkout() {
  const navigate = useNavigate()

  // clearCart: pone el contador del navbar en 0 después del checkout
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
      // POST /api/pedidos/checkout → crea el pedido en el backend
      const res = await checkoutApi(metodoPago, direccion)

      // Limpiar el contador del carrito en el navbar INMEDIATAMENTE
      // El carrito ya fue marcado como CONVERTIDO en el backend.
      // clearCart() es síncrono → el badge desaparece antes de navegar.
      clearCart()

      // Redirigir al detalle del pedido con flag de "pedido nuevo"
      navigate(`/pedidos/${res.data.idPedido}`, { state: { nuevo: true } })

    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">

      {/* Encabezado */}
      <div className="mb-6">
        <Link to="/carrito"
              className="text-sm text-green-700 hover:underline mb-2 block">
          ← Volver al carrito
        </Link>
        <h1 className="text-2xl font-bold text-green-800">
          Confirmar pedido
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Revisa los datos antes de confirmar
        </p>
      </div>

      {/* Dirección de envío */}
      <div className="bg-white rounded-xl border border-gray-100
                      shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-3">
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

      {/* Método de pago */}
      <div className="bg-white rounded-xl border border-gray-100
                      shadow-sm p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-3">
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
                            ? 'border-green-600 bg-green-50 text-green-800'
                            : 'border-gray-200 hover:border-green-300 text-gray-700'}`}
            >
              <span className="text-xl">{m.icono}</span>
              <span>{m.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700
                        rounded-lg p-3 mb-4 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Botón confirmar */}
      <Button fullWidth size="lg" loading={loading} onClick={handleSubmit}>
        ✅ Confirmar y pagar
      </Button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Al confirmar, recibirás un email de confirmación
      </p>
    </div>
  )
}