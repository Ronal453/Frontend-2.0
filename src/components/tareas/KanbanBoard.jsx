import React, { useState } from 'react'
import {
  COLUMNAS_KANBAN,
  esTransicionValida
} from './tareasConstantes'
import TarjetaTarea from './TarjetaTarea'
import { AlertCircle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

/**
 * Tablero Kanban principal con soporte nativo de HTML5 Drag and Drop e internacionalización.
 * Renderiza las 5 columnas estándar, valida transiciones de estado en caliente,
 * y controla permisos de operario vs administrador.
 *
 * @component
 * @param {Object} props
 * @param {Array} props.tareas - Lista de tareas a posicionar
 * @param {boolean} props.esAdmin - Si el usuario actual tiene permisos administrativos
 * @param {Object} props.usuarioActual - Objeto de usuario autenticado { email, rol }
 * @param {Function} props.onCambiarEstado - Callback al solicitar transición (tarea, nuevoEstado)
 * @param {Function} props.onVerDetalle - Callback al abrir modal de detalle
 * @param {Function} [props.onReasignar] - Callback de reasignación (Admin)
 * @returns {JSX.Element}
 */
export default function KanbanBoard({
  tareas = [],
  esAdmin = false,
  usuarioActual,
  onCambiarEstado,
  onVerDetalle,
  onReasignar
}) {
  const { t } = useLanguage()
  const [columnaHover, setColumnaHover] = useState(null)
  const [errorTransicion, setErrorTransicion] = useState('')

  // Determinar si una tarea pertenece al usuario logueado o si es admin
  const puedeMoverTarea = (tarea) => {
    if (esAdmin) return true
    if (!usuarioActual?.email || !tarea.emailTrabajador) return false
    return usuarioActual.email.toLowerCase() === tarea.emailTrabajador.toLowerCase()
  }

  // Manejadores de Drag & Drop sobre las columnas
  const handleDragOver = (e, columnaId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (columnaHover !== columnaId) {
      setColumnaHover(columnaId)
    }
  }

  const handleDragLeave = (e, columnaId) => {
    if (columnaHover === columnaId) {
      setColumnaHover(null)
    }
  }

  const handleDrop = (e, columnaDestinoId) => {
    e.preventDefault()
    setColumnaHover(null)
    setErrorTransicion('')

    const dataRaw = e.dataTransfer.getData('application/json')
    if (!dataRaw) return

    try {
      const tarea = JSON.parse(dataRaw)
      if (tarea.estadoTarea === columnaDestinoId) return

      // Verificar si el usuario puede moverla
      if (!puedeMoverTarea(tarea)) {
        setErrorTransicion(t('kanban.noPermissionToMove'))
        setTimeout(() => setErrorTransicion(''), 5000)
        return
      }

      // Validar máquina de estados estricta (HU25, HU26)
      if (!esTransicionValida(tarea.estadoTarea, columnaDestinoId)) {
        setErrorTransicion(
          t('kanban.invalidTransition', {
            from: t('taskStatus.' + tarea.estadoTarea, tarea.estadoTarea.replace('_', ' ')),
            to: t('taskStatus.' + columnaDestinoId, columnaDestinoId.replace('_', ' '))
          })
        )
        setTimeout(() => setErrorTransicion(''), 5000)
        return
      }

      // Disparar cambio de estado
      onCambiarEstado(tarea, columnaDestinoId)
    } catch (err) {
      console.error('Error al procesar drop en Kanban', err)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Alerta flotante de transición inválida */}
      {errorTransicion && (
        <div className="p-3 bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{errorTransicion}</span>
          </div>
          <button
            onClick={() => setErrorTransicion('')}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid de 5 Columnas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1 items-start overflow-x-auto pb-4">
        {COLUMNAS_KANBAN.map((columna) => {
          const IconoColumna = columna.icono
          const tareasColumna = tareas.filter(t => t.estadoTarea === columna.id)
          const esDropActivo = columnaHover === columna.id

          return (
            <div
              key={columna.id}
              onDragOver={(e) => handleDragOver(e, columna.id)}
              onDragLeave={(e) => handleDragLeave(e, columna.id)}
              onDrop={(e) => handleDrop(e, columna.id)}
              className={`flex flex-col bg-slate-100/60 dark:bg-slate-900/40 rounded-3xl p-3 border transition-all duration-200 min-h-[500px]
                ${esDropActivo ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-50/20 dark:bg-teal-950/20' : columna.colorBorde}
              `}
            >
              {/* Cabecera de Columna */}
              <div className={`flex items-center justify-between p-3 rounded-2xl mb-3 shadow-xs ${columna.colorHeader}`}>
                <div className="flex items-center gap-2">
                  <IconoColumna size={16} className="flex-shrink-0" />
                  <span className="text-xs font-black tracking-tight uppercase">
                    {t('taskStatus.' + columna.id, columna.titulo)}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${columna.colorBadge}`}>
                  {tareasColumna.length}
                </span>
              </div>

              {/* Contenedor de Tarjetas de la Columna */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
                {tareasColumna.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {t('kanban.noTasksInPhase')}
                    </p>
                  </div>
                ) : (
                  tareasColumna.map((tarea) => (
                    <TarjetaTarea
                      key={tarea.idTarea}
                      tarea={tarea}
                      puedeMover={puedeMoverTarea(tarea)}
                      esAdmin={esAdmin}
                      onVerDetalle={onVerDetalle}
                      onCambiarEstado={onCambiarEstado}
                      onReasignar={onReasignar}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
