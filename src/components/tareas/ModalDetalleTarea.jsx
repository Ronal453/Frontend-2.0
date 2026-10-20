import React, { useState, useEffect } from 'react'
import {
  X,
  MapPin,
  Sprout,
  User,
  Calendar,
  AlertCircle,
  Repeat,
  Send,
  UserCheck,
  Tag
} from 'lucide-react'
import LineaTiempoTarea from './LineaTiempoTarea'
import {
  PRIORIDAD_CONFIG,
  TIPOS_TAREA,
  formatFecha,
  extraerTituloYDescripcion
} from './tareasConstantes'
import {
  getComentariosTarea,
  getHistorialTarea,
  agregarComentarioTarea
} from '../../api/trabajadorApi'
import { useLanguage } from '../../context/LanguageContext'
import DynamicText from '../common/DynamicText'

/**
 * Modal detallado de tarea para visualización técnica, envío de comentarios y auditoría unificada (HU27) con soporte multi-idioma.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.abierto - Indica si el modal está visible
 * @param {Object} props.tarea - Objeto de tarea actual
 * @param {boolean} props.esAdmin - Si el usuario actual es Administrador
 * @param {Function} props.onCerrar - Cierra el modal
 * @param {Function} [props.onReasignar] - Callback para abrir modal de reasignación
 * @returns {JSX.Element|null}
 */
