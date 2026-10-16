import React, { useState } from 'react'
import { UserCheck, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { extraerTituloYDescripcion } from './tareasConstantes'

/**
 * Modal de reasignación rápida de operario para una tarea existente (HU30) con soporte multi-idioma.
 * Solo accesible por administradores. Requiere seleccionar un trabajador activo e ingresar un motivo opcional.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.abierto - Si el modal está visible
 * @param {Object} props.tarea - Tarea a reasignar
 * @param {Array} props.trabajadores - Lista de operarios activos disponibles
 * @param {Function} props.onCerrar - Cierra el modal
 * @param {Function} props.onReasignar - Callback asíncrono con (idTarea, nuevoIdAsignadoA, motivo)
 * @returns {JSX.Element|null}
 */
export default function ModalReasignarTarea({
  abierto,
  tarea,
  trabajadores = [],
  onCerrar,
  onReasignar
}) {
  const { t } = useLanguage()
  const [nuevoIdAsignadoA, setNuevoIdAsignadoA] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  if (!abierto || !tarea) return null

  const tipoLabelTraducido = t('taskType.' + tarea.tipoTarea, tarea.tipoTarea)
  const { titulo: tituloDetalle } = extraerTituloYDescripcion(tarea, tipoLabelTraducido)
  const tituloTraducido = t('taskTitle.' + (tituloDetalle || '').trim(), tituloDetalle)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nuevoIdAsignadoA) {
      setError(t('reassignTask.mustSelectOperator', 'Debe seleccionar un operario'))
      return
    }

    setEnviando(true)
    setError('')
    try {
      await onReasignar(tarea.idTarea, Number(nuevoIdAsignadoA), motivo)
      setNuevoIdAsignadoA('')
      setMotivo('')
      onCerrar()
    } catch (err) {
      setError(err.response?.data?.mensaje || t('reassignTask.errorReassigning', 'Error al reasignar la tarea'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600">
            <UserCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('reassignTask.modalTitle', 'Reasignar Tarea')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tituloTraducido} (#{tarea.idTarea})
            </p>
          </div>
        </div>

        {/* Info operario actual */}
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
          <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('reassignTask.currentlyAssignedTo', 'Asignado actualmente a:')}</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {tarea.nombreTrabajador || t('reassignTask.unassigned', 'Sin asignar')}
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('reassignTask.newOperatorLabel', 'Nuevo Operario *')}
            </label>
            <select
              required
              value={nuevoIdAsignadoA}
              onChange={(e) => setNuevoIdAsignadoA(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="">{t('reassignTask.selectOperatorPlaceholder', '-- Seleccionar operario --')}</option>
              {trabajadores.map(trab => (
                <option key={trab.idUsuario} value={trab.idUsuario}>
                  {trab.nombreCompleto} ({trab.correo})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('reassignTask.reasonLabel', 'Motivo de la reasignación (Opcional)')}
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={t('reassignTask.reasonPlaceholder', 'Ej: Cambio de turno, sobrecarga de trabajo, especialización...')}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              disabled={enviando}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t('reassignTask.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-5 py-2 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {enviando ? t('reassignTask.reassigning', 'Reasignando...') : t('reassignTask.confirmButton', 'Confirmar Reasignación')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
