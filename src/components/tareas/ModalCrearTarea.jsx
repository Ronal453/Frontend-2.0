import React, { useState, useEffect } from 'react'
import {
  PlusCircle,
  X,
  AlertCircle,
  Repeat,
  MapPin,
  Sprout,
  User,
  Calendar,
  Layers
} from 'lucide-react'
import {
  TIPOS_TAREA,
  PERIODICIDADES,
  DIAS_SEMANA
} from './tareasConstantes'
import {
  crearTareaAdmin,
  crearTareaConRecurrencia,
  getTrabajadoresActivos
} from '../../api/adminApi'
import { getZonas, getLotes } from '../../api/trabajadorApi'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Modal para la creación de tareas puntuales (HU22) y tareas recurrentes (HU23) con soporte multi-idioma.
 * Incluye validación XOR estricta (o Lote o Zona, nunca ambos) y selectores dinámicos.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.abierto - Indica si el modal está visible
 * @param {Function} props.onCerrar - Función para cerrar el modal
 * @param {Function} props.onTareaCreada - Callback ejecutado tras crear con éxito
 * @returns {JSX.Element|null}
 */
export default function ModalCrearTarea({
  abierto,
  onCerrar,
  onTareaCreada
}) {
  const { t } = useLanguage()
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState('RIEGO')
  const [prioridad, setPrioridad] = useState('MEDIA')
  const [idAsignadoA, setIdAsignadoA] = useState('')
  const [tipoUbicacion, setTipoUbicacion] = useState('ZONA') // 'ZONA' | 'LOTE'
  const [idZona, setIdZona] = useState('')
  const [idLote, setIdLote] = useState('')
  const [fechaVencimiento, setFechaVencimiento] = useState('')

  // Opciones de recurrencia (HU23)
  const [esRecurrente, setEsRecurrente] = useState(false)
  const [periodicidad, setPeriodicidad] = useState('SEMANAL')
  const [diaSemana, setDiaSemana] = useState('LUNES')
  const [diaMes, setDiaMes] = useState('1')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState('')

  // Listas de datos remotos
  const [trabajadores, setTrabajadores] = useState([])
  const [zonas, setZonas] = useState([])
  const [lotes, setLotes] = useState([])
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (abierto) {
      cargarSelectores()
    }
  }, [abierto])

  const cargarSelectores = async () => {
    setCargandoDatos(true)
    try {
      const [resTrab, resZonas, resLotes] = await Promise.all([
        getTrabajadoresActivos(),
        getZonas(),
        getLotes({ size: 100 })
      ])
      setTrabajadores(resTrab.data || [])
      setZonas(resZonas.data || [])
      setLotes(resLotes.data?.content || resLotes.data || [])
    } catch (err) {
      console.error('Error cargando listas para crear tarea', err)
    } finally {
      setCargandoDatos(false)
    }
  }

  if (!abierto) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validación de XOR Lote / Zona
    if (tipoUbicacion === 'ZONA' && !idZona) {
      setError(t('createTask.mustSelectZone'))
      return
    }
    if (tipoUbicacion === 'LOTE' && !idLote) {
      setError(t('createTask.mustSelectBatch'))
      return
    }

    setGuardando(true)
    try {
      const descFinal = titulo ? (descripcion ? `${titulo.trim()} - ${descripcion.trim()}` : titulo.trim()) : (descripcion.trim() || null)
      const idTrab = idAsignadoA ? Number(idAsignadoA) : null
      const idZ = tipoUbicacion === 'ZONA' && idZona ? Number(idZona) : null
      const idL = tipoUbicacion === 'LOTE' && idLote ? Number(idLote) : null

      if (esRecurrente) {
        // Enviar creación con recurrencia (HU23)
        let frecuencia = 7
        if (periodicidad === 'DIARIA') frecuencia = 1
        else if (periodicidad === 'SEMANAL') frecuencia = 7
        else if (periodicidad === 'QUINCENAL') frecuencia = 15
        else if (periodicidad === 'MENSUAL') frecuencia = 30

        const payload = {
          tipoTarea: tipo,
          prioridad,
          descripcion: descFinal,
          frecuenciaDias: frecuencia,
          idTrabajadorAsignado: idTrab,
          idZona: idZ,
          idLote: idL,
          fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
        }
        await crearTareaConRecurrencia(payload)
      } else {
        // Enviar tarea puntual (HU22)
        const payload = {
          tipoTarea: tipo,
          prioridad,
          descripcion: descFinal,
          idTrabajadorAsignado: idTrab,
          idZona: idZ,
          idLote: idL,
          fechaLimite: fechaVencimiento || new Date().toISOString().split('T')[0],
        }
        await crearTareaAdmin(payload)
      }

      onTareaCreada?.()
      onCerrar()
    } catch (err) {
      const campos = err.response?.data?.campos
      if (campos && typeof campos === 'object' && Object.keys(campos).length > 0) {
        const detalle = Object.values(campos).join('. ')
        setError(detalle)
      } else {
        setError(err.response?.data?.mensaje || t('createTask.errorCreating'))
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header con soporte de internacionalización */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {esRecurrente ? t('createTask.titleRecurring') : t('createTask.titleStandard')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('createTask.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('createTask.taskTitleLabel')}
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={t('createTask.taskTitlePlaceholder')}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('createTask.descriptionLabel')}
            </label>
            <textarea
              rows={2}
              maxLength={500}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={t('createTask.descriptionPlaceholder')}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Tipo y Prioridad en 2 columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('createTask.activityTypeLabel')}
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {TIPOS_TAREA.map(tipoItem => (
                  <option key={tipoItem.id} value={tipoItem.id}>
                    {t('taskType.' + tipoItem.id, tipoItem.label)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('createTask.priorityLabel')}
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALTA">{t('createTask.priorityHigh')}</option>
                <option value="MEDIA">{t('createTask.priorityMedium')}</option>
                <option value="BAJA">{t('createTask.priorityLow')}</option>
              </select>
            </div>
          </div>

          {/* Operario Asignado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('createTask.assignedOperatorLabel')}
            </label>
            <select
              value={idAsignadoA}
              onChange={(e) => setIdAsignadoA(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">{t('createTask.unassignedOption')}</option>
              {trabajadores.map(trab => (
                <option key={trab.idUsuario} value={trab.idUsuario}>
                  {trab.nombreCompleto} ({trab.correo})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Ubicación XOR: Zona vs Lote */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('createTask.locationSectionTitle')}
              </span>
              <div className="flex p-0.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setTipoUbicacion('ZONA'); setIdLote(''); }}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tipoUbicacion === 'ZONA' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('createTask.byZone')}
                </button>
                <button
                  type="button"
                  onClick={() => { setTipoUbicacion('LOTE'); setIdZona(''); }}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tipoUbicacion === 'LOTE' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('createTask.byBatch')}
                </button>
              </div>
            </div>

            {tipoUbicacion === 'ZONA' ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t('createTask.zoneLabel')}
                </label>
                <select
                  required={tipoUbicacion === 'ZONA'}
                  value={idZona}
                  onChange={(e) => setIdZona(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t('createTask.selectZonePlaceholder')}</option>
                  {zonas.map(z => (
                    <option key={z.idZona} value={z.idZona}>
                      {t('zone.name.' + (z.nombre || '').trim(), z.nombre)} ({z.tipo || 'Invernadero'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t('createTask.batchLabel')}
                </label>
                <select
                  required={tipoUbicacion === 'LOTE'}
                  value={idLote}
                  onChange={(e) => setIdLote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t('createTask.selectBatchPlaceholder')}</option>
                  {lotes.map(l => (
                    <option key={l.idLote} value={l.idLote}>
                      {l.codigoLote} - {l.nombreEspecie || l.especie || 'Lote'} ({l.faseActual || l.estado || 'Activo'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Toggle de Recurrencia */}
          <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={esRecurrente}
                onChange={(e) => setEsRecurrente(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
              />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Repeat size={14} /> {t('createTask.scheduleRecurringCheck')}
              </span>
            </label>

            {esRecurrente ? (
              <div className="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('createTask.periodicityLabel')}
                    </label>
                    <select
                      value={periodicidad}
                      onChange={(e) => setPeriodicidad(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {PERIODICIDADES.map(p => (
                        <option key={p.id} value={p.id}>{t('periodicity.' + p.id, p.label)}</option>
                      ))}
                    </select>
                  </div>

                  {periodicidad === 'SEMANAL' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        {t('createTask.dayOfWeekLabel')}
                      </label>
                      <select
                        value={diaSemana}
                        onChange={(e) => setDiaSemana(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      >
                        {DIAS_SEMANA.map(d => (
                          <option key={d.id} value={d.id}>{t('dayOfWeek.' + d.id, d.label)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {periodicidad === 'MENSUAL' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        {t('createTask.dayOfMonthLabel')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={diaMes}
                        onChange={(e) => setDiaMes(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('createTask.startDateLabel')}
                    </label>
                    <input
                      type="date"
                      required
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('createTask.endDateLabel')}
                    </label>
                    <input
                      type="date"
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-indigo-700 dark:text-indigo-300/80 italic">
                  {t('createTask.recurringTip')}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t('createTask.dueDateLabel')}
                </label>
                <input
                  type="date"
                  value={fechaVencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t('createTask.cancel')}
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {guardando ? t('createTask.saving') : (esRecurrente ? t('createTask.createRecurringButton') : t('createTask.createStandardButton'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
