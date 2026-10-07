import { useEffect, useState, useRef } from 'react'
import { getPedidosAdmin, actualizarEstadoPedido } from '../api/adminApi'
import FlashMessage from '../components/ui/FlashMessage'
import Pagination from '../components/ui/Pagination'
import DetallePedidoDrawer from './components/DetallePedidoDrawer'
import { ShoppingBag, Clock, Package, Truck, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

/**
 * Página de gestión de pedidos — Panel Admin.
 *
 * Estilo Eco-Tech Minimalista aplicado.
 */

// Mapeo de iconos para cada estado de pedido usando Lucide React en lugar de emojis
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

// Configuración visual para badges de estado y botones
const ESTADOS_CONFIG = {
  PENDIENTE:       { colorHex: '#ca8a04', textClass: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50', iconColor: 'text-yellow-500', borderColor: 'border-yellow-200 dark:border-yellow-800/50', siguientes: ['EN_PREPARACION', 'CANCELADO'] },
  EN_PREPARACION:  { colorHex: '#2563eb', textClass: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',          iconColor: 'text-blue-500', borderColor: 'border-blue-200 dark:border-blue-800/50', siguientes: ['ENVIADO', 'CANCELADO'] },
  ENVIADO:         { colorHex: '#9333ea', textClass: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50', iconColor: 'text-purple-500', borderColor: 'border-purple-200 dark:border-purple-800/50', siguientes: ['ENTREGADO', 'CANCELADO'] },
  ENTREGADO:       { colorHex: '#059669', textClass: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50', iconColor: 'text-emerald-500', borderColor: 'border-emerald-200 dark:border-emerald-800/50', siguientes: [] },
  CANCELADO:       { colorHex: '#dc2626', textClass: 'text-red-600 dark:text-red-400', badge: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',                iconColor: 'text-red-500', borderColor: 'border-red-200 dark:border-red-800/50', siguientes: [] },
}

const OPCIONES_FILTRO = [
  { valor: '',               label: 'Todos los estados' },
  { valor: 'PENDIENTE',      label: 'Pendiente' },
  { valor: 'EN_PREPARACION', label: 'Preparando' },
  { valor: 'ENVIADO',        label: 'Enviado' },
  { valor: 'ENTREGADO',      label: 'Entregado' },
  { valor: 'CANCELADO',      label: 'Cancelado' },
]

const StatusDropdown = ({ valor, opciones, onCambio, disabled, guardando }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedConfig = valor ? ESTADOS_CONFIG[valor] : null
  const selectedLabel = valor ? (OPCIONES_FILTRO.find(op => op.valor === valor)?.label || valor) : 'Cambiar a...'

  return (
    <div className="relative min-w-[150px]" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled || guardando}
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border outline-none focus:ring-2 focus:ring-teal-500
          ${valor 
            ? `bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${selectedConfig?.borderColor} shadow-sm` 
            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-teal-400'
          }
          ${disabled || guardando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center gap-1.5">
          {valor && <EstadoIcon estado={valor} size={14} className={selectedConfig?.iconColor} />}
          {selectedLabel}
        </span>
        <span className="text-slate-400 text-[10px]">▼</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[160px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700/80 overflow-hidden z-50 animate-fade-in origin-top-left">
          {opciones.map(op => {
            const labelStr = OPCIONES_FILTRO.find(f => f.valor === op)?.label || op
            const conf = ESTADOS_CONFIG[op]
            return (
              <button
                key={op}
                type="button"
                onClick={() => {
                  onCambio(op)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300`}
              >
                <EstadoIcon estado={op} size={14} className={conf?.iconColor} />
                {labelStr}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminPedidos() {
  const [pedidos,        setPedidos]        = useState([])
  const [totalPages,     setTotalPages]     = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [filtros,        setFiltros]        = useState({ estado: '', page: 0, size: 15 })
  const [guardando,      setGuardando]      = useState(null)
  const [mensaje,        setMensaje]        = useState(null)
  const [seleccion,      setSeleccion]      = useState({})

  // Estado del pedido seleccionado para ver detalle
  const [pedidoDetalle,  setPedidoDetalle]  = useState(null)

  useEffect(() => { cargarPedidos() }, [filtros])

  const cargarPedidos = () => {
    setLoading(true)
    getPedidosAdmin(filtros)
      .then(r => {
        const lista = r.data.content ?? []
        setPedidos(lista)
        setTotalPages(r.data.totalPages ?? 0)
        const init = {}
        lista.forEach(p => { init[p.idPedido] = '' })
        setSeleccion(init)
        // Si el detalle abierto corresponde a un pedido que se recargó, actualizar sus datos
        if (pedidoDetalle) {
          const actualizado = lista.find(p => p.idPedido === pedidoDetalle.idPedido)
          if (actualizado) setPedidoDetalle(actualizado)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleFiltro = (campo, valor) =>
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      ...(campo !== 'page' && { page: 0 })
    }))

  const handleCambiarEstado = async (idPedido) => {
    const nuevoEstado = seleccion[idPedido]
    if (!nuevoEstado) return

    if (nuevoEstado === 'CANCELADO') {
      const ok = window.confirm(
        '⚠️ ¿Confirmas cancelar este pedido?\n' +
        'El stock de los productos se restaurará automáticamente.'
      )
      if (!ok) return
    }

    setGuardando(idPedido)
    try {
      await actualizarEstadoPedido(idPedido, nuevoEstado)
      mostrarMensaje('ok',
        `Pedido actualizado a "${nuevoEstado}". ${
          nuevoEstado === 'CANCELADO' ? 'Stock restaurado. ' : ''
        }Email enviado al cliente.`)
      await cargarPedidos()
    } catch (e) {
      mostrarMensaje('error', e.response?.data?.mensaje || 'Error al cambiar estado')
    } finally {
      setGuardando(null)
    }
  }

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 4000)
  }

  const fmtFecha = (fechaStr) => {
    if (!fechaStr) return '—'
    try {
      const f = fechaStr.includes('Z') ? fechaStr : fechaStr + 'Z'
      return new Date(f).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        timeZone: 'America/Bogota'
      })
    } catch { return fechaStr }
  }

  const fmtFechaHora = (fechaStr) => {
    if (!fechaStr) return '—'
    try {
      const f = fechaStr.includes('Z') ? fechaStr : fechaStr + 'Z'
      return new Date(f).toLocaleString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
        timeZone: 'America/Bogota'
      })
    } catch { return fechaStr }
  }

  const fmtPrecio = (val) =>
    '$' + Number(val ?? 0).toLocaleString('es-CO')

  return (
    <div className="flex h-full animate-fade-in">
      <div className={`flex-1 p-4 md:p-8 max-w-7xl mx-auto overflow-auto transition-all duration-300 ${pedidoDetalle ? 'mr-0' : ''}`}>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white">
              <ShoppingBag size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                Gestión de Pedidos
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                Haz clic en un pedido para ver su detalle completo
              </p>
            </div>
          </div>
        </div>

        <FlashMessage mensaje={mensaje} />

        {/* FILTERS */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Estado:</span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            {OPCIONES_FILTRO.map(op => {
              const borderClass = op.valor !== '' ? (ESTADOS_CONFIG[op.valor]?.borderColor || 'border-slate-200 dark:border-slate-700') : 'border-slate-200 dark:border-slate-700'
              const iconColor = op.valor !== '' ? (ESTADOS_CONFIG[op.valor]?.iconColor || 'text-slate-400') : 'text-slate-400'
              return (
                <button
                  key={op.valor}
                  onClick={() => handleFiltro('estado', op.valor)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border
                    ${filtros.estado === op.valor
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white border-transparent shadow-md shadow-teal-500/20'
                      : `bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ${borderClass} hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-500`
                    }`}
                >
                  {op.valor !== '' && <EstadoIcon estado={op.valor} size={16} className={filtros.estado === op.valor ? 'text-white' : iconColor} />}
                  {op.label}
                </button>
              )
            })}
          </div>
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {pedidos.length} pedido(s)
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400">
              <ShoppingBag size={48} className="mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1} />
              <p className="font-medium">No hay pedidos con este filtro</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-700/80 border-b-2 border-slate-300 dark:border-slate-600">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Pedido</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Cliente</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Fecha</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-right">Total</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Estado</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {pedidos.map(p => {
                    const config  = ESTADOS_CONFIG[p.estado] ?? ESTADOS_CONFIG.PENDIENTE
                    const haySig  = config.siguientes.length > 0
                    const selVal  = seleccion[p.idPedido] ?? ''
                    const esActivo = pedidoDetalle?.idPedido === p.idPedido

                    return (
                      <tr
                        key={p.idPedido}
                        onClick={() => setPedidoDetalle(esActivo ? null : p)}
                        className={`group transition-all duration-200 cursor-pointer
                          ${esActivo
                            ? 'bg-teal-50/50 dark:bg-teal-900/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/80'
                          }`}
                      >
                        {/* NÚMERO DE PEDIDO */}
                        <td className="px-6 py-4 relative">
                          {esActivo && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r-full" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                              {p.numeroPedido}
                            </span>
                            <span className="text-xs font-medium text-slate-400 mt-1">
                              {p.detalles?.length ?? 0} producto(s)
                            </span>
                          </div>
                        </td>

                        {/* CLIENTE */}
                        <td className="px-6 py-4 max-w-[180px]">
                          <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {p.nombreCliente || '—'}
                          </p>
                          <p className="text-xs font-medium text-slate-400 truncate mt-1">
                            {p.emailCliente || ''}
                          </p>
                        </td>

                        {/* FECHA */}
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                          {fmtFecha(p.fechaPedido)}
                        </td>

                        {/* TOTAL */}
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-teal-600 dark:text-teal-400">
                            {fmtPrecio(p.total)}
                          </span>
                        </td>

                        {/* ESTADO */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide uppercase ${config.badge}`}>
                            <EstadoIcon estado={p.estado} size={14} />
                            {p.estado}
                          </span>
                        </td>

                        {/* ACCIONES */}
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          {!haySig ? (
                            <div className="flex justify-center text-xs font-medium text-slate-400 italic">
                              Estado final
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <StatusDropdown
                                valor={selVal}
                                opciones={config.siguientes}
                                guardando={guardando === p.idPedido}
                                onCambio={val => setSeleccion(prev => ({ ...prev, [p.idPedido]: val }))}
                              />

                              <button
                                onClick={() => handleCambiarEstado(p.idPedido)}
                                disabled={!selVal || guardando === p.idPedido}
                                className="flex items-center justify-center h-8 px-4 rounded-xl text-xs font-bold text-white
                                           bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700
                                           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-teal-500/20"
                              >
                                {guardando === p.idPedido ? <Loader2 size={14} className="animate-spin" /> : 'Aplicar'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={filtros.page}
              totalPages={totalPages}
              onPageChange={page => handleFiltro('page', page)}
            />
          </div>
        )}
      </div>

      {/* DRAWER */}
      {pedidoDetalle && (
        <DetallePedidoDrawer
          pedido={pedidoDetalle}
          onCerrar={() => setPedidoDetalle(null)}
          fmtPrecio={fmtPrecio}
          fmtFechaHora={fmtFechaHora}
        />
      )}
    </div>
  )
}