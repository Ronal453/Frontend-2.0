import React from 'react'
import {
  MapPin,
  Sprout,
  User,
  Calendar,
  AlertCircle,
  Repeat,
  Lock,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Eye
} from 'lucide-react'
import {
  PRIORIDAD_CONFIG,
  TIPOS_TAREA,
  DESTINOS_VALIDOS,
  formatFecha,
  extraerTituloYDescripcion
} from './tareasConstantes'
import { useLanguage } from '../../context/LanguageContext'
import DynamicText from '../common/DynamicText'

/**
 * Componente de tarjeta de tarea individual para el tablero Kanban con soporte de internacionalización.
 * Soporta arrastre nativo (HTML5 Drag & Drop), badges de vencimiento y recurrencia,
 * y botones de acción rápida para dispositivos móviles y accesibilidad.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.tarea - Objeto con datos de la tarea
 * @param {boolean} props.puedeMover - Indica si el usuario actual tiene permisos para mover la tarea
 * @param {boolean} props.esAdmin - Indica si el usuario actual tiene rol de Administrador
 * @param {Function} props.onVerDetalle - Callback para abrir modal de detalle
 * @param {Function} props.onCambiarEstado - Callback para solicitar transición de estado
 * @param {Function} [props.onReasignar] - Callback para abrir modal de reasignación (Admin)
 * @returns {JSX.Element} Tarjeta renderizada
 */
export default function TarjetaTarea({
  tarea,
  puedeMover,
  esAdmin,
  onVerDetalle,
  onCambiarEstado,
  onReasignar
}) {
  const { t } = useLanguage()
  const prioridadMeta = PRIORIDAD_CONFIG[tarea.prioridad] || PRIORIDAD_CONFIG.MEDIA
  const tipoMeta = TIPOS_TAREA.find(tipoItem => tipoItem.id === tarea.tipoTarea) || { label: tarea.tipoTarea, color: 'text-slate-500' }
  const TipoIcon = tipoMeta.icono
  const tipoLabelTraducido = t('taskType.' + tarea.tipoTarea, tipoMeta.label)
  const { titulo: tituloMostrado, descripcion: descMostrada } = extraerTituloYDescripcion(tarea, tipoLabelTraducido)
  // Traducción dinámica del título y descripción botánica desde base de datos
  const tituloTraducido = t('taskTitle.' + (tituloMostrado || '').trim(), tituloMostrado)
  const descTraducida = descMostrada ? t('taskDesc.' + (descMostrada || '').trim(), descMostrada) : ''

  // Manejo de inicio de arrastre HTML5
  const handleDragStart = (e) => {
    if (!puedeMover) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/json', JSON.stringify(tarea))
    // Clase temporal o estilo durante arrastre
    e.currentTarget.classList.add('opacity-40', 'scale-95')
  }

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-40', 'scale-95')
  }

  const destinosDisponibles = DESTINOS_VALIDOS[tarea.estadoTarea] || []

  return (
    <div
      draggable={puedeMover}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm transition-all duration-200 
        ${puedeMover ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5' : 'cursor-default'}
        ${tarea.vencida ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10' : 'border-slate-200 dark:border-slate-800'}
      `}
    >
      {/* Indicador de Solo Lectura si el trabajador no puede moverla */}
      {!puedeMover && (
        <div
          title={t('taskCard.readOnlyTooltip', 'Solo el operario asignado o el administrador pueden mover esta tarea')}
          className="absolute top-2 right-2 text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 p-1 rounded-md"
        >
          <Lock size={12} />
        </div>
      )}

      {/* Badges superiores: Tipo, Prioridad, Recurrencia, Vencida */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2 pr-5">
        {/* Badge de Prioridad */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${prioridadMeta.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${prioridadMeta.punto}`} />
          {t('taskPriority.' + tarea.prioridad, prioridadMeta.label)}
        </span>

        {/* Badge de Tarea Recurrente */}
        {tarea.idTareaRecurrente && (
          <span
            title={t('taskCard.recurringTooltip', 'Tarea recurrente generada automáticamente')}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60"
          >
            <Repeat size={11} />
            {t('taskCard.recurringBadge', 'Recurrente')}
          </span>
        )}

        {/* Badge de Vencida */}
        {tarea.vencida && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200 animate-pulse border border-red-300 dark:border-red-700">
            <AlertCircle size={11} />
            {t('taskCard.overdueBadge', '¡Vencida!')}
          </span>
        )}
      </div>

      {/* Título de la Tarea con icono de tipo */}
      <div className="flex items-start gap-2 mb-2">
        {TipoIcon && (
          <div className={`mt-0.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 ${tipoMeta.color}`}>
            <TipoIcon size={14} />
          </div>
        )}
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
          <DynamicText text={tituloMostrado} prefix="taskTitle" />
        </h4>
      </div>

      {/* Descripción / Instrucciones cortas opcionales */}
      {descMostrada && (
        <DynamicText 
          text={descMostrada} 
          prefix="taskDesc" 
          as="p" 
          className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed" 
        />
      )}

      {/* Metadatos: Ubicación (Lote o Zona), Operario y Fecha Límite */}
      <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Ubicación (XOR Lote o Zona) con soporte de traducción de zona */}
        {tarea.nombreZona && (
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <MapPin size={12} className="text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span className="truncate">{t('taskCard.zonePrefix', 'Zona')}: {t('zone.name.' + (tarea.nombreZona || '').trim(), tarea.nombreZona)}</span>
          </div>
        )}
        {tarea.codigoLote && (
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <Sprout size={12} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">{t('taskCard.batchPrefix', 'Lote')}: {tarea.codigoLote} {tarea.especieLote ? `(${tarea.especieLote})` : ''}</span>
          </div>
        )}

        {/* Operario Asignado */}
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">
            {tarea.nombreTrabajador || <span className="italic text-slate-400">{t('taskCard.unassigned', 'Sin asignar')}</span>}
          </span>
        </div>

        {/* Fecha Límite */}
        {tarea.fechaLimite && (
          <div className={`flex items-center gap-1.5 ${tarea.vencida ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
            <Calendar size={12} className="flex-shrink-0" />
            <span>{t('taskCard.deadlinePrefix', 'Límite')}: {formatFecha(tarea.fechaLimite)}</span>
          </div>
        )}
      </div>

      {/* Barra de Acciones de la Tarjeta */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Botón Ver Detalle */}
        <button
          onClick={() => onVerDetalle(tarea)}
          className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 transition-colors"
        >
          <Eye size={12} />
          {t('taskCard.viewDetail', 'Detalle')}
        </button>

        {/* Acciones Rápidas: Reasignar (Admin) y Botones de Avance */}
        <div className="flex items-center gap-1">
          {esAdmin && onReasignar && (
            <button
              onClick={() => onReasignar(tarea)}
              title={t('taskCard.reassignTooltip', 'Reasignar operario')}
              className="p-1 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <UserCheck size={14} />
            </button>
          )}

          {/* Botones de transición manual (accesibilidad y móvil) */}
          {puedeMover && destinosDisponibles.map(destino => (
            <button
              key={destino}
              onClick={() => onCambiarEstado(tarea, destino)}
              title={t('taskCard.moveToTooltip', { status: t('taskStatus.' + destino, destino.replace('_', ' ')) }, `Mover a ${destino}`)}
              className={`p-1 rounded-lg text-xs font-bold flex items-center gap-0.5 transition-colors
                ${destino === 'COMPLETADA' ? 'text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950' : 
                  destino === 'BLOQUEADA' ? 'text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-950' : 
                  'text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-950'}`}
            >
              {destino === 'POR_HACER' ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
