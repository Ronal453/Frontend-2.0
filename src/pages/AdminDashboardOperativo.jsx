import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  Mail,
  UserCheck,
  Eye,
  TrendingUp,
  Users,
  PieChart as PieIcon
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts'
import {
  getResumenTareas,
  procesarAlertasVencidas,
  reasignarTareaAdmin,
  getTrabajadoresActivos
} from '../api/adminApi'
import ModalDetalleTarea from '../components/tareas/ModalDetalleTarea'
import ModalReasignarTarea from '../components/tareas/ModalReasignarTarea'
import { formatFecha } from '../components/tareas/tareasConstantes'
import { useLanguage } from '../context/LanguageContext'

/**
 * Paleta de colores institucionales para cada estado de tarea en los gráficos.
 */
const COLORES_ESTADO = {
  POR_HACER: '#94a3b8',    // slate-400
  EN_PROGRESO: '#3b82f6',  // blue-500
  EN_REVISION: '#a855f7',  // purple-500
  BLOQUEADA: '#f59e0b',    // amber-500
  COMPLETADA: '#10b981',   // emerald-500
}

/**
 * Dashboard Operativo de Vivero (HU29).
 * Supervisión integral de rendimiento botánico, control de atrasos, balance de carga
 * entre operarios y reasignación inmediata de tareas críticas.
 * Soporta cambio dinámico de idioma (i18n).
 *
 * @component
 * @returns {JSX.Element} Vista renderizada del Dashboard Operativo
 */
