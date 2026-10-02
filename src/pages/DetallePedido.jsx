import { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getDetallePedido } from '../api/pedidosApi'
import { 
  ArrowLeft, CheckCircle, Package, Truck, Clock, XCircle, 
  MapPin, CreditCard, ShieldCheck, FileText 
} from 'lucide-react'

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
    <div className="flex justify-center items-center py-32 min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-500" />
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800 inline-block font-medium">
        {error}
      </div>
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
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">

      <Link to="/pedidos"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver a mis pedidos
      </Link>

      {state?.nuevo && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl
                        p-6 mb-8 text-center shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-green-800 dark:text-green-400 tracking-tight">¡Pedido confirmado!</h2>
          <p className="text-green-700 dark:text-green-500 font-medium mt-1">
            Hemos recibido tu pedido y te enviamos un correo con los detalles.
          </p>
        </div>
      )}

      {/* Encabezado del Pedido */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            {pedido.numeroPedido}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 flex items-center gap-1.5">
            <Clock size={16} />
            {formatearFechaColombia(pedido.fechaPedido)}
          </p>
        </div>
        <div>
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border shadow-sm
                            ${cancelado
                              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50'
                              : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'}`}>
            {cancelado ? <XCircle size={16} strokeWidth={2.5} /> : <Package size={16} strokeWidth={2.5} />}
            {pedido.estado}
          </span>
        </div>
      </div>

      {/* Barra de Progreso */}
      {!cancelado && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg mb-8 flex items-center gap-2">
            <Truck className="text-green-600 dark:text-green-500" size={20} /> Seguimiento del pedido
          </h2>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-8">
            <div className="absolute top-5 left-10 right-10 h-1 bg-slate-100 dark:bg-slate-700 rounded-full z-0" />
            <div
              className="absolute top-5 left-10 h-1 bg-green-500 rounded-full z-0 transition-all duration-1000 ease-out"
              style={{
                width: pasoActual >= 0
                  ? `calc(${(pasoActual / (PASOS.length - 1)) * 100}% - 2.5rem)`
                  : '0%'
              }}
            />
            <div className="flex justify-between relative z-10">
              {PASOS.map((paso, i) => {
                const isActive = i <= pasoActual
                const isCurrent = i === pasoActual
                return (
                  <div key={paso} className="flex flex-col items-center w-24">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border-4 shadow-sm
                                     ${isActive
                                       ? 'bg-green-600 border-green-100 dark:border-green-900/50 text-white'
                                       : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>
                      {isActive && !isCurrent ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <p className={`text-[10px] sm:text-xs mt-3 text-center font-bold uppercase tracking-wider
                                   ${isActive
                                     ? 'text-green-700 dark:text-green-400'
                                     : 'text-slate-400 dark:text-slate-500'}`}>
                      {paso.replace('_', ' ')}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2 Columnas de Información */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Lista de Productos (Ocupa 2 de 3 fracciones en desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-1">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <FileText className="text-slate-500" size={18} />
              <h2 className="font-bold text-slate-900 dark:text-white">Artículos del Pedido</h2>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {pedido.detalles?.map((d, idx) => (
                <div key={idx} className="flex items-center gap-4 px-6 py-5">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-700/50">
                    {d.imagenUrl
                      ? <img src={d.imagenUrl} alt={d.nombreProducto} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                      : <Package className="text-slate-300 dark:text-slate-600" size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {d.nombreProducto}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                      <span className="text-slate-700 dark:text-slate-300 font-bold">{d.cantidad}</span> un. × {formatearPrecio(d.precioUnitario)}
                    </p>
                  </div>
                  <p className="font-black text-slate-900 dark:text-white text-lg">
                    {formatearPrecio(d.subtotal)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-lg uppercase tracking-wider">Total Final</span>
              <span className="font-black text-green-700 dark:text-green-400 text-2xl">
                {formatearPrecio(pedido.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Envío y Pago */}
        <div className="flex flex-col gap-6">
          
          {/* Envío */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <MapPin size={20} />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Dirección de Envío</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              {pedido.direccionEnvio || 'No especificada'}
            </p>
          </div>

          {/* Pago */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <CreditCard size={20} />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Detalles del Pago</h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Método</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {nombreMetodo || <span className="text-amber-500">Procesando...</span>}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider
                                  ${esAprobado
                                    ? 'bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                    : 'bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                  {estadoPago}
                </span>
              </div>
              
              <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Monto Cobrado</span>
                <span className="font-black text-green-700 dark:text-green-400 text-lg">
                  {formatearPrecio(montoPago)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> Transacción segura verificada
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}