import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkout as checkoutApi } from '../api/pedidosApi'
import { useCart } from '../context/CartContext'
import Button from '../components/ui/Button'
import { 
  CreditCard, Landmark, Truck, Wallet, MapPin, ArrowLeft, 
  AlertCircle, ShoppingBag, ShieldCheck, X 
} from 'lucide-react'

const METODOS_PAGO = [
  { id: 1, nombre: 'Tarjeta de Crédito', icono: CreditCard },
  { id: 2, nombre: 'Tarjeta de Débito',  icono: Wallet },
  { id: 3, nombre: 'PSE',                icono: Landmark },
  { id: 4, nombre: 'Contra entrega',     icono: Truck },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [metodoPago,  setMetodoPago]  = useState(null)
  
  // Direccion segmentada
  const [dir, setDir] = useState({
    calle: '',
    numero: '',
    barrio: '',
    ciudad: '',
    departamento: '',
    detalles: ''
  })
  
  const [direccionCompleta, setDireccionCompleta] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Modal
  const [showModal, setShowModal] = useState(false)

  const handlePreSubmit = () => {
    // Validar requeridos básicos
    if (!dir.calle.trim() || !dir.numero.trim() || !dir.ciudad.trim() || !dir.departamento.trim()) {
      return setError('Por favor completa todos los campos obligatorios de la dirección (*)')
    }
    if (!metodoPago) return setError('Por favor selecciona un método de pago')
    
    setError('')
    
    // Concatenar
    const completa = `${dir.calle.trim()} ${dir.numero.trim()}, Barrio ${dir.barrio.trim() || 'N/A'}, ${dir.ciudad.trim()}, ${dir.departamento.trim()}${dir.detalles.trim() ? ` - ${dir.detalles.trim()}` : ''}`
    
    setDireccionCompleta(completa)
    setShowModal(true)
  }

  const handleConfirmSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await checkoutApi(metodoPago, direccionCompleta)
      clearCart()
      navigate(`/pedidos/${res.data.idPedido}`, { state: { nuevo: true } })
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al procesar el pedido')
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative">
      
      {/* Encabezado */}
      <div className="mb-8">
        <Link to="/catalogo"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 mb-4 transition-colors">
          <ArrowLeft size={16} /> Volver al catálogo
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Checkout
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Completa tu información para finalizar la compra de manera segura.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50
                        text-red-700 dark:text-red-400 rounded-xl p-4 mb-8 text-sm font-medium animate-in slide-in-from-top-2">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Grid a 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Columna Izquierda: Dirección */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <MapPin className="text-green-600 dark:text-green-500" size={20} />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white text-xl">Dirección de Envío</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Dirección / Vía principal *</label>
              <input
                type="text"
                value={dir.calle}
                onChange={e => setDir({...dir, calle: e.target.value})}
                placeholder="Ej: Calle 123, Carrera 45, Transversal..."
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 
                           text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Número *</label>
              <input
                type="text"
                value={dir.numero}
                onChange={e => setDir({...dir, numero: e.target.value})}
                placeholder="Ej: # 45 - 67"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 
                           text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Barrio</label>
              <input
                type="text"
                value={dir.barrio}
                onChange={e => setDir({...dir, barrio: e.target.value})}
                placeholder="Nombre del barrio"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 
                           text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Ciudad *</label>
              <input
                type="text"
                value={dir.ciudad}
                onChange={e => setDir({...dir, ciudad: e.target.value})}
                placeholder="Ciudad / Municipio"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 
                           text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Departamento *</label>
              <input
                type="text"
                value={dir.departamento}
                onChange={e => setDir({...dir, departamento: e.target.value})}
                placeholder="Departamento / Estado"
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 
                           text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Detalles Adicionales</label>
              <input
                type="text"
                value={dir.detalles}
                onChange={e => setDir({...dir, detalles: e.target.value})}
                placeholder="Apto, Casa, Torre, Conjunto cerrado..."
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 
                           text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Columna Derecha: Pago y Resumen */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-green-600 dark:text-green-500" size={20} />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-xl">Método de Pago</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {METODOS_PAGO.map(m => {
                const Icon = m.icono
                const isSelected = metodoPago === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`flex flex-col items-center justify-center gap-3 p-5 border-2 rounded-2xl
                                text-sm font-bold transition-all duration-200
                                ${isSelected
                                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm transform scale-[1.02]'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
                  >
                    <Icon size={32} className={isSelected ? 'text-green-600 dark:text-green-500' : 'text-slate-400'} strokeWidth={isSelected ? 2.5 : 1.5} />
                    <span>{m.nombre}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Button fullWidth size="lg" onClick={handlePreSubmit} className="py-4 rounded-2xl shadow-lg shadow-green-600/20 text-lg">
              <span className="flex items-center justify-center gap-2">
                <ShoppingBag size={22} /> Confirmar Compra
              </span>
            </Button>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} /> Tus datos están protegidos y encriptados en nuestro servidor.
            </p>
          </div>
        </div>

      </div>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg relative z-10 shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
            
            <button onClick={() => setShowModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              <X size={24} />
            </button>

            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 mx-auto border-8 border-white dark:border-slate-800 shadow-sm">
              <MapPin className="text-green-600 dark:text-green-400" size={36} />
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-2">
              Confirma tu envío
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm sm:text-base">
              Verifica detalladamente que tu dirección de entrega sea correcta.
            </p>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-8 text-center">
              <p className="text-slate-800 dark:text-slate-200 font-bold text-lg leading-relaxed">
                {direccionCompleta}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" fullWidth size="lg" onClick={() => setShowModal(false)} disabled={loading}>
                Corregir datos
              </Button>
              <Button fullWidth size="lg" onClick={handleConfirmSubmit} loading={loading}>
                Procesar Pago
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}