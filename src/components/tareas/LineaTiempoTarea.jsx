import React from 'react'
import {
  MessageSquare,
  Clock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Lock,
  Calendar
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import DynamicText from '../common/DynamicText'

/**
 * Componente de línea de tiempo unificada para la auditoría de una tarea (HU27) con soporte multi-idioma.
 * Combina cronológicamente los cambios de estado, reasignaciones y comentarios de operarios.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.comentarios - Lista de comentarios de la tarea
 * @param {Array} props.historial - Lista de eventos de historial / transiciones
 * @returns {JSX.Element} Línea de tiempo renderizada
 */
export default function LineaTiempoTarea({ comentarios = [], historial = [] }) {
  const { t, language } = useLanguage()

  // Normalizar eventos de historial
  const eventosHistorial = historial.map(h => ({
    id: `historial-${h.idHistorialTarea}`,
    tipo: 'HISTORIAL',
    fecha: h.fechaCambio,
    autor: h.nombreUsuario || t('timeline.defaultOperator', 'Operario'),
    estadoAnterior: h.estadoAnterior,
    estadoNuevo: h.estadoNuevo,
    comentario: h.comentario,
  }))

  // Normalizar eventos de comentarios
  const eventosComentarios = comentarios.map(c => ({
    id: `comentario-${c.idComentario}`,
    tipo: 'COMENTARIO',
    fecha: c.fechaCreacion,
    autor: c.nombreUsuario || t('timeline.defaultUser', 'Usuario'),
    comentario: c.comentario,
  }))

  // Unificar y ordenar cronológicamente descendente (más recientes primero)
  const eventosUnificados = [...eventosHistorial, ...eventosComentarios].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha)
  })

  if (eventosUnificados.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs italic">
        {t('timeline.noRecords', 'No hay registros en la línea de tiempo de esta tarea aún.')}
      </div>
    )
  }

  const getIconoEvento = (evento) => {
    if (evento.tipo === 'COMENTARIO') {
      return <MessageSquare size={14} className="text-blue-500" />
    }
    if (evento.estadoNuevo === 'COMPLETADA') {
      return <CheckCircle2 size={14} className="text-emerald-500" />
    }
    if (evento.estadoNuevo === 'BLOQUEADA') {
      return <Lock size={14} className="text-amber-500" />
    }
    if (evento.estadoAnterior && evento.estadoNuevo) {
      return <ArrowRight size={14} className="text-purple-500" />
    }
    return <Clock size={14} className="text-slate-400" />
  }

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
      {eventosUnificados.map((evento) => (
        <div key={evento.id} className="relative group">
          {/* Nodo circular en la línea */}
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-xs">
            {getIconoEvento(evento)}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 text-xs shadow-xs">
            {/* Cabecera del evento */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {evento.autor}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar size={10} />
                {evento.fecha 
                  ? new Date(evento.fecha).toLocaleString(language === 'en' ? 'en-US' : 'es-CO') 
                  : t('timeline.recentDate', 'Reciente')}
              </span>
            </div>

            {/* Contenido del evento */}
            {evento.tipo === 'HISTORIAL' ? (
              <div>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('timeline.changedStatus', 'Cambió de estado:')}{' '}
                  <span className="font-semibold text-slate-500 line-through">
                    {evento.estadoAnterior 
                      ? t('taskStatus.' + evento.estadoAnterior, evento.estadoAnterior.replace('_', ' ')) 
                      : t('timeline.startState', 'Estado inicial')}
                  </span>{' '}
                  →{' '}
                  <span className="font-bold text-teal-700 dark:text-teal-400">
                    {t('taskStatus.' + evento.estadoNuevo, evento.estadoNuevo?.replace('_', ' '))}
                  </span>
                </p>
                {evento.comentario && (
                  <DynamicText 
                    text={evento.comentario} 
                    prefix="taskComment" 
                    showQuotes 
                    as="p" 
                    className="mt-1.5 p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800" 
                  />
                )}
              </div>
            ) : (
              <DynamicText 
                text={evento.comentario} 
                prefix="taskComment" 
                as="p" 
                className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed" 
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
