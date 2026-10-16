import React, { useState } from 'react'
import { AlertCircle, Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { extraerTituloYDescripcion } from './tareasConstantes'

/**
 * Modal de confirmación para el cambio de estado de una tarea (HU25, HU26) con soporte multi-idioma.
 * Permite registrar un comentario explicativo (especialmente relevante si se bloquea la tarea).
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.abierto - Si el modal está visible
 * @param {Object} props.tarea - Tarea a modificar
 * @param {string} props.nuevoEstado - Estado de destino seleccionado
 * @param {Function} props.onCerrar - Cierra el modal
 * @param {Function} props.onConfirmar - Callback con (tarea, nuevoEstado, comentario)
 * @returns {JSX.Element|null} Modal renderizado
 */
export default function ModalCambioEstado({
  abierto,
  tarea,
  nuevoEstado,
  onCerrar,
  onConfirmar
}) {
  const { t } = useLanguage()
  const [comentario, setComentario] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (!abierto || !tarea || !nuevoEstado) return null

  const esBloqueo = nuevoEstado === 'BLOQUEADA'
  const esCompletada = nuevoEstado === 'COMPLETADA'
  const tipoLabelTraducido = t('taskType.' + tarea.tipoTarea, tarea.tipoTarea)
  const { titulo: tituloDetalle } = extraerTituloYDescripcion(tarea, tipoLabelTraducido)
  const tituloTraducido = t('taskTitle.' + (tituloDetalle || '').trim(), tituloDetalle)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await onConfirmar(tarea, nuevoEstado, comentario)
      setComentario('')
      onCerrar()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Cabecera */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${
            esBloqueo ? 'bg-amber-100 dark:bg-amber-950 text-amber-600' :
            esCompletada ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600' :
            'bg-blue-100 dark:bg-blue-950 text-blue-600'
          }`}>
            {esBloqueo ? <Lock size={20} /> : esCompletada ? <CheckCircle2 size={20} /> : <ArrowRight size={20} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('changeStatus.modalTitle', 'Cambiar Estado de Tarea')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tituloTraducido}
            </p>
          </div>
        </div>

        {/* Resumen del movimiento */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs mb-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('changeStatus.currentState', 'Estado Actual')}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {t('taskStatus.' + tarea.estadoTarea, tarea.estadoTarea?.replace('_', ' '))}
            </span>
          </div>
          <ArrowRight size={16} className="text-slate-400" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('changeStatus.newState', 'Nuevo Estado')}</span>
            <span className={`font-bold ${
              esBloqueo ? 'text-amber-600 dark:text-amber-400' :
              esCompletada ? 'text-emerald-600 dark:text-emerald-400' :
              'text-blue-600 dark:text-blue-400'
            }`}>
              {t('taskStatus.' + nuevoEstado, nuevoEstado?.replace('_', ' '))}
            </span>
          </div>
        </div>

        {/* Advertencia si es estado terminal COMPLETADA */}
        {esCompletada && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              <strong>{t('changeStatus.completedWarningTitle', 'Atención:')}</strong> {t('changeStatus.completedWarningText', '"Completada" es un estado final. Una vez marcada como completada, la tarea no podrá reabrirse.')}
            </span>
          </div>
        )}

        {/* Advertencia si es bloqueo */}
        {esBloqueo && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              {t('changeStatus.blockedWarningText', 'Ingresa el motivo del bloqueo (falta de insumos, condiciones climáticas, etc.) para que el equipo esté enterado.')}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('changeStatus.commentLabel', 'Observaciones / Comentario')} {esBloqueo ? t('changeStatus.recommended', '(Recomendado)') : t('changeStatus.optional', '(Opcional)')}
            </label>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder={esBloqueo ? t('changeStatus.blockedPlaceholder', 'Explica la causa del bloqueo...') : t('changeStatus.normalPlaceholder', 'Escribe una nota sobre este cambio...')}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t('changeStatus.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={guardando}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all
                ${esBloqueo ? 'bg-amber-600 hover:bg-amber-700' :
                  esCompletada ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-teal-700 hover:bg-teal-800'}
                disabled:opacity-50`}
            >
              {guardando ? t('changeStatus.saving', 'Guardando...') : t('changeStatus.confirmButton', 'Confirmar Cambio')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
