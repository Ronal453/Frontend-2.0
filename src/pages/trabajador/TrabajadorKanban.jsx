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
import { 
  Kanban, AlertTriangle, RefreshCw, ClipboardList, Hourglass, 
  Search, CheckCircle2, Lock, Unlock, Play, ArrowRight, CornerUpLeft, 
  MapPin, Sprout, User, Calendar, ExternalLink, Loader2
} from 'lucide-react'

const COLUMNAS = [
  { id: 'POR_HACER',   titulo: 'Por Hacer',    icono: ClipboardList, badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', headerBg: 'bg-slate-100/50 dark:bg-slate-800/30' },
  { id: 'EN_PROGRESO', titulo: 'En Progreso',  icono: Hourglass, badgeBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50', headerBg: 'bg-blue-50/50 dark:bg-blue-900/10' },
  { id: 'EN_REVISION', titulo: 'En Revisión',  icono: Search, badgeBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50', headerBg: 'bg-purple-50/50 dark:bg-purple-900/10' },
  { id: 'COMPLETADA',  titulo: 'Completadas',  icono: CheckCircle2, badgeBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50', headerBg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
]

const PRIORIDAD_COLORS = {
  ALTA: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',
  MEDIA: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  BAJA: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
}

export default function TrabajadorKanban() {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [soloMias, setSoloMias] = useState(true)
  const [filtroPrioridad, setFiltroPrioridad] = useState('')

  const [modalTransicion, setModalTransicion] = useState({
    abierto: false,
    tarea: null,
    nuevoEstado: '',
    comentario: '',
    enviando: false,
  })

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

  const solicitarCambioEstado = (tarea, nuevoEstado) => {
    setModalTransicion({ abierto: true, tarea, nuevoEstado, comentario: '', enviando: false })
  }

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
    <div className="flex flex-col h-full animate-fade-in">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Kanban size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Tablero de Tareas Operativas
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
              Gestiona visualmente las labores de cultivo, riego, poda y fertilización
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setSoloMias(true)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                soloMias ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Mis Tareas
            </button>
            <button
              onClick={() => setSoloMias(false)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                !soloMias ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Todas las Tareas
            </button>
          </div>

          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Todas las prioridades</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>

          <button
            onClick={cargarTareas}
            title="Refrescar tareas"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* TAREAS BLOQUEADAS */}
      {tareasBloqueadas.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Lock size={18} className="text-amber-600 dark:text-amber-400" />
              Tareas Bloqueadas ({tareasBloqueadas.length})
            </h3>
            <span className="text-xs font-bold text-amber-700/80 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/40 px-3 py-1 rounded-full">Requieren atención</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tareasBloqueadas.map(tarea => (
              <div key={tarea.idTarea} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{tarea.tipoTarea}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${PRIORIDAD_COLORS[tarea.prioridad]}`}>
                      {tarea.prioridad}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 space-y-1">
                    {tarea.nombreZona && <p className="flex items-center gap-1.5"><MapPin size={12} /> {tarea.nombreZona}</p>}
                    {tarea.codigoLote && <p className="flex items-center gap-1.5"><Sprout size={12} /> {tarea.codigoLote}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-amber-100 dark:border-amber-800/30">
                  <button onClick={() => abrirDetalle(tarea)} className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 flex items-center gap-1">
                    <ExternalLink size={12} /> Ver detalle
                  </button>
                  <button onClick={() => solicitarCambioEstado(tarea, 'EN_PROGRESO')} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-600/20">
                    <Unlock size={12} /> Desbloquear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KANBAN BOARD */}
      {cargando ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <p className="font-medium">Cargando tablero operativo...</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 pb-6 min-h-[500px]">
          {COLUMNAS.map(col => {
            const tareasColumna = tareas.filter(t => t.estadoTarea === col.id)
            const ColIcon = col.icono
            return (
              <div key={col.id} className="bg-slate-100/50 dark:bg-slate-800/20 rounded-3xl flex flex-col border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
                
                {/* Cabecera Columna */}
                <div className={`flex items-center justify-between px-5 py-4 ${col.headerBg} border-b border-slate-200/50 dark:border-slate-700/50`}>
                  <h2 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
                    <ColIcon size={16} /> {col.titulo}
                  </h2>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${col.badgeBg}`}>
                    {tareasColumna.length}
                  </span>
                </div>

                {/* Lista de Tarjetas */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                  {tareasColumna.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500 m-2">
                      Sin tareas
                    </div>
                  ) : (
                    tareasColumna.map(tarea => (
                      <div key={tarea.idTarea} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col justify-between group">
                        
                        <div className="mb-3">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                              {tarea.tipoTarea}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${PRIORIDAD_COLORS[tarea.prioridad]}`}>
                              {tarea.prioridad}
                            </span>
                          </div>

                          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 space-y-1">
                            {tarea.nombreZona && (
                              <p className="flex items-center gap-1.5"><MapPin size={12} /> Zona: <strong className="text-slate-700 dark:text-slate-200">{tarea.nombreZona}</strong></p>
                            )}
                            {tarea.codigoLote && (
                              <p className="flex items-center gap-1.5"><Sprout size={12} /> Lote: <strong className="text-slate-700 dark:text-slate-200">{tarea.codigoLote}</strong></p>
                            )}
                            {tarea.nombreTrabajador && (
                              <p className="flex items-center gap-1.5 pt-1"><User size={12} /> <span className="truncate">{tarea.nombreTrabajador}</span></p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-700/50 mb-3">
                          <span className="flex items-center gap-1.5"><Calendar size={12} /> Límite: {tarea.fechaLimite ? new Date(tarea.fechaLimite).toLocaleDateString() : 'N/A'}</span>
                          <button onClick={() => abrirDetalle(tarea)} className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-lg transition-colors">
                            <ExternalLink size={12} /> Detalles
                          </button>
                        </div>

                        {/* Acciones Transición */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          {col.id === 'POR_HACER' && (
                            <>
                              <button onClick={() => solicitarCambioEstado(tarea, 'BLOQUEADA')} className="text-[10px] font-bold px-2 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1">
                                <Lock size={12} /> Bloquear
                              </button>
                              <button onClick={() => solicitarCambioEstado(tarea, 'EN_PROGRESO')} className="text-[10px] font-bold px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                                <Play size={12} /> Iniciar
                              </button>
                            </>
                          )}
                          {col.id === 'EN_PROGRESO' && (
                            <>
                              <button onClick={() => solicitarCambioEstado(tarea, 'BLOQUEADA')} className="text-[10px] font-bold px-2 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1">
                                <Lock size={12} /> Bloquear
                              </button>
                              <button onClick={() => solicitarCambioEstado(tarea, 'EN_REVISION')} className="text-[10px] font-bold px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50 dark:hover:bg-purple-900/50 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                                A Revisión <ArrowRight size={12} />
                              </button>
                            </>
                          )}
                          {col.id === 'EN_REVISION' && (
                            <>
                              <button onClick={() => solicitarCambioEstado(tarea, 'EN_PROGRESO')} className="text-[10px] font-bold px-2 py-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1">
                                <CornerUpLeft size={12} /> Regresar
                              </button>
                              <button onClick={() => solicitarCambioEstado(tarea, 'COMPLETADA')} className="text-[10px] font-bold px-3 py-1.5 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                                <CheckCircle2 size={12} /> Completar
                              </button>
                            </>
                          )}
                          {col.id === 'COMPLETADA' && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1.5 w-full justify-center">
                              <CheckCircle2 size={12} /> Finalizada
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