export default function AdminDashboardOperativo() {
  const { t } = useLanguage()
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Rango de fechas para el análisis operativo
  const [rangoRapido, setRangoRapido] = useState('15') // '7' | '15' | '30' | 'CUSTOM'
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  // Feedback y ventanas modales
  const [mensajeExito, setMensajeExito] = useState('')
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, tarea: null })
  const [modalReasignar, setModalReasignar] = useState({ abierto: false, tarea: null })
  const [trabajadores, setTrabajadores] = useState([])

  useEffect(() => {
    cargarTrabajadores()
    aplicarRangoRapido('15')
  }, [])

  useEffect(() => {
    if (fechaInicio || fechaFin || rangoRapido !== 'CUSTOM') {
      cargarMetricas()
    }
  }, [fechaInicio, fechaFin])

  /**
   * Carga la nómina de trabajadores activos para la lista de reasignación.
   */
  const cargarTrabajadores = async () => {
    try {
      const res = await getTrabajadoresActivos()
      setTrabajadores(res.data || [])
    } catch (err) {
      console.error('Error cargando trabajadores para el dashboard', err)
    }
  }

  /**
   * Configura las fechas de inicio y fin basándose en el selector de rango rápido.
   *
   * @param {string} dias - Días hacia atrás ('7', '15', '30')
   */
  const aplicarRangoRapido = (dias) => {
    setRangoRapido(dias)
    if (dias === 'CUSTOM') return

    const hoy = new Date()
    const inicio = new Date()
    inicio.setDate(hoy.getDate() - Number(dias))

    setFechaInicio(inicio.toISOString().split('T')[0])
    setFechaFin(hoy.toISOString().split('T')[0])
  }

  /**
   * Obtiene del backend las métricas consolidadas del vivero en el rango seleccionado.
   */
  const cargarMetricas = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await getResumenTareas(fechaInicio || undefined, fechaFin || undefined)
      setResumen(res.data)
    } catch (err) {
      setError(err.response?.data?.mensaje || t('admin.errorLoad', 'Error al cargar métricas operativas'))
    } finally {
      setCargando(false)
    }
  }

  /**
   * Ejecuta el proceso manual de notificación por correo de tareas vencidas.
   */
  const handleProcesarAlertas = async () => {
    try {
      const res = await procesarAlertasVencidas()
      setMensajeExito(res.data?.mensaje || t('adminOps.alertsProcessed'))
      setTimeout(() => setMensajeExito(''), 4000)
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error enviando alertas')
    }
  }

  /**
   * Confirma la reasignación de una tarea atrasada o crítica a otro operario.
   *
   * @param {number|string} idTarea - Identificador de la tarea
   * @param {number|string} nuevoIdAsignadoA - ID del nuevo operario
   * @param {string} motivo - Justificación de la reasignación
   */
  const handleConfirmarReasignacion = async (idTarea, nuevoIdAsignadoA, motivo) => {
    await reasignarTareaAdmin(idTarea, { nuevoIdAsignadoA, motivo })
    setMensajeExito(t('adminOps.taskReassignedSuccess', { id: idTarea }))
    setTimeout(() => setMensajeExito(''), 4000)
    cargarMetricas()
  }

  // ═══════════════════════════════════════════════════════════════════
  // Transformación y normalización segura de datos para gráficos
  // ═══════════════════════════════════════════════════════════════════

  // 1. Desglose por estado (Gráfico Donut)
  const desglose = resumen?.conteoPorEstado || resumen?.desglosePorEstado || {}
  const datosEstadosPie = Object.entries(desglose)
    .filter(([_, cantidad]) => Number(cantidad) > 0)
    .map(([estado, cantidad]) => ({
      // Traduce dinámicamente el estado para el gráfico y la leyenda
      name: t('taskStatus.' + estado, estado.replace('_', ' ')),
      estado,
      value: Number(cantidad) || 0,
    }))

  // 2. Carga por operario (Gráfico de Barras)
  const cargaTrabajadores = Array.isArray(resumen?.cargaPorTrabajador) ? resumen.cargaPorTrabajador : []
  const datosOperariosBar = cargaTrabajadores.map(trab => {
    const rawNombre = trab?.nombreTrabajador || trab?.nombreCompleto || 'Operario'
    const primerNombre = typeof rawNombre === 'string' ? rawNombre.split(' ')[0] : 'Operario'
    const activas = (Number(trab?.porHacer) || 0) + (Number(trab?.enProgreso) || 0) + (Number(trab?.enRevision) || 0) + (Number(trab?.bloqueadas) || 0)
    const completadas = Number(trab?.completadasPeriodo ?? trab?.tareasCompletadas) || 0
    return {
      nombre: primerNombre,
      Activas: activas,
      Completadas: completadas,
    }
  })

  // 3. Cumplimiento temporal diario (Gráfico de Área)
  const serieTemporal = Array.isArray(resumen?.completadasPorDia)
    ? resumen.completadasPorDia
    : Array.isArray(resumen?.cumplimientoDiario)
    ? resumen.cumplimientoDiario
    : []

  const datosEvolucionArea = serieTemporal.map(d => {
    const fStr = formatFecha(d?.fecha)
    return {
      fecha: fStr.length >= 5 ? fStr.slice(5) : fStr, // Formato MM-DD
      Completadas: Number(d?.cantidad ?? d?.cantidadCompletadas) || 0,
    }
  })

  // 4. Lista de tareas vencidas o en riesgo
  const listaVencidas = Array.isArray(resumen?.tareasVencidas)
    ? resumen.tareasVencidas
    : Array.isArray(resumen?.tareasCriticasVencidas)
    ? resumen.tareasCriticasVencidas
    : []

  return (
    <div className="flex flex-col h-full space-y-5 animate-in fade-in duration-200">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-600 to-teal-800 rounded-2xl text-white shadow-lg shadow-cyan-700/20">
            <Activity size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {t('adminOps.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('adminOps.subtitle')}
            </p>
          </div>
        </div>

        {/* Acciones y filtros de período */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Rango Rápido */}
          <div className="flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => aplicarRangoRapido('7')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rangoRapido === '7' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('adminOps.7days')}
            </button>
            <button
              onClick={() => aplicarRangoRapido('15')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rangoRapido === '15' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('adminOps.15days')}
            </button>
            <button
              onClick={() => aplicarRangoRapido('30')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                rangoRapido === '30' ? 'bg-cyan-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('adminOps.30days')}
            </button>
          </div>

          <button
            onClick={handleProcesarAlertas}
            title={t('adminOps.alertOverdueTooltip')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Mail size={14} />
            {t('adminOps.alertOverdue')}
          </button>

          <button
            onClick={cargarMetricas}
            title={t('adminOps.refreshTooltip')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={cargarMetricas}
            className="text-xs underline font-bold hover:text-red-800"
          >
            {t('common.retry', 'Reintentar')}
          </button>
        </div>
      )}

      {/* Tarjetas KPI Operativas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Activas */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
              {t('adminOps.activeTasks')}
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {cargando ? '...' : (resumen?.totalActivas ?? 0)}
            </span>
          </div>
        </div>

        {/* Tareas Vencidas */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-3xl shadow-xs flex items-center gap-4 bg-red-50/10">
          <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 animate-pulse">
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-red-500 block tracking-wider">
              {t('adminOps.overdueTasks')}
            </span>
            <span className="text-2xl font-black text-red-600 dark:text-red-400">
              {cargando ? '...' : (resumen?.vencidasActivas ?? resumen?.totalVencidas ?? 0)}
            </span>
          </div>
        </div>

        {/* Completadas en el período */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
              {t('adminOps.completedInPeriod', { days: rangoRapido })}
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {cargando ? '...' : (resumen?.completadasEnPeriodo ?? resumen?.totalCompletadasPeriodo ?? 0)}
            </span>
          </div>
        </div>

        {/* Backlog en espera */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Layers size={22} />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
              {t('adminOps.backlogBlocked')}
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {cargando ? '...' : ((Number(desglose?.POR_HACER) || 0) + (Number(desglose?.BLOQUEADA) || 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Gráficos Recharts en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Gráfico 1: Distribución por Estado (Donut) */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <PieIcon size={16} className="text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('adminOps.statusDistribution')}
            </h3>
          </div>
          <div className="w-full h-64 min-h-[256px] relative">
            {cargando ? (
              <div className="h-full min-h-[200px] flex items-center justify-center text-xs text-slate-400">
                {t('adminOps.loadingData')}
              </div>
            ) : datosEstadosPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={256}>
                <PieChart>
                  <Pie
                    data={datosEstadosPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {datosEstadosPie.map((entry) => (
                      <Cell
                        key={`cell-${entry.estado}`}
                        fill={COLORES_ESTADO[entry.estado] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [t('adminOps.tasksCount', { count: value }), name]}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center text-xs text-slate-400 italic">
                {t('adminOps.noActiveTasksPeriod')}
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Carga de Trabajo por Operario (BarChart) */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('adminOps.workloadByOperator')}
            </h3>
          </div>
          <div className="w-full h-64 min-h-[256px] relative">
            {cargando ? (
              <div className="h-full min-h-[200px] flex items-center justify-center text-xs text-slate-400">
                {t('adminOps.loadingData')}
              </div>
            ) : datosOperariosBar.length > 0 ? (
              <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={256}>
                <BarChart data={datosOperariosBar} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar dataKey="Activas" name={t('adminOps.activeBar')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Completadas" name={t('adminOps.completedBar')} fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center text-xs text-slate-400 italic">
                {t('adminOps.noOperatorsData')}
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 3: Evolución Temporal de Tareas Completadas (AreaChart) */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('adminOps.dailyCompliance')}
            </h3>
          </div>
          <div className="w-full h-64 min-h-[256px] relative">
            {cargando ? (
              <div className="h-full min-h-[200px] flex items-center justify-center text-xs text-slate-400">
                {t('adminOps.loadingData')}
              </div>
            ) : datosEvolucionArea.length > 0 ? (
              <ResponsiveContainer width="100%" height={256} minWidth={0} minHeight={256}>
                <AreaChart data={datosEvolucionArea} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Completadas"
                    name={t('adminOps.completedBar')}
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorCompletadas)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center text-xs text-slate-400 italic">
                {t('adminOps.noCompletedTasksPeriod', { days: rangoRapido })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Tabla de Tareas Vencidas o en Riesgo Crítico */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('adminOps.criticalOverdueTitle', { count: listaVencidas.length })}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {t('adminOps.criticalOverdueSubtitle')}
          </span>
        </div>

        {cargando ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {t('adminOps.checkingCriticalTasks')}
          </div>
        ) : listaVencidas.length === 0 ? (
          <div className="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400 border border-dashed rounded-2xl bg-emerald-50/20">
            {t('adminOps.noCriticalTasks')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-3">{t('adminOps.colTaskPriority')}</th>
                  <th className="py-3 px-3">{t('adminOps.colStatus')}</th>
                  <th className="py-3 px-3">{t('adminOps.colLocation')}</th>
                  <th className="py-3 px-3">{t('adminOps.colAssignedOperator')}</th>
                  <th className="py-3 px-3">{t('adminOps.colDeadline')}</th>
                  <th className="py-3 px-3 text-right">{t('adminOps.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {listaVencidas.map((tarea) => (
                  <tr key={tarea.idTarea} className="hover:bg-red-50/30 dark:hover:bg-red-950/20">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        {tarea.titulo || t('taskType.' + tarea.tipoTarea, tarea.tipoTarea)}
                      </span>
                      <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
                        {t('adminOps.priorityLabel', { priority: t('taskPriority.' + tarea.prioridad, tarea.prioridad) })}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {t('taskStatus.' + tarea.estadoTarea, tarea.estadoTarea?.replace('_', ' '))}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {tarea.nombreZona ? `${t('worker.zone')}: ${tarea.nombreZona}` : `${t('worker.batch')}: #${tarea.idLote}`}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {t('operatorName.' + (tarea.nombreTrabajador || ''), tarea.nombreTrabajador) || <span className="text-red-500 italic">{t('adminOps.unassigned')}</span>}
                    </td>
                    <td className="py-3 px-3 text-red-600 dark:text-red-400 font-bold">
                      {formatFecha(tarea.fechaLimite)}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => setModalDetalle({ abierto: true, tarea })}
                        className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> {t('adminOps.btnDetail')}
                      </button>
                      <button
                        onClick={() => setModalReasignar({ abierto: true, tarea })}
                        className="px-2.5 py-1 text-xs font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 rounded-lg border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors inline-flex items-center gap-1"
                      >
                        <UserCheck size={12} /> {t('adminOps.btnReassign')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modales Compartidos */}
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
