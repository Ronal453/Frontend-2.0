import React from 'react'
import { useLanguage } from '../../../context/LanguageContext'

/**
 * Modal de confirmación para el avance o cambio de estado de una tarea en el tablero Kanban.
 * Incluye campo para observaciones operativas opcionales e internacionalización.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.abierto - Indica si el modal está visible
 * @param {Object} props.tarea - Objeto de tarea actual
 * @param {string} props.nuevoEstado - Estado de destino
 * @param {string} props.comentario - Comentario ingresado por el operador
 * @param {boolean} props.enviando - Estado de envío
 * @param {Function} props.onClose - Manejador de cierre
 * @param {Function} props.onChangeComentario - Manejador de cambio de texto
 * @param {Function} props.onSubmit - Manejador de confirmación
 * @returns {JSX.Element|null} Modal renderizado
 */
export default function ModalCambioEstado({
  abierto,
  tarea,
  nuevoEstado,
  comentario,
  enviando,
  onClose,
  onChangeComentario,
  onSubmit
}) {
  const { t } = useLanguage()

  if (!abierto) return null

  const estadoLabel = t(`taskStatus.${nuevoEstado}`) !== `taskStatus.${nuevoEstado}` 
    ? t(`taskStatus.${nuevoEstado}`) 
    : nuevoEstado

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-150">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          {t('worker.modalChangeStatusTitle')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('worker.movingTask', { task: tarea?.tipoTarea })}{' '}
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{estadoLabel}</span>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t('worker.commentOptional')}
            </label>
            <textarea
              rows="3"
              value={comentario}
              onChange={(e) => onChangeComentario(e.target.value)}
              placeholder={t('worker.commentPlaceholder')}
              className="w-full text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {enviando ? t('worker.saving') : t('worker.confirmAdvance')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
