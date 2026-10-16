import React, { useState, useEffect } from 'react'
import {
  Kanban,
  Repeat,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  Play,
  Pause,
  Mail,
  Filter,
  CheckCircle2,
  Clock,
  Lock,
  Layers,
  Sparkles,
  Pencil
} from 'lucide-react'
import {
  getTareasAdmin,
  getTareasRecurrentes,
  activarTareaRecurrente,
  pausarTareaRecurrente,
  generarInstanciasRecurrentes,
  procesarAlertasVencidas,
  reasignarTareaAdmin,
  getTrabajadoresActivos
} from '../api/adminApi'
import { cambiarEstadoTarea } from '../api/trabajadorApi'
import { useAuth } from '../hooks/useAuth'
import KanbanBoard from '../components/tareas/KanbanBoard'
import ModalCrearTarea from '../components/tareas/ModalCrearTarea'
import ModalEditarTareaRecurrente from '../components/tareas/ModalEditarTareaRecurrente'
import ModalCambioEstado from '../components/tareas/ModalCambioEstado'
import ModalDetalleTarea from '../components/tareas/ModalDetalleTarea'
import ModalReasignarTarea from '../components/tareas/ModalReasignarTarea'
import { TIPOS_TAREA, formatFecha, extraerTituloYDescripcion } from '../components/tareas/tareasConstantes'
import { useLanguage } from '../context/LanguageContext'

/**
 * Página principal de Gestión Operativa de Tareas y Tablero Kanban para Administradores.
 * Integra la creación de tareas puntuales (HU22), programación de recurrencias (HU23),
 * reasignación de operarios (HU30) y procesamiento manual de alertas (HU28).
 * Soporta cambio de idioma dinámico (i18n).
 *
 * @component
 * @returns {JSX.Element}
 */
