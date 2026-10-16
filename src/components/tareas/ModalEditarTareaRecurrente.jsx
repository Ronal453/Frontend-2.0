import React, { useState, useEffect } from 'react'
import {
  X,
  Repeat,
  Save,
  MapPin,
  Sprout,
  User,
  AlertTriangle,
  Clock,
  Layers
} from 'lucide-react'
import {
  TIPOS_TAREA,
  PRIORIDAD_CONFIG,
  extraerTituloYDescripcion
} from './tareasConstantes'
import {
  actualizarTareaRecurrente,
  getTrabajadoresActivos
} from '../../api/adminApi'
import { getZonas, getLotes } from '../../api/trabajadorApi'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Modal para la edición de reglas de tareas recurrentes por parte del administrador con soporte multi-idioma.
 * Permite modificar título, descripción/instrucciones, tipo de tarea, prioridad,
 * frecuencia en días, ubicación (Zona o Lote) y operario asignado.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.abierto - Indica si el modal está visible
 * @param {Object|null} props.regla - Objeto con los datos de la regla a editar
 * @param {Function} props.onCerrar - Cierra el modal
 * @param {Function} props.onReglaActualizada - Callback tras actualizar con éxito
 * @returns {JSX.Element|null}
 */
export default function ModalEditarTareaRecurrente({
  abierto,
  regla,
  onCerrar,
  onReglaActualizada
}) {
  const { t } = useLanguage()
  const [titulo, setTitulo] = useState('')
  const [tipoTarea, setTipoTarea] = useState('RIEGO')
  const [prioridad, setPrioridad] = useState('MEDIA')
  const [descripcion, setDescripcion] = useState('')
  const [frecuenciaDias, setFrecuenciaDias] = useState(7)
  const [tipoUbicacion, setTipoUbicacion] = useState('ZONA') // 'ZONA' | 'LOTE'
  const [idZona, setIdZona] = useState('')
  const [idLote, setIdLote] = useState('')
  const [idTrabajadorAsignado, setIdTrabajadorAsignado] = useState('')

  // Listas de selección
  const [trabajadores, setTrabajadores] = useState([])
  const [zonas, setZonas] = useState([])
  const [lotes, setLotes] = useState([])
  const [cargandoSelectores, setCargandoSelectores] = useState(false)

  // Estados de formulario
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (abierto) {
      cargarSelectores()
    }
  }, [abierto])

  useEffect(() => {
    if (regla && abierto) {
      setTipoTarea(regla.tipoTarea || 'RIEGO')
      setPrioridad(regla.prioridad || 'MEDIA')

      // Extraer y separar el título y las instrucciones a partir del campo compuesto o atributos de la regla
      const { titulo: titInicial, descripcion: descInicial } = extraerTituloYDescripcion(regla, regla.tipoTarea)
      setTitulo(titInicial)
      setDescripcion(descInicial)

      setFrecuenciaDias(regla.frecuenciaDias || 7)

      if (regla.idLote) {
        setTipoUbicacion('LOTE')
        setIdLote(String(regla.idLote))
        setIdZona('')
      } else {
        setTipoUbicacion('ZONA')
        setIdZona(regla.idZona ? String(regla.idZona) : '')
        setIdLote('')
      }

      setIdTrabajadorAsignado(regla.idTrabajadorAsignado ? String(regla.idTrabajadorAsignado) : '')
      setError('')
    }
  }, [regla, abierto])

  /**
   * Carga trabajadores, zonas y lotes disponibles para alimentar los desplegables.
   */
  const cargarSelectores = async () => {
    setCargandoSelectores(true)
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
      console.error('Error cargando listas para editar regla recurrente', err)
    } finally {
      setCargandoSelectores(false)
    }
  }

  if (!abierto || !regla) return null

  /**
   * Envía la actualización al backend tras validar las reglas de negocio y exclusión mutua.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validación del título de la tarea
    if (!titulo.trim()) {
      setError(t('editRecurring.titleRequired'))
      return
    }

    // Validación de XOR Lote o Zona
    if (tipoUbicacion === 'ZONA' && !idZona) {
      setError(t('editRecurring.mustSelectZone'))
      return
    }
    if (tipoUbicacion === 'LOTE' && !idLote) {
      setError(t('editRecurring.mustSelectBatch'))
      return
    }
    if (!frecuenciaDias || Number(frecuenciaDias) < 1) {
      setError(t('editRecurring.minFrequencyDays'))
      return
    }

    setGuardando(true)
    try {
      // Ensamblamos la descripción compuesta ("Título - Instrucciones") para almacenamiento
      const descFinal = descripcion.trim()
        ? `${titulo.trim()} - ${descripcion.trim()}`
        : titulo.trim()

      const payload = {
        tipoTarea,
        prioridad,
        descripcion: descFinal,
        frecuenciaDias: Number(frecuenciaDias),
        idZona: tipoUbicacion === 'ZONA' ? Number(idZona) : null,
        idLote: tipoUbicacion === 'LOTE' ? Number(idLote) : null,
        idTrabajadorAsignado: idTrabajadorAsignado ? Number(idTrabajadorAsignado) : null,
      }

      await actualizarTareaRecurrente(regla.idTareaRecurrente, payload)
      onReglaActualizada?.()
      onCerrar()
    } catch (err) {
      const campos = err.response?.data?.campos
      if (campos && typeof campos === 'object' && Object.keys(campos).length > 0) {
        setError(Object.values(campos).join('. '))
      } else {
        setError(err.response?.data?.mensaje || t('editRecurring.errorUpdating'))
      }
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Modal con soporte de internacionalización */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
              <Repeat size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {t('editRecurring.modalTitle', { id: regla.idTareaRecurrente })}
              </h3>
              <p className="text-xs text-slate-400">
                {t('editRecurring.modalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Título de la Tarea Recurrente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('editRecurring.taskTitleLabel')}
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={t('editRecurring.taskTitlePlaceholder')}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tipo de Actividad y Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('editRecurring.activityTypeLabel')}
              </label>
              <select
                value={tipoTarea}
                onChange={(e) => setTipoTarea(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
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
                {t('editRecurring.priorityLabel')}
              </label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BAJA">{t('taskPriority.BAJA')}</option>
                <option value="MEDIA">{t('taskPriority.MEDIA')}</option>
                <option value="ALTA">{t('createTask.priorityHigh')}</option>
              </select>
            </div>
          </div>

          {/* Frecuencia de Repetición en Días */}
          <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
            <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300">
              {t('editRecurring.frequencyLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: t('editRecurring.presetDaily'), dias: 1 },
                { label: t('editRecurring.presetWeekly'), dias: 7 },
                { label: t('editRecurring.presetBiweekly'), dias: 15 },
                { label: t('editRecurring.presetMonthly'), dias: 30 }
              ].map(preset => (
                <button
                  type="button"
                  key={preset.dias}
                  onClick={() => setFrecuenciaDias(preset.dias)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    Number(frecuenciaDias) === preset.dias
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">{t('editRecurring.orSpecifyEvery')}</span>
              <input
                type="number"
                min="1"
                max="365"
                value={frecuenciaDias}
                onChange={(e) => setFrecuenciaDias(e.target.value)}
                className="w-20 text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-center"
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('editRecurring.daysUnit')}</span>
            </div>
          </div>

          {/* Descripción / Instrucciones */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('editRecurring.instructionsLabel')}
            </label>
            <textarea
              rows="3"
              maxLength={350}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={t('editRecurring.instructionsPlaceholder')}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Ubicación: Selector XOR Zona o Lote */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('editRecurring.locationSectionTitle')}
              </span>
              <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTipoUbicacion('ZONA')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tipoUbicacion === 'ZONA' ? 'bg-teal-700 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('editRecurring.byZone')}
                </button>
                <button
                  type="button"
                  onClick={() => setTipoUbicacion('LOTE')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    tipoUbicacion === 'LOTE' ? 'bg-teal-700 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t('editRecurring.byBatch')}
                </button>
              </div>
            </div>

            {tipoUbicacion === 'ZONA' ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t('editRecurring.zoneLabel')}
                </label>
                <select
                  value={idZona}
                  onChange={(e) => setIdZona(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="">{t('editRecurring.selectZonePrompt')}</option>
                  {zonas.map(z => (
                    <option key={z.idZona} value={z.idZona}>
                      {t('zone.name.' + (z.nombre || '').trim(), z.nombre)} ({z.tipo})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t('editRecurring.batchLabel')}
                </label>
                <select
                  value={idLote}
                  onChange={(e) => setIdLote(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="">{t('editRecurring.selectBatchPrompt')}</option>
                  {lotes.map(l => (
                    <option key={l.idLote} value={l.idLote}>
                      {l.codigoLote} - {l.especie} ({l.estadoLote})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Operario Asignado */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('editRecurring.assignedOperatorLabel')}
            </label>
            <select
              value={idTrabajadorAsignado}
              onChange={(e) => setIdTrabajadorAsignado(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="">{t('editRecurring.unassignedOption')}</option>
              {trabajadores.map(trab => (
                <option key={trab.idUsuario} value={trab.idUsuario}>
                  {trab.nombreCompleto} ({trab.correo})
                </option>
              ))}
            </select>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t('editRecurring.cancel')}
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              <Save size={14} />
              {guardando ? t('editRecurring.savingChanges') : t('editRecurring.saveChanges')}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
