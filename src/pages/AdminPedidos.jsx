import { useEffect, useState } from 'react'
import { getPedidosAdmin, actualizarEstadoPedido } from '../api/adminApi'

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
  PENDIENTE:       { badge: 'bg-yellow-100 text-yellow-800', icono: '⏳', siguientes: ['EN_PREPARACION', 'CANCELADO'] },
  EN_PREPARACION:  { badge: 'bg-blue-100 text-blue-800',     icono: '🌿', siguientes: ['ENVIADO', 'CANCELADO']         },
  ENVIADO:         { badge: 'bg-purple-100 text-purple-800', icono: '🚚', siguientes: ['ENTREGADO', 'CANCELADO']       },
  ENTREGADO:       { badge: 'bg-green-100 text-green-800',   icono: '✅', siguientes: []                               },
  CANCELADO:       { badge: 'bg-red-100 text-red-800',       icono: '❌', siguientes: []                               },
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
          <h1 className="text-2xl font-bold text-gray-800">📦 Gestión de pedidos</h1>
          <p className="text-gray-500 text-sm">
            Haz clic en un pedido para ver su detalle completo
          </p>
        </div>

        {/* Mensaje de feedback */}
        {mensaje && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium
                           ${mensaje.tipo === 'ok'
                             ? 'bg-green-50 text-green-700 border border-green-200'
                             : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {mensaje.tipo === 'ok' ? '✅' : '⚠'} {mensaje.texto}
          </div>
        )}

        {/* Filtros por estado */}
        <div className="bg-white border border-gray-100 rounded-xl p-4
                        mb-5 flex gap-3 flex-wrap shadow-sm items-center">
          <span className="text-sm text-gray-500 font-medium">Filtrar:</span>
          <div className="flex gap-2 flex-wrap">
            {OPCIONES_FILTRO.map(op => (
              <button
                key={op.valor}
                onClick={() => handleFiltro('estado', op.valor)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium
                            transition-colors border
                            ${filtros.estado === op.valor
                              ? 'bg-green-700 text-white border-green-700'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}
              >
                {op.label}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {pedidos.length} pedido(s) en esta página
          </span>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-2">📦</p>
              <p>No hay pedidos con este filtro</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pedido</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Cambiar estado</th>
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
                      className={`border-b border-gray-50 transition-colors cursor-pointer
                                  ${esActivo
                                    ? 'bg-green-50 border-l-4 border-l-green-600'
                                    : 'hover:bg-gray-50'}`}
                    >
                      {/* Número de pedido */}
                      <td className="px-4 py-3">
                        <p className="font-mono font-semibold text-gray-800 text-xs">
                          {p.numeroPedido}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.detalles?.length ?? 0} producto(s)
                        </p>
                      </td>

                      {/* Cliente: nombre + correo */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {p.nombreCliente || '—'}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {p.emailCliente || ''}
                        </p>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {fmtFecha(p.fechaPedido)}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-right font-semibold text-green-700">
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
                          <span className="text-xs text-gray-400 italic">Estado final</span>
                        ) : (
                          <div className="flex gap-1.5 items-center justify-center">
                            <select
                              value={selVal}
                              onChange={e => setSeleccion(prev => ({
                                ...prev, [p.idPedido]: e.target.value
                              }))}
                              disabled={guardando === p.idPedido}
                              className="text-xs border border-gray-300 rounded-lg
                                         px-2 py-1.5 bg-white focus:outline-none
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
        <p className="text-xs text-gray-400 mt-3 text-center">
          ℹ Haz clic en una fila para ver el detalle · Al cambiar estado el cliente recibe un email
        </p>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => handleFiltro('page', filtros.page - 1)}
              disabled={filtros.page === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg
                         hover:bg-gray-50 disabled:opacity-40"
            >← Anterior</button>
            <span className="px-3 py-1.5 text-sm text-gray-600">
              Página {filtros.page + 1} de {totalPages}
            </span>
            <button
              onClick={() => handleFiltro('page', filtros.page + 1)}
              disabled={filtros.page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg
                         hover:bg-gray-50 disabled:opacity-40"
            >Siguiente →</button>
          </div>
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

// ── Drawer lateral de detalle ───────────────────────────────────────────────
/**
 * Panel lateral deslizante que muestra el detalle completo de un pedido.
 * Se abre al hacer clic en una fila de la tabla y se cierra con la X.
 *
 * Secciones:
 *   1. Header — número de pedido, fecha y badge de estado
 *   2. Cliente — nombre completo y correo
 *   3. Productos — tabla con imagen, nombre, cantidad, precio unitario, subtotal
 *   4. Resumen — total del pedido
 *   5. Dirección de envío
 *   6. Pago — método, estado y monto
 */
function DetallePedidoDrawer({ pedido, onCerrar, fmtPrecio, fmtFechaHora }) {
  const config  = ESTADOS_CONFIG[pedido.estado] ?? ESTADOS_CONFIG.PENDIENTE

  // Nombre legible del método de pago
  const nombreMetodo = pedido.pago?.metodoPago
    ? (NOMBRES_METODO[pedido.pago.metodoPago?.toUpperCase()]
       || pedido.pago.metodoPago.replace(/_/g, ' '))
    : '—'

  // Color del badge de estado del pago
  const esAprobado = pedido.pago?.estadoPago === 'APROBADO'

  return (
    <div className="w-96 flex-shrink-0 bg-white border-l border-gray-200
                    shadow-xl flex flex-col overflow-hidden
                    animate-in slide-in-from-right duration-200">

      {/* ── Header del drawer ────────────────────────────────────────────── */}
      <div className="bg-green-800 px-5 py-4 flex items-start justify-between flex-shrink-0">
        <div>
          {/* Número de pedido */}
          <p className="font-mono font-bold text-white text-sm tracking-wide">
            {pedido.numeroPedido}
          </p>
          {/* Fecha y hora */}
          <p className="text-green-300 text-xs mt-0.5">
            {fmtFechaHora(pedido.fechaPedido)}
          </p>
          {/* Badge de estado */}
          <span className={`inline-flex items-center gap-1 text-xs font-semibold
                            px-2 py-0.5 rounded-full mt-2 ${config.badge}`}>
            {config.icono} {pedido.estado}
          </span>
        </div>
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="text-green-300 hover:text-white transition-colors
                     text-xl leading-none mt-0.5 ml-4"
        >
          ✕
        </button>
      </div>

      {/* ── Contenido scrollable ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* ── Sección: Cliente ─────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase
                         tracking-wider mb-2">
            👤 Cliente
          </h3>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-semibold text-gray-800">
              {pedido.nombreCliente || '—'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {pedido.emailCliente || '—'}
            </p>
          </div>
        </section>

        {/* ── Sección: Productos ───────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase
                         tracking-wider mb-2">
            🛒 Productos ({pedido.detalles?.length ?? 0})
          </h3>

          {(!pedido.detalles || pedido.detalles.length === 0) ? (
            <p className="text-sm text-gray-400 italic">Sin detalles disponibles</p>
          ) : (
            <div className="space-y-2">
              {pedido.detalles.map((d, i) => (
                <div key={i}
                     className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  {/* Imagen del producto */}
                  <div className="w-12 h-12 bg-green-100 rounded-lg overflow-hidden
                                  flex-shrink-0 flex items-center justify-center">
                    {d.imagenUrl
                      ? <img src={d.imagenUrl} alt={d.nombreProducto}
                             className="w-full h-full object-cover"
                             onError={e => { e.target.onerror = null; e.target.src = '' }} />
                      : <span className="text-xl">🌿</span>
                    }
                  </div>

                  {/* Nombre y detalle de precio */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-tight truncate">
                      {d.nombreProducto}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {d.cantidad} × {fmtPrecio(d.precioUnitario)}
                    </p>
                  </div>

                  {/* Subtotal del ítem */}
                  <p className="text-sm font-semibold text-green-700 flex-shrink-0">
                    {fmtPrecio(d.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Sección: Total ───────────────────────────────────────────── */}
        <section>
          <div className="bg-green-800 rounded-xl px-4 py-3
                          flex justify-between items-center">
            <span className="text-green-200 text-sm font-medium">Total del pedido</span>
            <span className="text-white font-bold text-lg">
              {fmtPrecio(pedido.total)}
            </span>
          </div>
        </section>

        {/* ── Sección: Dirección de envío ──────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase
                         tracking-wider mb-2">
            📦 Dirección de envío
          </h3>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {pedido.direccionEnvio || 'No especificada'}
            </p>
          </div>
        </section>

        {/* ── Sección: Pago ────────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase
                         tracking-wider mb-2">
            💳 Pago
          </h3>
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">

            {/* Método de pago */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Método</span>
              <span className="text-sm font-medium text-gray-800">
                {nombreMetodo}
              </span>
            </div>

            {/* Estado del pago */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Estado</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                ${esAprobado
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'}`}>
                {pedido.pago?.estadoPago || '—'}
              </span>
            </div>

            {/* Monto — etiqueta cambia según el estado del pago */}
            <div className="flex justify-between items-center border-t
                            border-gray-200 pt-2 mt-1">
              <span className="text-xs text-gray-500">
                {esAprobado ? 'Monto pagado' : 'Monto a pagar'}
              </span>
              <span className={`text-sm font-bold
                                ${esAprobado ? 'text-green-700' : 'text-yellow-600'}`}>
                {fmtPrecio(pedido.pago?.monto ?? pedido.total)}
              </span>
            </div>
          </div>
        </section>

      </div>
      {/* fin contenido scrollable */}
    </div>
  )
}