export default function AdminTareas() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [tabActiva, setTabActiva] = useState('KANBAN') // 'KANBAN' | 'RECURRENTES'

  // Estado de tareas Kanban
  const [tareas, setTareas] = useState([])
  const [cargandoTareas, setCargandoTareas] = useState(true)
  const [errorTareas, setErrorTareas] = useState('')

  // Estado de tareas recurrentes
  const [recurrentes, setRecurrentes] = useState([])
  const [cargandoRecurrentes, setCargandoRecurrentes] = useState(false)

  // Filtros de búsqueda para el Kanban
  const [filtroPrioridad, setFiltroPrioridad] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroTrabajador, setFiltroTrabajador] = useState('')
  const [soloVencidas, setSoloVencidas] = useState(false)

  // Lista de trabajadores activos
  const [trabajadores, setTrabajadores] = useState([])

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [modalEditarRecurrente, setModalEditarRecurrente] = useState({ abierto: false, regla: null })
  const [modalTransicion, setModalTransicion] = useState({ abierto: false, tarea: null, nuevoEstado: '' })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, tarea: null })
  const [modalReasignar, setModalReasignar] = useState({ abierto: false, tarea: null })

  // Notificaciones temporales de acción
  const [mensajeExito, setMensajeExito] = useState('')

  useEffect(() => {
    cargarTrabajadores()
    cargarTareas()
  }, [filtroPrioridad, filtroTipo, filtroTrabajador, soloVencidas])

  useEffect(() => {
    if (tabActiva === 'RECURRENTES') {
      cargarRecurrentes()
    }
  }, [tabActiva])

  const mostrarExito = (msg) => {
    setMensajeExito(msg)
    setTimeout(() => setMensajeExito(''), 4000)
  }

  const cargarTrabajadores = async () => {
    try {
      const res = await getTrabajadoresActivos()
      setTrabajadores(res.data || [])
    } catch (err) {
      console.error('Error cargando trabajadores', err)
    }
  }

  const cargarTareas = async () => {
    setCargandoTareas(true)
    setErrorTareas('')
    try {
      const filtros = {
        prioridad: filtroPrioridad || undefined,
        tipo: filtroTipo || undefined,
        idAsignadoA: filtroTrabajador || undefined,
        soloVencidas: soloVencidas ? true : undefined,
      }
      const res = await getTareasAdmin(filtros)
      setTareas(res.data || [])
    } catch (err) {
      setErrorTareas(err.response?.data?.mensaje || t('admin.errorLoad', 'Error al obtener las tareas'))
    } finally {
      setCargandoTareas(false)
    }
  }

  const cargarRecurrentes = async () => {
    setCargandoRecurrentes(true)
    try {
      const res = await getTareasRecurrentes(false)
      setRecurrentes(res.data || [])
    } catch (err) {
      console.error('Error cargando tareas recurrentes', err)
    } finally {
      setCargandoRecurrentes(false)
    }
  }

  // Manejo de cambio de estado
  const handleSolicitarCambioEstado = (tarea, nuevoEstado) => {
    setModalTransicion({ abierto: true, tarea, nuevoEstado })
  }

  const handleConfirmarCambioEstado = async (tarea, nuevoEstado, comentario) => {
    try {
      await cambiarEstadoTarea(tarea.idTarea, nuevoEstado, comentario)
      mostrarExito(t('adminTasks.taskMovedTo', { id: tarea.idTarea, status: t('taskStatus.' + nuevoEstado, nuevoEstado.replace('_', ' ')) }))
      await cargarTareas()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al mover la tarea')
    }
  }

  // Manejo de reasignación
  const handleConfirmarReasignacion = async (idTarea, nuevoIdAsignadoA, motivo) => {
    await reasignarTareaAdmin(idTarea, { nuevoIdAsignadoA, motivo })
    mostrarExito(t('adminTasks.taskReassignedSuccess', { id: idTarea }))
    await cargarTareas()
  }

  // Disparar generación manual de instancias recurrentes
  const handleGenerarRecurrentes = async () => {
    try {
      const res = await generarInstanciasRecurrentes()
      mostrarExito(res.data?.mensaje || t('adminTasks.recurringProcessExecuted'))
      await cargarTareas()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al generar tareas recurrentes')
    }
  }

  // Disparar procesamiento de alertas vencidas (HU28)
  const handleProcesarAlertas = async () => {
    try {
      const res = await procesarAlertasVencidas()
      mostrarExito(res.data?.mensaje || t('adminTasks.notificationsSent'))
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al notificar tareas vencidas')
    }
  }

  // Pausar / Reactivar tarea recurrente
  const handleToggleRecurrente = async (rec) => {
    try {
      const estaActiva = rec.activo ?? rec.activa
      const nombreRegla = rec.tipoTarea || rec.descripcion || rec.titulo || 'Tarea Recurrente'
      if (estaActiva) {
        await pausarTareaRecurrente(rec.idTareaRecurrente)
        mostrarExito(t('adminTasks.rulePaused', { name: nombreRegla }))
      } else {
        await activarTareaRecurrente(rec.idTareaRecurrente)
        mostrarExito(t('adminTasks.ruleResumed', { name: nombreRegla }))
      }
      await cargarRecurrentes()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al actualizar regla recurrente')
    }
  }

  // Métricas rápidas del tablero
  const totalTareas = tareas.length
  const enProgreso = tareas.filter(t => t.estadoTarea === 'EN_PROGRESO').length
  const vencidas = tareas.filter(t => t.vencida).length
  const bloqueadas = tareas.filter(t => t.estadoTarea === 'BLOQUEADA').length

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-200">
      
      {/* Cabecera Principal con soporte de internacionalización */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-600 to-cyan-800 rounded-2xl text-white shadow-lg shadow-teal-700/20">
            <Kanban size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t('adminTasks.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('adminTasks.subtitle')}
            </p>
          </div>
        </div>

        {/* Botones de Acción Global */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerarRecurrentes}
            title={t('adminTasks.generateRecurringTooltip')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Repeat size={14} />
            {t('adminTasks.generateRecurring')}
          </button>

          <button
            onClick={handleProcesarAlertas}
            title={t('adminTasks.alertOverdueTooltip')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Mail size={14} />
            {t('adminTasks.alertOverdue')}
          </button>

          <button
            onClick={() => setModalCrearAbierto(true)}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-700/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle size={15} />
            {t('adminTasks.newTask')}
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

      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('adminTasks.totalTasks')}</span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">{totalTareas}</span>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('adminTasks.inProgress')}</span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">{enProgreso}</span>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
            <AlertTriangle size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('adminTasks.overdue')}</span>
            <span className="text-lg font-black text-red-600 dark:text-red-400">{vencidas}</span>
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            <Lock size={18} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('adminTasks.blocked')}</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">{bloqueadas}</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas: Tablero Kanban vs Tareas Recurrentes */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setTabActiva('KANBAN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabActiva === 'KANBAN'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban size={14} />
            {t('adminTasks.tabKanban')}
          </button>
          <button
            onClick={() => setTabActiva('RECURRENTES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              tabActiva === 'RECURRENTES'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Repeat size={14} />
            {t('adminTasks.tabRecurring')}
          </button>
        </div>

        <button
          onClick={tabActiva === 'KANBAN' ? cargarTareas : cargarRecurrentes}
          title={t('adminTasks.refreshTooltip')}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Contenido Pestaña 1: Tablero Kanban */}
      {tabActiva === 'KANBAN' && (
        <div className="flex flex-col flex-1 space-y-3">
          {/* Barra de Filtros con soporte multi-idioma */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-2">
              <Filter size={13} /> {t('adminTasks.filters')}
            </span>

            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">{t('adminTasks.allPriorities')}</option>
              <option value="ALTA">{t('taskPriority.ALTA')}</option>
              <option value="MEDIA">{t('taskPriority.MEDIA')}</option>
              <option value="BAJA">{t('taskPriority.BAJA')}</option>
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">{t('adminTasks.allTypes')}</option>
              {TIPOS_TAREA.map(tipoItem => (
                <option key={tipoItem.id} value={tipoItem.id}>
                  {t('taskType.' + tipoItem.id, tipoItem.label)}
                </option>
              ))}
            </select>

            <select
              value={filtroTrabajador}
              onChange={(e) => setFiltroTrabajador(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="">{t('adminTasks.allOperators')}</option>
              {trabajadores.map(trab => (
                <option key={trab.idUsuario} value={trab.idUsuario}>
                  {trab.nombreCompleto}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={soloVencidas}
                onChange={(e) => setSoloVencidas(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded-md focus:ring-red-500"
              />
              <span className="text-red-600 dark:text-red-400">{t('adminTasks.onlyOverdue')}</span>
            </label>
          </div>

          {/* Tablero Kanban */}
          {cargandoTareas ? (
            <div className="flex-1 flex items-center justify-center p-12 text-xs text-slate-400">
              {t('adminTasks.loadingKanban')}
            </div>
          ) : (
            <KanbanBoard
              tareas={tareas}
              esAdmin={true}
              usuarioActual={user}
              onCambiarEstado={handleSolicitarCambioEstado}
              onVerDetalle={(t) => setModalDetalle({ abierto: true, tarea: t })}
              onReasignar={(t) => setModalReasignar({ abierto: true, tarea: t })}
            />
          )}
        </div>
      )}

      {/* Contenido Pestaña 2: Tareas Recurrentes con soporte de traducción */}
      {tabActiva === 'RECURRENTES' && (
        <div className="flex flex-col flex-1 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t('adminTasks.recurringRulesTitle')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('adminTasks.recurringRulesSubtitle')}
                </p>
              </div>

              <button
                onClick={() => setModalCrearAbierto(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <PlusCircle size={14} />
                {t('adminTasks.newRule')}
              </button>
            </div>

            {cargandoRecurrentes ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t('adminTasks.loadingRecurring')}
              </div>
            ) : recurrentes.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-2xl">
                {t('adminTasks.noRecurringRules')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-3 px-3">{t('adminTasks.colTitleType')}</th>
                      <th className="py-3 px-3">{t('adminTasks.colPeriodicity')}</th>
                      <th className="py-3 px-3">{t('adminTasks.colLocation')}</th>
                      <th className="py-3 px-3">{t('adminTasks.colOperator')}</th>
                      <th className="py-3 px-3">{t('adminTasks.colNextExecution')}</th>
                      <th className="py-3 px-3">{t('adminTasks.colStatus')}</th>
                      <th className="py-3 px-3 text-right">{t('adminTasks.colActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {recurrentes.map((rec) => {
                      const estaActiva = rec.activo ?? rec.activa
                      const proxFecha = formatFecha(rec.fechaProximaEjecucion || rec.proximaEjecucion, 'N/A')
                      const { titulo: titParsed, descripcion: descParsed } = extraerTituloYDescripcion(rec, rec.tipoTarea || 'Tarea Recurrente')
                      // Traducción dinámica de la regla recurrente (título, descripción y zona)
                      const titTraducido = t('taskTitle.' + (titParsed || '').trim(), titParsed)
                      const descTraducida = descParsed ? t('taskDesc.' + (descParsed || '').trim(), descParsed) : ''

                      return (
                        <tr key={rec.idTareaRecurrente} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {titTraducido}
                            </span>
                            {descTraducida && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1">
                                {descTraducida}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {t('taskType.' + (rec.tipoTarea || rec.tipo), rec.tipoTarea || rec.tipo)} • {t('adminTasks.priorityPrefix', 'Prioridad')}: {t('taskPriority.' + rec.prioridad, rec.prioridad)}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                            {rec.frecuenciaDias 
                              ? t('adminTasks.everyNDays', { days: rec.frecuenciaDias }) 
                              : t('periodicity.' + rec.periodicidad, rec.periodicidad || t('adminTasks.periodic', 'Periódica'))}
                            {rec.diaSemana && ` (${t('dayOfWeek.' + rec.diaSemana, rec.diaSemana)})`}
                            {rec.diaMes && ` (${t('adminTasks.dayPrefix', 'Día')} ${rec.diaMes})`}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {rec.nombreZona 
                              ? `${t('adminTasks.zonePrefix', 'Zona')}: ${t('zone.name.' + (rec.nombreZona || '').trim(), rec.nombreZona)}` 
                              : (rec.idLote ? `${t('adminTasks.batchPrefix', 'Lote')}: #${rec.idLote}` : t('adminTasks.generalLocation', 'General'))}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {rec.nombreTrabajador || <span className="italic text-slate-400">{t('adminTasks.unassigned', 'Sin asignar')}</span>}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                            {proxFecha}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              estaActiva
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {estaActiva ? t('adminTasks.activeStatus', 'Activa') : t('adminTasks.pausedStatus', 'Pausada')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => setModalEditarRecurrente({ abierto: true, regla: rec })}
                              className="p-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                              title={t('adminTasks.editRuleTooltip')}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleToggleRecurrente(rec)}
                              className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                                estaActiva
                                  ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                              }`}
                              title={estaActiva ? t('adminTasks.pauseRuleTooltip') : t('adminTasks.resumeRuleTooltip')}
                            >
                              {estaActiva ? <Pause size={15} /> : <Play size={15} />}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales Compartidos */}
      <ModalCrearTarea
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        onTareaCreada={() => {
          mostrarExito(t('adminTasks.taskCreatedSuccess'))
          cargarTareas()
          if (tabActiva === 'RECURRENTES') cargarRecurrentes()
        }}
      />

      <ModalEditarTareaRecurrente
        abierto={modalEditarRecurrente.abierto}
        regla={modalEditarRecurrente.regla}
        onCerrar={() => setModalEditarRecurrente({ abierto: false, regla: null })}
        onReglaActualizada={() => {
          mostrarExito(t('adminTasks.ruleUpdatedSuccess'))
          cargarRecurrentes()
        }}
      />

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
        esAdmin={true}
        onCerrar={() => setModalDetalle({ abierto: false, tarea: null })}
        onReasignar={(t) => setModalReasignar({ abierto: true, tarea: t })}
      />

      <ModalReasignarTarea
        abierto={modalReasignar.abierto}
        tarea={modalReasignar.tarea}
        trabajadores={trabajadores}
        onCerrar={() => setModalReasignar({ abierto: false, tarea: null })}
        onReasignar={handleConfirmarReasignacion}
      />

    </div>
  )
}
