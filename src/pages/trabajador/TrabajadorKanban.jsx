import { useState, useEffect } from 'react'
import {
  getTareas,
  cambiarEstadoTarea,
  agregarComentarioTarea,
  getComentariosTarea,
  getHistorialTarea
} from '../../api/trabajadorApi'

const COLUMNAS = [
  { id: 'POR_HACER',   titulo: '📌 Por Hacer',    badgeBg: 'bg-gray-100 text-gray-700' },
  { id: 'EN_PROGRESO', titulo: '⏳ En Progreso',  badgeBg: 'bg-blue-100 text-blue-800' },
  { id: 'EN_REVISION', titulo: '🔍 En Revisión',  badgeBg: 'bg-purple-100 text-purple-800' },
  { id: 'COMPLETADA',  titulo: '✅ Completadas',  badgeBg: 'bg-emerald-100 text-emerald-800' },
]

const PRIORIDAD_COLORS = {
  ALTA: 'bg-red-100 text-red-700 border-red-200',
  MEDIA: 'bg-amber-100 text-amber-700 border-amber-200',
  BAJA: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

export default function TrabajadorKanban() {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [soloMias, setSoloMias] = useState(true)
  const [filtroPrioridad, setFiltroPrioridad] = useState('')

  // Modal para cambio de estado con comentario opcional
  const [modalTransicion, setModalTransicion] = useState({
    abierto: false,
    tarea: null,
    nuevoEstado: '',
    comentario: '',
    enviando: false,
  })

  // Modal de detalle y comentarios
  const [modalDetalle, setModalDetalle] = useState({
    abierto: false,
    tarea: null,
    comentarios: [],
    historial: [],
    nuevoComentario: '',
    cargandoInfo: false,
    enviandoComentario: false,
  })

  const cargarTareas = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await getTareas({
        soloMias,
        prioridad: filtroPrioridad || undefined,
      })
      setTareas(res.data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error cargando las tareas')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarTareas()
  }, [soloMias, filtroPrioridad])

  // Abrir modal de transición
  const solicitarCambioEstado = (tarea, nuevoEstado) => {
    setModalTransicion({
      abierto: true,
      tarea,
      nuevoEstado,
      comentario: '',
      enviando: false,
    })
  }

  // Confirmar cambio de estado
  const ejecutarCambioEstado = async (e) => {
    e.preventDefault()
    const { tarea, nuevoEstado, comentario } = modalTransicion
    if (!tarea) return

    setModalTransicion(prev => ({ ...prev, enviando: true }))
    try {
      await cambiarEstadoTarea(tarea.idTarea, nuevoEstado, comentario)
      setModalTransicion({ abierto: false, tarea: null, nuevoEstado: '', comentario: '', enviando: false })
      await cargarTareas()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al cambiar estado de la tarea')
      setModalTransicion(prev => ({ ...prev, enviando: false }))
    }
  }

  // Abrir modal de detalles, comentarios e historial
  const abrirDetalle = async (tarea) => {
    setModalDetalle({
      abierto: true,
      tarea,
      comentarios: [],
      historial: [],
      nuevoComentario: '',
      cargandoInfo: true,
      enviandoComentario: false,
    })

    try {
      const [resComentarios, resHistorial] = await Promise.all([
        getComentariosTarea(tarea.idTarea),
        getHistorialTarea(tarea.idTarea)
      ])
      setModalDetalle(prev => ({
        ...prev,
        comentarios: resComentarios.data,
        historial: resHistorial.data,
        cargandoInfo: false,
      }))
    } catch (err) {
      console.error(err)
      setModalDetalle(prev => ({ ...prev, cargandoInfo: false }))
    }
  }

  // Agregar comentario en modal de detalle
  const handleAgregarComentario = async (e) => {
    e.preventDefault()
    if (!modalDetalle.nuevoComentario.trim()) return

    setModalDetalle(prev => ({ ...prev, enviandoComentario: true }))
    try {
      const res = await agregarComentarioTarea(modalDetalle.tarea.idTarea, modalDetalle.nuevoComentario)
      setModalDetalle(prev => ({
        ...prev,
        comentarios: [...prev.comentarios, res.data],
        nuevoComentario: '',
        enviandoComentario: false,
      }))
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al enviar comentario')
      setModalDetalle(prev => ({ ...prev, enviandoComentario: false }))
    }
  }

  const tareasBloqueadas = tareas.filter(t => t.estadoTarea === 'BLOQUEADA')

  return (
    <div className="space-y-6">
      {/* Cabecera y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📋 Tablero de Tareas Operativas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona visualmente las labores de cultivo, riego, poda y fertilización
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Mis Tareas vs Todas */}
          <div className="inline-flex rounded-xl border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setSoloMias(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                soloMias ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mis Tareas
            </button>
            <button
              type="button"
              onClick={() => setSoloMias(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !soloMias ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Todas las Tareas
            </button>
          </div>

          {/* Filtro Prioridad */}
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="ALTA">Prioridad Alta</option>
            <option value="MEDIA">Prioridad Media</option>
            <option value="BAJA">Prioridad Baja</option>
          </select>

          <button
            onClick={cargarTareas}
            title="Refrescar tareas"
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

      {/* Sección Alerta de Tareas Bloqueadas si existen */}
      {tareasBloqueadas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              ⚠️ Tareas Bloqueadas ({tareasBloqueadas.length})
            </h3>
            <span className="text-xs text-amber-700">Requieren atención o desbloqueo operativo</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tareasBloqueadas.map(tarea => (
              <div key={tarea.idTarea} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-800">{tarea.tipoTarea}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORIDAD_COLORS[tarea.prioridad]}`}>
                      {tarea.prioridad}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {tarea.nombreZona ? `📍 Zona: ${tarea.nombreZona}` : `🌱 Lote: ${tarea.codigoLote} (${tarea.especieLote || ''})`}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <button
                    onClick={() => abrirDetalle(tarea)}
                    className="text-gray-500 hover:text-gray-800 underline"
                  >
                    Ver detalle
                  </button>
                  <button
                    onClick={() => solicitarCambioEstado(tarea, 'EN_PROGRESO')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-[11px] transition-colors"
                  >
                    Desbloquear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Columnas Kanban */}
      {cargando ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-3xl mb-2 animate-bounce">🌱</p>
          <p>Cargando tablero operativo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {COLUMNAS.map(col => {
            const tareasColumna = tareas.filter(t => t.estadoTarea === col.id)
            return (
              <div key={col.id} className="bg-gray-100/80 rounded-2xl p-4 flex flex-col min-h-[500px] border border-gray-200/70">
                {/* Cabecera Columna */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="font-bold text-gray-700 text-sm">{col.titulo}</h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badgeBg}`}>
                    {tareasColumna.length}
                  </span>
                </div>

                {/* Lista de Tarjetas */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {tareasColumna.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400">
                      Sin tareas
                    </div>
                  ) : (
                    tareasColumna.map(tarea => (
                      <div
                        key={tarea.idTarea}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/80 hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                      >
                        {/* Cabecera Tarjeta */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-bold text-gray-800 text-sm">
                              {tarea.tipoTarea}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORIDAD_COLORS[tarea.prioridad]}`}>
                              {tarea.prioridad}
                            </span>
                          </div>

                          {/* Objetivo: Zona o Lote */}
                          <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                            {tarea.nombreZona && (
                              <span>📍 Zona: <strong className="text-gray-800">{tarea.nombreZona}</strong></span>
                            )}
                            {tarea.codigoLote && (
                              <span>🌱 Lote: <strong className="text-gray-800">{tarea.codigoLote}</strong> ({tarea.especieLote})</span>
                            )}
                          </p>

                          {/* Asignación */}
                          {tarea.nombreTrabajador && (
                            <p className="text-[11px] text-gray-500 mt-1">
                              👤 Asignado a: <span className="font-medium text-gray-700">{tarea.nombreTrabajador}</span>
                            </p>
                          )}
                        </div>

                        {/* Fecha Límite */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                          <span>📅 Límite: <strong className="text-gray-700">{tarea.fechaLimite || 'Sin fecha'}</strong></span>
                          <button
                            onClick={() => abrirDetalle(tarea)}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold"
                          >
                            Detalles →
                          </button>
                        </div>

                        {/* Acciones Rápidas de Transición */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                          {col.id === 'POR_HACER' && (
                            <>
                              <button
                                onClick={() => solicitarCambioEstado(tarea, 'BLOQUEADA')}
                                className="text-[11px] px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                Bloquear
                              </button>
                              <button
                                onClick={() => solicitarCambioEstado(tarea, 'EN_PROGRESO')}
                                className="text-[11px] px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ml-auto"
                              >
                                Iniciar →
                              </button>
                            </>
                          )}

                          {col.id === 'EN_PROGRESO' && (
                            <>
                              <button
                                onClick={() => solicitarCambioEstado(tarea, 'BLOQUEADA')}
                                className="text-[11px] px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                Bloquear
                              </button>
                              <button
                                onClick={() => solicitarCambioEstado(tarea, 'EN_REVISION')}
                                className="text-[11px] px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors ml-auto"
                              >
                                A Revisión →
                              </button>
                            </>
                          )}

                          {col.id === 'EN_REVISION' && (
                            <>
                              <button
                                onClick={() => solicitarCambioEstado(tarea, 'EN_PROGRESO')}
                                className="text-[11px] px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
                              >
                                ← Regresar
                              </button>
                              <button
                                onClick={() => solicitarCambioEstado(tarea, 'COMPLETADA')}
                                className="text-[11px] px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg transition-colors ml-auto"
                              >
                                Completar ✓
                              </button>
                            </>
                          )}

                          {col.id === 'COMPLETADA' && (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mx-auto">
                              ✓ Finalizada exitosamente
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL CAMBIO DE ESTADO ────────────────────────── */}
      {modalTransicion.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Confirmar Cambio de Estado
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Moviendo tarea <strong className="text-gray-700">{modalTransicion.tarea?.tipoTarea}</strong> al estado:{' '}
              <span className="font-bold text-emerald-700">{modalTransicion.nuevoEstado}</span>
            </p>

            <form onSubmit={ejecutarCambioEstado} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Comentario u Observación (Opcional)
                </label>
                <textarea
                  rows="3"
                  value={modalTransicion.comentario}
                  onChange={(e) => setModalTransicion(prev => ({ ...prev, comentario: e.target.value }))}
                  placeholder="Ej: Se aplicaron 5L de fertilizante orgánico según protocolo..."
                  className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTransicion(prev => ({ ...prev, abierto: false }))}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={modalTransicion.enviando}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {modalTransicion.enviando ? 'Guardando...' : 'Confirmar Avance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DETALLE, COMENTARIOS E HISTORIAL ───────── */}
      {modalDetalle.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            {/* Cabecera Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-800">
                    {modalDetalle.tarea?.tipoTarea}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${PRIORIDAD_COLORS[modalDetalle.tarea?.prioridad]}`}>
                    {modalDetalle.tarea?.prioridad}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    {modalDetalle.tarea?.estadoTarea}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ID Tarea: #{modalDetalle.tarea?.idTarea} • Fecha límite: {modalDetalle.tarea?.fechaLimite || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setModalDetalle(prev => ({ ...prev, abierto: false }))}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-gray-500 block">Objetivo / Ubicación:</span>
                  <strong className="text-gray-800 text-sm">
                    {modalDetalle.tarea?.nombreZona ? `Zona: ${modalDetalle.tarea.nombreZona}` : `Lote: ${modalDetalle.tarea?.codigoLote} (${modalDetalle.tarea?.especieLote || ''})`}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Trabajador Asignado:</span>
                  <strong className="text-gray-800 text-sm">
                    {modalDetalle.tarea?.nombreTrabajador || 'Sin asignar (Backlog)'}
                  </strong>
                </div>
              </div>

              {/* Comentarios del equipo */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  💬 Comentarios y Notas Operativas ({modalDetalle.comentarios.length})
                </h4>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                  {modalDetalle.comentarios.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No hay comentarios en esta tarea aún.</p>
                  ) : (
                    modalDetalle.comentarios.map(c => (
                      <div key={c.idComentario} className="p-3 bg-gray-50 rounded-xl text-xs border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-gray-700">{c.nombreUsuario || 'Usuario'}</span>
                          <span className="text-[10px] text-gray-400">{c.fechaCreacion}</span>
                        </div>
                        <p className="text-gray-600">{c.comentario}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulario nuevo comentario */}
                <form onSubmit={handleAgregarComentario} className="flex gap-2">
                  <input
                    type="text"
                    value={modalDetalle.nuevoComentario}
                    onChange={(e) => setModalDetalle(prev => ({ ...prev, nuevoComentario: e.target.value }))}
                    placeholder="Escribe una observación operativa..."
                    className="flex-1 text-xs border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={modalDetalle.enviandoComentario || !modalDetalle.nuevoComentario.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Comentar
                  </button>
                </form>
              </div>

              {/* Historial de Auditoría */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  🕒 Historial de Transiciones
                </h4>
                <div className="space-y-2 text-xs">
                  {modalDetalle.historial.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Sin transiciones registradas.</p>
                  ) : (
                    modalDetalle.historial.map(h => (
                      <div key={h.idHistorialTarea} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div>
                          <span className="font-semibold text-gray-700">{h.nombreUsuario || 'Operador'}: </span>
                          <span className="text-gray-500">{h.estadoAnterior || 'Inicio'} → </span>
                          <span className="font-bold text-emerald-700">{h.estadoNuevo}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{h.fechaCambio}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalDetalle(prev => ({ ...prev, abierto: false }))}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