export default function ModalDetalleTarea({
  abierto,
  tarea,
  esAdmin,
  onCerrar,
  onReasignar
}) {
  const { t } = useLanguage()
  const [comentarios, setComentarios] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargandoInfo, setCargandoInfo] = useState(false)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [errorComentario, setErrorComentario] = useState('')

  useEffect(() => {
    if (abierto && tarea?.idTarea) {
      cargarAuditoria(tarea.idTarea)
    }
  }, [abierto, tarea?.idTarea])

  const cargarAuditoria = async (idTarea) => {
    setCargandoInfo(true)
    setErrorComentario('')
    try {
      const [resCom, resHist] = await Promise.all([
        getComentariosTarea(idTarea),
        getHistorialTarea(idTarea)
      ])
      setComentarios(resCom.data || [])
      setHistorial(resHist.data || [])
    } catch (err) {
      console.error('Error cargando auditoría de la tarea', err)
    } finally {
      setCargandoInfo(false)
    }
  }

  const handleEnviarComentario = async (e) => {
    e.preventDefault()
    if (!nuevoComentario.trim()) return

    setEnviandoComentario(true)
    setErrorComentario('')
    try {
      const res = await agregarComentarioTarea(tarea.idTarea, nuevoComentario)
      setComentarios(prev => [...prev, res.data])
      setNuevoComentario('')
    } catch (err) {
      setErrorComentario(err.response?.data?.mensaje || t('taskDetail.commentError'))
    } finally {
      setEnviandoComentario(false)
    }
  }

  if (!abierto || !tarea) return null

  const prioridadMeta = PRIORIDAD_CONFIG[tarea.prioridad] || PRIORIDAD_CONFIG.MEDIA
  const tipoMeta = TIPOS_TAREA.find(tipoItem => tipoItem.id === tarea.tipoTarea) || { label: tarea.tipoTarea }
  const tipoLabelTraducido = t('taskType.' + tarea.tipoTarea, tipoMeta.label)
  const { titulo: tituloDetalle, descripcion: descDetalle } = extraerTituloYDescripcion(tarea, tipoLabelTraducido)
  // Traducción dinámica del título y descripción/instrucciones de la tarea
  const tituloTraducido = t('taskTitle.' + (tituloDetalle || '').trim(), tituloDetalle)
  const descTraducida = descDetalle ? t('taskDesc.' + (descDetalle || '').trim(), descDetalle) : ''

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Modal con soporte multi-idioma */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${prioridadMeta.badge}`}>
                {t('taskPriority.' + tarea.prioridad, prioridadMeta.label)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
                {t('taskStatus.' + tarea.estadoTarea, tarea.estadoTarea?.replace('_', ' '))}
              </span>
              {tarea.idTareaRecurrente && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Repeat size={12} /> {t('taskCard.recurringBadge', 'Recurrente')}
                </span>
              )}
              {tarea.vencida && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200">
                  <AlertCircle size={12} /> {t('taskDetail.overdueBadge', '¡Vencida!')}
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              <DynamicText text={tituloDetalle} prefix="taskTitle" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('taskDetail.taskHeader', {
                id: tarea.idTarea,
                date: formatFecha(tarea.fechaCreacion, t('taskDetail.createdRecent', 'Recientemente'))
              }, `Tarea #${tarea.idTarea} • Creada el ${formatFecha(tarea.fechaCreacion, 'Recientemente')}`)}
            </p>
          </div>

          <button
            onClick={onCerrar}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Instrucciones / Observaciones operativas si existen */}
          {descDetalle && (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {t('taskDetail.instructionsTitle', 'Instrucciones u Observaciones')}
              </h5>
              <DynamicText 
                text={descDetalle} 
                prefix="taskDesc" 
                as="p" 
                className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed" 
              />
            </div>
          )}

          {/* Ficha técnica en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Tag size={16} className="text-slate-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('taskDetail.taskTypeLabel', 'Tipo de Tarea')}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{tipoLabelTraducido}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('taskDetail.operatorLabel', 'Operario Asignado')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {tarea.nombreTrabajador || t('taskDetail.unassigned', 'Sin asignar')}
                  </span>
                </div>
              </div>
              {esAdmin && onReasignar && (
                <button
                  onClick={() => { onCerrar(); onReasignar(tarea); }}
                  className="px-2.5 py-1 text-[11px] font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 rounded-lg border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors"
                >
                  {t('taskDetail.reassignButton', 'Reasignar')}
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              {tarea.nombreZona ? (
                <>
                  <MapPin size={16} className="text-teal-600 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('taskDetail.locationZone', 'Ubicación (Zona)')}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {t('zone.name.' + (tarea.nombreZona || '').trim(), tarea.nombreZona)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Sprout size={16} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('taskDetail.locationBatch', 'Ubicación (Lote)')}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {tarea.codigoLote} {tarea.especieLote ? `(${tarea.especieLote})` : ''}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Calendar size={16} className={tarea.vencida ? 'text-red-500' : 'text-slate-400'} />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('taskDetail.deadlineLabel', 'Fecha Límite')}</span>
                <span className={`font-semibold ${tarea.vencida ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                  {formatFecha(tarea.fechaLimite, t('taskDetail.noDeadline', 'Sin fecha límite'))}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario para agregar comentario */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t('taskDetail.addNoteTitle', 'Agregar Nota u Observación')}
            </h4>
            {errorComentario && (
              <p className="text-xs text-red-500 mb-2 font-semibold">{errorComentario}</p>
            )}
            <form onSubmit={handleEnviarComentario} className="flex gap-2">
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder={t('taskDetail.commentPlaceholder', 'Escribe un comentario o actualización de avance...')}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                disabled={enviandoComentario || !nuevoComentario.trim()}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send size={13} />
                {enviandoComentario ? t('taskDetail.sending', 'Enviando...') : t('taskDetail.commentButton', 'Comentar')}
              </button>
            </form>
          </div>

          {/* Línea de tiempo unificada */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              {t('taskDetail.timelineTitle', 'Línea de Tiempo y Auditoría')}
            </h4>
            {cargandoInfo ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {t('taskDetail.loadingEvents', 'Cargando historial de eventos...')}
              </div>
            ) : (
              <LineaTiempoTarea comentarios={comentarios} historial={historial} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onCerrar}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
          >
            {t('taskDetail.closeButton', 'Cerrar')}
          </button>
        </div>
      </div>
    </div>
  )
}
