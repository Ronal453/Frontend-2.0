import { useState, useEffect } from 'react'
import {
  getLotes,
  cambiarEstadoLote,
  getHistorialLote,
  getZonas,
  getCausasMerma,
  registrarMerma
} from '../../api/trabajadorApi'

const ESTADOS_LOTE = [
  { id: '', label: 'Todos los estados' },
  { id: 'GERMINANDO', label: '🌱 Germinando' },
  { id: 'CRECIENDO', label: '🌿 Creciendo' },
  { id: 'LISTO_PARA_VENTA', label: '🌸 Listo para Venta' },
  { id: 'DESCARTADO', label: '🍂 Descartado' },
]

const ESTADO_BADGES = {
  GERMINANDO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CRECIENDO: 'bg-blue-100 text-blue-800 border-blue-200',
  LISTO_PARA_VENTA: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  DESCARTADO: 'bg-red-100 text-red-800 border-red-200',
}

export default function TrabajadorLotes() {
  const [lotes, setLotes] = useState([])
  const [zonas, setZonas] = useState([])
  const [filtroZona, setFiltroZona] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Modal Cambiar Estado
  const [modalEstado, setModalEstado] = useState({
    abierto: false,
    lote: null,
    nuevoEstado: '',
    observaciones: '',
    enviando: false,
  })

  // Modal Historial
  const [modalHistorial, setModalHistorial] = useState({
    abierto: false,
    lote: null,
    historial: [],
    cargando: false,
  })

  // Modal Rápido de Merma
  const [modalMerma, setModalMerma] = useState({
    abierto: false,
    lote: null,
    causas: [],
    idCausa: '',
    cantidadPerdida: 1,
    fechaMerma: new Date().toISOString().split('T')[0],
    observaciones: '',
    enviando: false,
  })

  // Cargar Zonas al montar
  useEffect(() => {
    getZonas()
      .then(res => setZonas(res.data))
      .catch(err => console.error('Error cargando zonas:', err))
  }, [])

  // Cargar Lotes cuando cambien filtros o página
  const cargarLotes = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await getLotes({
        idZona: filtroZona || undefined,
        estado: filtroEstado || undefined,
        page: pagina,
        size: 10,
      })
      setLotes(res.data.content || [])
      setTotalPaginas(res.data.totalPages || 1)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar los lotes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarLotes()
  }, [filtroZona, filtroEstado, pagina])

  // Abrir modal de cambio de estado
  const abrirCambioEstado = (lote) => {
    // Calcular siguiente estado sugerido según el ciclo
    let sugerido = ''
    if (lote.estadoLote === 'GERMINANDO') sugerido = 'CRECIENDO'
    else if (lote.estadoLote === 'CRECIENDO') sugerido = 'LISTO_PARA_VENTA'

    setModalEstado({
      abierto: true,
      lote,
      nuevoEstado: sugerido,
      observaciones: '',
      enviando: false,
    })
  }

  const ejecutarCambioEstado = async (e) => {
    e.preventDefault()
    const { lote, nuevoEstado, observaciones } = modalEstado
    if (!lote || !nuevoEstado) return

    setModalEstado(prev => ({ ...prev, enviando: true }))
    try {
      await cambiarEstadoLote(lote.idLote, nuevoEstado, observaciones)
      setModalEstado({ abierto: false, lote: null, nuevoEstado: '', observaciones: '', enviando: false })
      await cargarLotes()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al actualizar el estado del lote')
      setModalEstado(prev => ({ ...prev, enviando: false }))
    }
  }

  // Abrir Historial
  const abrirHistorial = async (lote) => {
    setModalHistorial({ abierto: true, lote, historial: [], cargando: true })
    try {
      const res = await getHistorialLote(lote.idLote)
      setModalHistorial({ abierto: true, lote, historial: res.data, cargando: false })
    } catch (err) {
      console.error(err)
      setModalHistorial(prev => ({ ...prev, cargando: false }))
    }
  }

  // Abrir Merma directa
  const abrirModalMerma = async (lote) => {
    setModalMerma({
      abierto: true,
      lote,
      causas: [],
      idCausa: '',
      cantidadPerdida: 1,
      fechaMerma: new Date().toISOString().split('T')[0],
      observaciones: '',
      enviando: false,
    })
    try {
      const res = await getCausasMerma()
      setModalMerma(prev => ({
        ...prev,
        causas: res.data,
        idCausa: res.data[0]?.idCausa || '',
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const ejecutarRegistroMerma = async (e) => {
    e.preventDefault()
    const { lote, idCausa, cantidadPerdida, fechaMerma, observaciones } = modalMerma
    if (!lote || !idCausa) return

    setModalMerma(prev => ({ ...prev, enviando: true }))
    try {
      await registrarMerma({
        idLote: lote.idLote,
        idCausa: Number(idCausa),
        cantidadPerdida: Number(cantidadPerdida),
        fechaMerma,
        observaciones,
      })
      setModalMerma({ abierto: false, lote: null, causas: [], idCausa: '', cantidadPerdida: 1, fechaMerma: '', observaciones: '', enviando: false })
      await cargarLotes()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al registrar la merma')
      setModalMerma(prev => ({ ...prev, enviando: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            🌱 Control de Lotes de Producción
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Supervisa el crecimiento, trazabilidad y estado de los lotes de cultivo
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro Zona */}
          <select
            value={filtroZona}
            onChange={(e) => { setFiltroZona(e.target.value); setPagina(0) }}
            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las zonas</option>
            {zonas.map(z => (
              <option key={z.idZona} value={z.idZona}>
                📍 {z.nombre}
              </option>
            ))}
          </select>

          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0) }}
            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {ESTADOS_LOTE.map(e => (
              <option key={e.id} value={e.id}>{e.label}</option>
            ))}
          </select>

          <button
            onClick={cargarLotes}
            title="Refrescar lotes"
            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm"
          >
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tabla de Lotes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-3xl mb-2 animate-bounce">🌿</p>
            <p>Cargando lotes de producción...</p>
          </div>
        ) : lotes.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm">No se encontraron lotes con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-3.5 px-4">Código / Especie</th>
                  <th className="py-3.5 px-4">Zona / Ubicación</th>
                  <th className="py-3.5 px-4">Stock (Actual / Ini)</th>
                  <th className="py-3.5 px-4">Fecha Siembra</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones Operativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {lotes.map(lote => (
                  <tr key={lote.idLote} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-800 text-sm">{lote.codigoLote}</div>
                      <div className="text-emerald-700 font-medium">{lote.especie}</div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      📍 {lote.nombreZona || 'Sin asignar'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-sm ${lote.cantidadActual === 0 ? 'text-red-600' : 'text-gray-800'}`}>
                          {lote.cantidadActual}
                        </span>
                        <span className="text-gray-400">/ {lote.cantidadInicial} u.</span>
                      </div>
                      {lote.cantidadActual < lote.cantidadInicial && (
                        <span className="text-[10px] text-amber-600 font-semibold">
                          ({lote.cantidadInicial - lote.cantidadActual} mermas)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 font-medium">
                      📅 {lote.fechaSiembra}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${ESTADO_BADGES[lote.estadoLote] || 'bg-gray-100'}`}>
                        {lote.estadoLote}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Botón Cambiar Estado (solo si no está descartado) */}
                      {lote.estadoLote !== 'DESCARTADO' && (
                        <button
                          onClick={() => abrirCambioEstado(lote)}
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition-colors"
                        >
                          Avanzar Estado →
                        </button>
                      )}

                      {/* Botón Reportar Merma */}
                      {lote.cantidadActual > 0 && lote.estadoLote !== 'DESCARTADO' && (
                        <button
                          onClick={() => abrirModalMerma(lote)}
                          title="Reportar pérdida en este lote"
                          className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold text-[11px] transition-colors"
                        >
                          ⚠️ Merma
                        </button>
                      )}

                      {/* Botón Historial */}
                      <button
                        onClick={() => abrirHistorial(lote)}
                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-[11px] transition-colors"
                      >
                        🕒 Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 text-xs text-gray-500">
            <span>Página {pagina + 1} de {totalPaginas}</span>
            <div className="flex gap-2">
              <button
                disabled={pagina === 0}
                onClick={() => setPagina(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                disabled={pagina >= totalPaginas - 1}
                onClick={() => setPagina(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL CAMBIAR ESTADO DE LOTE ─────────────────── */}
      {modalEstado.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Avanzar Estado del Lote
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Lote <strong className="text-gray-700">{modalEstado.lote?.codigoLote}</strong> ({modalEstado.lote?.especie}) •
              Estado actual: <strong className="text-emerald-700">{modalEstado.lote?.estadoLote}</strong>
            </p>

            <form onSubmit={ejecutarCambioEstado} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nuevo Estado de Cultivo
                </label>
                <select
                  value={modalEstado.nuevoEstado}
                  onChange={(e) => setModalEstado(prev => ({ ...prev, nuevoEstado: e.target.value }))}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">Selecciona un estado...</option>
                  {modalEstado.lote?.estadoLote === 'GERMINANDO' && (
                    <option value="CRECIENDO">🌿 CRECIENDO (Pasa a fase vegetativa)</option>
                  )}
                  {modalEstado.lote?.estadoLote === 'CRECIENDO' && (
                    <option value="LISTO_PARA_VENTA">🌸 LISTO PARA VENTA (Madurez alcanzada)</option>
                  )}
                  <option value="DESCARTADO">🍂 DESCARTADO (Pérdida total del lote)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Observaciones Técnicas (Opcional)
                </label>
                <textarea
                  rows="3"
                  value={modalEstado.observaciones}
                  onChange={(e) => setModalEstado(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Ej: Plantas alcanzaron 25cm de altura y follaje óptimo..."
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEstado(prev => ({ ...prev, abierto: false }))}
                  className="px-4 py-2 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalEstado.enviando || !modalEstado.nuevoEstado}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {modalEstado.enviando ? 'Guardando...' : 'Actualizar Estado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL HISTORIAL DEL LOTE ─────────────────────── */}
      {modalHistorial.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-800">
                  Trazabilidad del Lote: {modalHistorial.lote?.codigoLote}
                </h3>
                <p className="text-xs text-gray-500">{modalHistorial.lote?.especie}</p>
              </div>
              <button
                onClick={() => setModalHistorial(prev => ({ ...prev, abierto: false }))}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {modalHistorial.cargando ? (
              <div className="py-10 text-center text-xs text-gray-400">Cargando trazabilidad...</div>
            ) : modalHistorial.historial.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-6 text-center">Sin cambios registrados aún.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
                {modalHistorial.historial.map(h => (
                  <div key={h.idHistorialLote} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-700">
                        {h.estadoAnterior} → <strong className="text-emerald-700">{h.estadoNuevo}</strong>
                      </span>
                      <span className="text-[10px] text-gray-400">{h.fechaCambio}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Operador: {h.nombreUsuario || 'Usuario'}</p>
                    {h.observaciones && (
                      <p className="text-gray-600 mt-1 italic">"{h.observaciones}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalHistorial(prev => ({ ...prev, abierto: false }))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL REGISTRO DIRECTO DE MERMA ─────────────── */}
      {modalMerma.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              ⚠️ Reportar Merma en Lote
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Lote <strong className="text-gray-700">{modalMerma.lote?.codigoLote}</strong> ({modalMerma.lote?.especie}) •
              Stock disponible: <strong className="text-emerald-700">{modalMerma.lote?.cantidadActual} u.</strong>
            </p>

            <form onSubmit={ejecutarRegistroMerma} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Causa de la Pérdida
                </label>
                <select
                  value={modalMerma.idCausa}
                  onChange={(e) => setModalMerma(prev => ({ ...prev, idCausa: e.target.value }))}
                  className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {modalMerma.causas.map(c => (
                    <option key={c.idCausa} value={c.idCausa}>
                      {c.nombreCausa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cantidad Perdida
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={modalMerma.lote?.cantidadActual || 1}
                    value={modalMerma.cantidadPerdida}
                    onChange={(e) => setModalMerma(prev => ({ ...prev, cantidadPerdida: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Fecha de Pérdida
                  </label>
                  <input
                    type="date"
                    value={modalMerma.fechaMerma}
                    onChange={(e) => setModalMerma(prev => ({ ...prev, fechaMerma: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Observaciones Detalladas
                </label>
                <textarea
                  rows="2"
                  value={modalMerma.observaciones}
                  onChange={(e) => setModalMerma(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Ej: Infección detectada en hojas basales..."
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMerma(prev => ({ ...prev, abierto: false }))}
                  className="px-4 py-2 text-xs text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalMerma.enviando}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {modalMerma.enviando ? 'Registrando...' : 'Descontar y Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
