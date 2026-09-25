import React from 'react'

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
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-150">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
          Confirmar Cambio de Estado
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Moviendo tarea <strong className="text-gray-700 dark:text-gray-200">{tarea?.tipoTarea}</strong> al estado:{' '}
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{nuevoEstado}</span>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Comentario u Observación (Opcional)
            </label>
            <textarea
              rows="3"
              value={comentario}
              onChange={(e) => onChangeComentario(e.target.value)}
              placeholder="Ej: Se aplicaron 5L de fertilizante orgánico según protocolo..."
              className="w-full text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {enviando ? 'Guardando...' : 'Confirmar Avance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
