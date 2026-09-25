import { useState, useEffect } from 'react'
import {
  getTareas,
  cambiarEstadoTarea,
  agregarComentarioTarea,
  getComentariosTarea,
  getHistorialTarea
} from '../../api/trabajadorApi'
import ModalCambioEstado from './components/ModalCambioEstado'
import ModalDetalleTarea from './components/ModalDetalleTarea'

const COLUMNAS = [
  { id: 'POR_HACER',   titulo: '📌 Por Hacer',    badgeBg: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' },
  { id: 'EN_PROGRESO', titulo: '⏳ En Progreso',  badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50' },
  { id: 'EN_REVISION', titulo: '🔍 En Revisión',  badgeBg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50' },
  { id: 'COMPLETADA',  titulo: '✅ Completadas',  badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' },
]

const PRIORIDAD_COLORS = {
  ALTA: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50',
  MEDIA: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  BAJA: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            📋 Tablero de Tareas Operativas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Gestiona visualmente las labores de cultivo, riego, poda y fertilización
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Mis Tareas vs Todas */}
          <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-1 bg-gray-50 dark:bg-gray-900/60">
            <button
              type="button"
              onClick={() => setSoloMias(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                soloMias ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mis Tareas
            </button>
            <button
              type="button"
              onClick={() => setSoloMias(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !soloMias ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Todas las Tareas
            </button>
          </div>

          {/* Filtro Prioridad */}
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="ALTA">Prioridad Alta</option>
            <option value="MEDIA">Prioridad Media</option>
            <option value="BAJA">Prioridad Baja</option>
          </select>

          <button
            onClick={cargarTareas}
            title="Refrescar tareas"
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            🔄
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Sección Alerta de Tareas Bloqueadas si existen */}
      {tareasBloqueadas.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              ⚠️ Tareas Bloqueadas ({tareasBloqueadas.length})
            </h3>
            <span className="text-xs text-amber-700 dark:text-amber-400">Requieren atención o desbloqueo operativo</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tareasBloqueadas.map(tarea => (
              <div key={tarea.idTarea} className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{tarea.tipoTarea}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORIDAD_COLORS[tarea.prioridad]}`}>
                      {tarea.prioridad}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                    {tarea.nombreZona ? `📍 Zona: ${tarea.nombreZona}` : `🌱 Lote: ${tarea.codigoLote} (${tarea.especieLote || ''})`}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                  <button
                    onClick={() => abrirDetalle(tarea)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
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
              <div key={col.id} className="bg-gray-100/80 dark:bg-gray-900/50 rounded-2xl p-4 flex flex-col min-h-[500px] border border-gray-200/70 dark:border-gray-800">
                {/* Cabecera Columna */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="font-bold text-gray-700 dark:text-gray-200 text-sm">{col.titulo}</h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badgeBg}`}>
                    {tareasColumna.length}
                  </span>
                </div>

                {/* Lista de Tarjetas */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {tareasColumna.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">
                      Sin tareas
                    </div>
                  ) : (
                    tareasColumna.map(tarea => (
                      <div
                        key={tarea.idTarea}
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col justify-between gap-3"
                      >
                        {/* Cabecera Tarjeta */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                              {tarea.tipoTarea}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORIDAD_COLORS[tarea.prioridad]}`}>
                              {tarea.prioridad}
                            </span>
                          </div>

                          {/* Objetivo: Zona o Lote */}
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                            {tarea.nombreZona && (
                              <span>📍 Zona: <strong className="text-gray-800 dark:text-gray-100">{tarea.nombreZona}</strong></span>
                            )}
                            {tarea.codigoLote && (
                              <span>🌱 Lote: <strong className="text-gray-800 dark:text-gray-100">{tarea.codigoLote}</strong> ({tarea.especieLote})</span>
                            )}
                          </p>

                          {/* Asignación */}
                          {tarea.nombreTrabajador && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                              👤 Asignado a: <span className="font-medium text-gray-700 dark:text-gray-200">{tarea.nombreTrabajador}</span>
                            </p>
                          )}
                        </div>

                        {/* Fecha Límite */}
                        <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <span>📅 Límite: <strong className="text-gray-700 dark:text-gray-200">{tarea.fechaLimite || 'Sin fecha'}</strong></span>
                          <button
                            onClick={() => abrirDetalle(tarea)}
                            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-semibold"
                          >
                            Detalles →
                          </button>
                        </div>

                        {/* Acciones Rápidas de Transición */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2">
                          {col.id === 'POR_HACER' && (
                            <>
                              <button
                                onClick={() => solicitarCambioEstado(tarea, 'BLOQUEADA')}
                                className="text-[11px] px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
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
                                className="text-[11px] px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
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
                                className="text-[11px] px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
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
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mx-auto">
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
      <ModalCambioEstado
        abierto={modalTransicion.abierto}
        tarea={modalTransicion.tarea}
        nuevoEstado={modalTransicion.nuevoEstado}
        comentario={modalTransicion.comentario}
        enviando={modalTransicion.enviando}
        onClose={() => setModalTransicion(prev => ({ ...prev, abierto: false }))}
        onChangeComentario={(val) => setModalTransicion(prev => ({ ...prev, comentario: val }))}
        onSubmit={ejecutarCambioEstado}
      />

      {/* ── MODAL DETALLE, COMENTARIOS E HISTORIAL ───────── */}
      <ModalDetalleTarea
        abierto={modalDetalle.abierto}
        tarea={modalDetalle.tarea}
        comentarios={modalDetalle.comentarios}
        historial={modalDetalle.historial}
        nuevoComentario={modalDetalle.nuevoComentario}
        enviandoComentario={modalDetalle.enviandoComentario}
        onClose={() => setModalDetalle(prev => ({ ...prev, abierto: false }))}
        onChangeComentario={(val) => setModalDetalle(prev => ({ ...prev, nuevoComentario: val }))}
        onSubmitComentario={handleAgregarComentario}
      />
    </div>
  )
}
