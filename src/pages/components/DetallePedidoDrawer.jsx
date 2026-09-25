import React from 'react'

const ESTADOS_CONFIG = {
  PENDIENTE: {
    badge: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50',
    icono: '⏳',
  },
  EN_PREPARACION: {
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
    icono: '📦',
  },
  ENVIADO: {
    badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
    icono: '🚚',
  },
  ENTREGADO: {
    badge: 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50',
    icono: '✅',
  },
  CANCELADO: {
    badge: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50',
    icono: '❌',
  },
}

const NOMBRES_METODO = {
  'TARJETA_CREDITO': '💳 Tarjeta de Crédito',
  'TRANSFERENCIA_BANCARIA': '🏦 Transferencia',
  'CONTRA_ENTREGA': '💵 Pago Contra Entrega',
  'PAYPAL': '📱 PayPal',
}

export default function DetallePedidoDrawer({ pedido, onCerrar, fmtPrecio, fmtFechaHora }) {
  const config  = ESTADOS_CONFIG[pedido.estado] ?? ESTADOS_CONFIG.PENDIENTE

  const nombreMetodo = pedido.pago?.metodoPago
    ? (NOMBRES_METODO[pedido.pago.metodoPago?.toUpperCase()]
       || pedido.pago.metodoPago.replace(/_/g, ' '))
    : '—'

  const esAprobado = pedido.pago?.estadoPago === 'APROBADO'

  return (
    <div className="w-96 flex-shrink-0 bg-white dark:bg-gray-850 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700
                    shadow-xl flex flex-col overflow-hidden
                    animate-in slide-in-from-right duration-200">

      <div className="bg-green-800 dark:bg-gray-950 px-5 py-4 flex items-start justify-between flex-shrink-0 border-b border-transparent dark:border-gray-750">
        <div>
          <p className="font-mono font-bold text-white text-sm tracking-wide">
            {pedido.numeroPedido}
          </p>
          <p className="text-green-300 dark:text-gray-400 text-xs mt-0.5">
            {fmtFechaHora(pedido.fechaPedido)}
          </p>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold
                            px-2 py-0.5 rounded-full mt-2 border ${config.badge}`}>
            {config.icono} {pedido.estado}
          </span>
        </div>
        <button
          onClick={onCerrar}
          className="text-green-300 hover:text-white transition-colors
                     text-xl leading-none mt-0.5 ml-4"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <section>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2">
            👤 Cliente
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3">
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {pedido.nombreCliente || '—'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pedido.emailCliente || '—'}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2">
            🛒 Productos ({pedido.detalles?.length ?? 0})
          </h3>

          {(!pedido.detalles || pedido.detalles.length === 0) ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sin detalles disponibles</p>
          ) : (
            <div className="space-y-2">
              {pedido.detalles.map((d, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {d.imagenUrl
                      ? <img src={d.imagenUrl} alt={d.nombreProducto} className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = '' }} />
                      : <span className="text-xl">🌿</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight truncate">
                      {d.nombreProducto}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {d.cantidad} × {fmtPrecio(d.precioUnitario)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 flex-shrink-0">
                    {fmtPrecio(d.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="bg-green-800 dark:bg-emerald-900/80 rounded-xl px-4 py-3 flex justify-between items-center border border-transparent dark:border-emerald-700/50">
            <span className="text-green-200 dark:text-emerald-200 text-sm font-medium">Total del pedido</span>
            <span className="text-white font-bold text-lg">
              {fmtPrecio(pedido.total)}
            </span>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2">
            📦 Dirección de envío
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3">
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
              {pedido.direccionEnvio || 'No especificada'}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider mb-2">
            💳 Pago
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Método</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {nombreMetodo}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Estado</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${esAprobado ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50' : 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50'}`}>
                {pedido.pago?.estadoPago || '—'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {esAprobado ? 'Monto pagado' : 'Monto a pagar'}
              </span>
              <span className={`text-sm font-bold ${esAprobado ? 'text-green-700 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {fmtPrecio(pedido.pago?.monto ?? pedido.total)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
