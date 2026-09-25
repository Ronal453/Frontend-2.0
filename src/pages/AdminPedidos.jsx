import { useEffect, useState } from 'react'
import { getPedidosAdmin, actualizarEstadoPedido } from '../api/adminApi'
import FlashMessage from '../components/ui/FlashMessage'
import Pagination from '../components/ui/Pagination'
import DetallePedidoDrawer from './components/DetallePedidoDrawer'

/**
 * Página de gestión de pedidos — Panel Admin.
 *
 * NUEVO — Detalle de pedido:
 *   Al hacer clic en una fila de la tabla, se abre un panel lateral (drawer)
 *   con el detalle completo del pedido seleccionado:
 *     - Número, fecha y estado
 *     - Datos del cliente (nombre + correo)
 *     - Tabla de productos (imagen, nombre, cantidad, precio, subtotal)
 *     - Dirección de envío
 *     - Información del pago (método, estado, monto)
 *
 *   Los datos ya vienen del listado (detalles y pago incluidos en la response),
 *   así que no se necesita una nueva llamada a la API al abrir el detalle.
 *
 */

const ESTADOS_CONFIG = {
  PENDIENTE:       { badge: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50', icono: '⏳', siguientes: ['EN_PREPARACION', 'CANCELADO'] },
  EN_PREPARACION:  { badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',     icono: '🌿', siguientes: ['ENVIADO', 'CANCELADO']         },
  ENVIADO:         { badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50', icono: '🚚', siguientes: ['ENTREGADO', 'CANCELADO']       },
  ENTREGADO:       { badge: 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50',   icono: '✅', siguientes: []                               },
  CANCELADO:       { badge: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50',       icono: '❌', siguientes: []                               },
}

const OPCIONES_FILTRO = [
  { valor: '',               label: 'Todos los estados' },
  { valor: 'PENDIENTE',      label: '⏳ Pendiente'  },
  { valor: 'EN_PREPARACION', label: '🌿 Preparando' },
  { valor: 'ENVIADO',        label: '🚚 Enviado'    },
  { valor: 'ENTREGADO',      label: '✅ Entregado'  },
  { valor: 'CANCELADO',      label: '❌ Cancelado'  },
]

// Nombres legibles para los métodos de pago
const NOMBRES_METODO = {
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  TARJETA_DEBITO:  'Tarjeta de Débito',
  TRANSFERENCIA:   'PSE',
  EFECTIVO:        'Contra entrega',
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
        // Si el detalle abierto corresponde a un pedido que se recargó,
        // actualizar sus datos para que el drawer muestre el estado nuevo
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
        '⚠ ¿Confirmas cancelar este pedido?\n' +
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
    // Contenedor flex: tabla a la izquierda, drawer a la derecha cuando hay detalle
    <div className="flex h-full">

      {/* ── Panel principal (tabla) ─────────────────────────────────────── */}
      <div className={`flex-1 p-6 overflow-auto transition-all duration-300
                       ${pedidoDetalle ? 'mr-0' : ''}`}>

        {/* Encabezado */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">📦 Gestión de pedidos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Haz clic en un pedido para ver su detalle completo
          </p>
        </div>

        {/* Mensaje de feedback */}
        <FlashMessage mensaje={mensaje} />

        {/* Filtros por estado */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4
                        mb-5 flex gap-3 flex-wrap shadow-sm items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Filtrar:</span>
          <div className="flex gap-2 flex-wrap">
            {OPCIONES_FILTRO.map(op => (
              <button
                key={op.valor}
                onClick={() => handleFiltro('estado', op.valor)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium
                            transition-colors border
                            ${filtros.estado === op.valor
                              ? 'bg-green-700 dark:bg-green-600 text-white border-green-700 dark:border-green-600 shadow-sm'
                              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'}`}
              >
                {op.label}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
            {pedidos.length} pedido(s) en esta página
          </span>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p className="text-4xl mb-2">📦</p>
              <p>No hay pedidos con este filtro</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Pedido</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Cambiar estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(p => {
                  const config  = ESTADOS_CONFIG[p.estado] ?? ESTADOS_CONFIG.PENDIENTE
                  const haySig  = config.siguientes.length > 0
                  const selVal  = seleccion[p.idPedido] ?? ''
                  // Fila activa: la que está abierta en el drawer
                  const esActivo = pedidoDetalle?.idPedido === p.idPedido

                  return (
                    <tr
                      key={p.idPedido}
                      onClick={() => setPedidoDetalle(esActivo ? null : p)}
                      className={`border-b border-gray-50 dark:border-gray-700/60 transition-colors cursor-pointer
                                  ${esActivo
                                    ? 'bg-green-50 dark:bg-green-950/40 border-l-4 border-l-green-600 dark:border-l-green-500'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'}`}
                    >
                      {/* Número de pedido */}
                      <td className="px-4 py-3">
                        <p className="font-mono font-semibold text-gray-800 dark:text-gray-100 text-xs">
                          {p.numeroPedido}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {p.detalles?.length ?? 0} producto(s)
                        </p>
                      </td>

                      {/* Cliente: nombre + correo */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
                          {p.nombreCliente || '—'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {p.emailCliente || ''}
                        </p>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {fmtFecha(p.fechaPedido)}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right font-semibold text-green-700 dark:text-green-400">
                        {fmtPrecio(p.total)}
                      </td>

                      {/* Badge estado */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs
                                          font-semibold px-2 py-1 rounded-full
                                          ${config.badge}`}>
                          {config.icono} {p.estado}
                        </span>
                      </td>

                      {/* Selector de estado — detener propagación para no abrir drawer */}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        {!haySig ? (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Estado final</span>
                        ) : (
                          <div className="flex gap-1.5 items-center justify-center">
                            <select
                              value={selVal}
                              onChange={e => setSeleccion(prev => ({
                                ...prev, [p.idPedido]: e.target.value
                              }))}
                              disabled={guardando === p.idPedido}
                              className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg
                                         px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none
                                         focus:ring-2 focus:ring-green-500
                                         disabled:opacity-50 min-w-[120px]"
                            >
                              <option value="">Nuevo estado...</option>
                              {config.siguientes.map(s => (
                                <option key={s} value={s}>
                                  {ESTADOS_CONFIG[s]?.icono} {s}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleCambiarEstado(p.idPedido)}
                              disabled={!selVal || guardando === p.idPedido}
                              className="text-xs px-2.5 py-1.5 bg-green-700 text-white
                                         rounded-lg hover:bg-green-800 disabled:opacity-40
                                         disabled:cursor-not-allowed transition-colors
                                         font-medium whitespace-nowrap"
                            >
                              {guardando === p.idPedido
                                ? <span className="inline-block w-3 h-3 border-2
                                                   border-white border-t-transparent
                                                   rounded-full animate-spin" />
                                : 'Aplicar'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Nota */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
          ℹ Haz clic en una fila para ver el detalle · Al cambiar estado el cliente recibe un email
        </p>

        {/* Paginación */}
        {totalPages > 1 && (
          <Pagination
            currentPage={filtros.page}
            totalPages={totalPages}
            onPageChange={page => handleFiltro('page', page)}
          />
        )}
      </div>

      {/* ── Drawer de detalle del pedido ────────────────────────────────── */}
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

// Componente extraído a components/DetallePedidoDrawer.jsx