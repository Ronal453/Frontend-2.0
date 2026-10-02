import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistorial } from '../api/pedidosApi'
import { 
  Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, Inbox, Search 
} from 'lucide-react'

const ESTADO_ESTILO = {
  PENDIENTE:       { clase: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/50', icono: Clock },
  EN_PREPARACION:  { clase: 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',   icono: Package },
  ENVIADO:         { clase: 'bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50', icono: Truck },
  ENTREGADO:       { clase: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50', icono: CheckCircle },
  CANCELADO:       { clase: 'bg-red-100/80 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50',     icono: XCircle },
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 dark:from-slate-900 dark:via-[#0F172A] dark:to-indigo-950/20 relative z-0 overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-blue-300/20 dark:bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-violet-300/20 dark:bg-violet-600/5 blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center shadow-sm">
            <Package className="text-blue-600 dark:text-blue-400" size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-indigo-950 dark:text-white tracking-tight drop-shadow-sm">
              Historial de Pedidos
            </h1>
            <p className="text-indigo-700/80 dark:text-slate-400 text-sm md:text-base mt-1 font-medium">
              Revisa el estado y detalle de tus compras recientes.
            </p>
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div className="text-center py-24 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-slate-700/50 shadow-xl shadow-blue-900/5">
            <div className="w-24 h-24 bg-blue-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Inbox className="text-blue-300 dark:text-blue-500/50" size={48} />
            </div>
            <h3 className="text-2xl font-black text-indigo-950 dark:text-white mb-3">
              Aún no tienes pedidos
            </h3>
            <p className="text-indigo-700/70 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">
              Explora nuestro catálogo y realiza tu primera compra para llenar este espacio de vida.
            </p>
            <Link to="/catalogo"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/90 dark:hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl
                             font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30">
              <Search size={20} strokeWidth={2.5} /> Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/80 dark:border-slate-700/50 shadow-xl shadow-blue-900/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header Desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-blue-50/50 dark:bg-slate-800/50 border-b border-blue-100/50 dark:border-slate-700/50 text-xs font-black text-indigo-800/60 dark:text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">Pedido</div>
              <div className="col-span-3">Fecha</div>
              <div className="col-span-2 text-center">Artículos</div>
              <div className="col-span-2 text-center">Estado</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Lista de Pedidos */}
            <div className="divide-y divide-blue-50/80 dark:divide-slate-700/50">
              {pedidos.map(p => {
                const config = ESTADO_ESTILO[p.estado] ?? ESTADO_ESTILO['PENDIENTE']
                const Icon = config.icono
                const fecha = new Date((p.fechaPedido || '') + 'Z')
                  .toLocaleDateString('es-CO', {
                    year:     'numeric',
                    month:    'short',
                    day:      'numeric',
                    timeZone: 'America/Bogota'
                  })

                return (
                  <Link
                    key={p.idPedido}
                    to={`/pedidos/${p.idPedido}`}
                    className="group block p-5 md:px-8 hover:bg-white/90 dark:hover:bg-slate-800/80 transition-all duration-300"
                  >
                    {/* Vista Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3 font-black text-indigo-950 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.numeroPedido}
                      </div>
                      
                      <div className="col-span-3 text-indigo-900/70 dark:text-slate-300 font-semibold text-sm flex items-center gap-2">
                         <Clock size={16} className="text-blue-400/70" />
                         {fecha}
                      </div>
                      
                      <div className="col-span-2 text-center text-indigo-900/60 dark:text-slate-400 font-bold">
                        {p.detalles?.length ?? 0}
                      </div>
                      
                      <div className="col-span-2 flex justify-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm ${config.clase}`}>
                          <Icon size={14} strokeWidth={3} /> {p.estado}
                        </span>
                      </div>
                      
                      <div className="col-span-2 flex items-center justify-end gap-3 text-right">
                        <span className="font-black text-slate-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          ${p.total?.toLocaleString('es-CO')}
                        </span>
                        <ChevronRight size={20} className="text-blue-200 dark:text-slate-600 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-indigo-950 dark:text-white mb-1 text-lg group-hover:text-blue-600 transition-colors">
                            {p.numeroPedido}
                          </p>
                          <p className="text-sm text-indigo-900/70 font-semibold flex items-center gap-1.5">
                            <Clock size={14} className="text-blue-400/70" /> {fecha}
                          </p>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          ${p.total?.toLocaleString('es-CO')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-4 border-t border-blue-50 dark:border-slate-700/50">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${config.clase}`}>
                          <Icon size={12} strokeWidth={3} /> {p.estado}
                        </span>
                        <div className="flex items-center gap-1 text-sm font-bold text-blue-400 group-hover:text-blue-600 transition-colors">
                          Detalles <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>

                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}