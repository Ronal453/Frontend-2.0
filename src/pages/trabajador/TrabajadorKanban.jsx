import React, { useState, useEffect, useRef } from 'react'
import {
  Kanban,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  Lock,
  CheckCircle2,
  Filter
} from 'lucide-react'
import {
  getTareas,
  cambiarEstadoTarea
} from '../../api/trabajadorApi'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../context/LanguageContext'
import KanbanBoard from '../../components/tareas/KanbanBoard'
import ModalCambioEstado from '../../components/tareas/ModalCambioEstado'
import ModalDetalleTarea from '../../components/tareas/ModalDetalleTarea'

/**
 * Tablero Kanban operativo para operarios de vivero (Rol TRABAJADOR).
 * Permite gestionar actividades botánicas diarias, arrastrar tareas con HTML5 Drag and Drop,
 * auto-refresco periódico cada 60 segundos y estricto control de asignación (solo puede
 * mover tareas asignadas a su propia cuenta).
 *
 * @component
 * @returns {JSX.Element}
 */
export default function TrabajadorKanban() {
  const { user } = useAuth()
  const { t } = useLanguage()

  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [soloMias, setSoloMias] = useState(true)
  const [filtroPrioridad, setFiltroPrioridad] = useState('')

  // Control de refresco automático cada 60s
  const [segundosParaRefresco, setSegundosParaRefresco] = useState(60)

  // Modales
  const [modalTransicion, setModalTransicion] = useState({
    abierto: false,
    tarea: null,
    nuevoEstado: ''
  })
  const [modalDetalle, setModalDetalle] = useState({
    abierto: false,
    tarea: null
  })

  // Mensaje flotante de éxito
  const [mensajeExito, setMensajeExito] = useState('')

  const mostrarExito = (msg) => {
    setMensajeExito(msg)
    setTimeout(() => setMensajeExito(''), 4000)
  }

  const cargarTareas = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await getTareas({
        soloMias,
        prioridad: filtroPrioridad || undefined,
      })
      setTareas(res.data || [])
      setSegundosParaRefresco(60)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar las tareas')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarTareas()
  }, [soloMias, filtroPrioridad])

  // Timer de auto-refresco cada 60s
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundosParaRefresco(prev => {
        if (prev <= 1) {
          cargarTareas()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalo)
  }, [soloMias, filtroPrioridad])

  const handleSolicitarCambioEstado = (tarea, nuevoEstado) => {
    setModalTransicion({ abierto: true, tarea, nuevoEstado })
  }

  const handleConfirmarCambioEstado = async (tarea, nuevoEstado, comentario) => {
    try {
      await cambiarEstadoTarea(tarea.idTarea, nuevoEstado, comentario)
      const estadoTraducido = t('taskStatus.' + nuevoEstado, nuevoEstado.replace('_', ' '))
      mostrarExito(t('worker.taskMovedSuccess', { id: tarea.idTarea, status: estadoTraducido }))
      await cargarTareas()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al mover la tarea')
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
      
      {/* Cabecera & Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl text-white shadow-lg shadow-emerald-700/20">
            <Kanban size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t('worker.kanban')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('worker.kanbanSubtitle')}
            </p>
          </div>
        </div>

        {/* Controles de Filtro y Refresco */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Mis Tareas vs Todas */}
          <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSoloMias(true)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                soloMias ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('worker.myTasksOnly')}
            </button>
            <button
              onClick={() => setSoloMias(false)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                !soloMias ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('worker.allTasks')}
            </button>
          </div>

          {/* Filtro Prioridad */}
          <select
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold"
          >
            <option value="">{t('common.all')} ({t('worker.priority')})</option>
            <option value="ALTA">{t('worker.high')}</option>
            <option value="MEDIA">{t('worker.medium')}</option>
            <option value="BAJA">{t('worker.low')}</option>
          </select>

          {/* Botón Refresco con indicador de tiempo */}
          <button
            onClick={cargarTareas}
            title={t('worker.refreshTooltip', { seconds: segundosParaRefresco })}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} className={cargando ? 'animate-spin' : ''} />
            <span className="text-[11px] font-mono text-slate-400">{segundosParaRefresco}s</span>
          </button>
        </div>
      </div>

      {/* Banner de Éxito Flotante */}
      {mensajeExito && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tablero Kanban */}
      {cargando && tareas.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
          {t('worker.loadingTasks')}
        </div>
      ) : (
        <KanbanBoard
          tareas={tareas}
          esAdmin={false}
          usuarioActual={user}
          onCambiarEstado={handleSolicitarCambioEstado}
          onVerDetalle={(t) => setModalDetalle({ abierto: true, tarea: t })}
        />
      )}

      {/* Modales */}
      <ModalCambioEstado
        abierto={modalTransicion.abierto}
        tarea={modalTransicion.tarea}
        nuevoEstado={modalTransicion.nuevoEstado}
        onCerrar={() => setModalTransicion({ abierto: false, tarea: null, nuevoEstado: '' })}
        onConfirmar={handleConfirmarCambioEstado}
      />

      <ModalDetalleTarea
        abierto={modalDetalle.abierto}
        tarea={modalDetalle.tarea}
        esAdmin={false}
        onCerrar={() => setModalDetalle({ abierto: false, tarea: null })}
      />

    </div>
  )
}
