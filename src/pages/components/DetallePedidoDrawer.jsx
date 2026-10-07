import React from 'react'
import { X, User, MapPin, CreditCard, Package, Clock, Truck, CheckCircle, XCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react'

// Icon mapping component to make it easy to render
const EstadoIcon = ({ estado, className = "", size = 16 }) => {
  switch(estado) {
    case 'PENDIENTE': return <Clock size={size} className={className} />;
    case 'EN_PREPARACION': return <Package size={size} className={className} />;
    case 'ENVIADO': return <Truck size={size} className={className} />;
    case 'ENTREGADO': return <CheckCircle size={size} className={className} />;
    case 'CANCELADO': return <XCircle size={size} className={className} />;
    default: return <AlertTriangle size={size} className={className} />;
  }
}

const ESTADOS_CONFIG = {
  PENDIENTE: { badge: 'bg-yellow-500 text-white shadow-sm shadow-yellow-500/30 border-transparent' },
  EN_PREPARACION: { badge: 'bg-blue-500 text-white shadow-sm shadow-blue-500/30 border-transparent' },
  ENVIADO: { badge: 'bg-purple-500 text-white shadow-sm shadow-purple-500/30 border-transparent' },
  ENTREGADO: { badge: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 border-transparent' },
  CANCELADO: { badge: 'bg-red-500 text-white shadow-sm shadow-red-500/30 border-transparent' },
}

const NOMBRES_METODO = {
  'TARJETA_CREDITO': 'Tarjeta de Crédito',
  'TRANSFERENCIA_BANCARIA': 'Transferencia',
  'CONTRA_ENTREGA': 'Pago Contra Entrega',
  'PAYPAL': 'PayPal',
}

export default function DetallePedidoDrawer({ pedido, onCerrar, fmtPrecio, fmtFechaHora }) {
  const config  = ESTADOS_CONFIG[pedido.estado] ?? ESTADOS_CONFIG.PENDIENTE

  const nombreMetodo = pedido.pago?.metodoPago
    ? (NOMBRES_METODO[pedido.pago.metodoPago?.toUpperCase()]
       || pedido.pago.metodoPago.replace(/_/g, ' '))
    : '—'

  const esAprobado = pedido.pago?.estadoPago === 'APROBADO'

  return (
    <div className="w-full md:w-96 flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800
                    shadow-2xl flex flex-col overflow-hidden z-50
                    animate-in slide-in-from-right duration-300">

      {/* HEADER DRAWER */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-700 px-6 py-5 flex items-start justify-between flex-shrink-0 shadow-md relative overflow-hidden">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <p className="font-mono font-black text-white text-base tracking-widest drop-shadow-sm">
            {pedido.numeroPedido}
          </p>
          <p className="text-teal-100 font-medium text-xs mt-1">
            {fmtFechaHora(pedido.fechaPedido)}
          </p>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide
                            px-3 py-1 rounded-xl mt-3 border ${config.badge}`}>
            <EstadoIcon estado={pedido.estado} size={14} />
            {pedido.estado}
          </span>
        </div>
        <button
          onClick={onCerrar}
          className="relative z-10 text-teal-100 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* CLIENTE */}
        <section>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            <User size={14} className="text-teal-500" />
            <h3>Cliente</h3>
          </div>
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm">
            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {pedido.nombreCliente || '—'}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              {pedido.emailCliente || '—'}
            </p>
          </div>
        </section>

        {/* PRODUCTOS */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Package size={14} className="text-teal-500" />
              <h3>Productos</h3>
            </div>
            <span className="bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 font-bold text-xs px-2 py-0.5 rounded-lg">
              {pedido.detalles?.length ?? 0}
            </span>
          </div>

          {(!pedido.detalles || pedido.detalles.length === 0) ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium italic">Sin detalles disponibles</p>
          ) : (
            <div className="space-y-3">
              {pedido.detalles.map((d, i) => (
                <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3 shadow-sm hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {d.imagenUrl
                      ? <img src={d.imagenUrl} alt={d.nombreProducto} className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = '' }} />
                      : <ImageIcon size={20} className="text-slate-300 dark:text-slate-500" strokeWidth={1.5} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                      {d.nombreProducto}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {d.cantidad} x <span className="text-slate-400">{fmtPrecio(d.precioUnitario)}</span>
                    </p>
                  </div>
                  <p className="text-sm font-black text-teal-600 dark:text-teal-400 flex-shrink-0">
                    {fmtPrecio(d.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TOTAL DEL PEDIDO */}
        <section>
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl px-5 py-4 flex justify-between items-center shadow-md shadow-teal-500/20 text-white">
            <span className="text-teal-50 text-sm font-bold tracking-wide">Total del pedido</span>
            <span className="font-black text-xl drop-shadow-sm">
              {fmtPrecio(pedido.total)}
            </span>
          </div>
        </section>

        {/* DIRECCIÓN */}
        <section>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            <MapPin size={14} className="text-teal-500" />
            <h3>Dirección de envío</h3>
          </div>
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
              {pedido.direccionEnvio || 'No especificada'}
            </p>
          </div>
        </section>

        {/* PAGO */}
        <section>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            <CreditCard size={14} className="text-teal-500" />
            <h3>Información de Pago</h3>
          </div>
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-400">Método</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {nombreMetodo}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/50">
              <span className="text-xs font-bold text-slate-400">Estado</span>
              <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                esAprobado 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {pedido.pago?.estadoPago || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-bold text-slate-400">Monto Transado</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {pedido.pago?.monto ? fmtPrecio(pedido.pago.monto) : '—'}
              </span>
            </div>
          </div>
        </section>
        
        {/* Espacio extra al final para scroll cómodo */}
        <div className="h-4"></div>
      </div>
    </div>
  )
}
