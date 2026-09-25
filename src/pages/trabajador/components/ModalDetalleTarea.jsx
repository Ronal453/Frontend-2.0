import React from 'react'

const PRIORIDAD_COLORS = {
  ALTA: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50',
  MEDIA: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
  BAJA: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
}

export default function ModalDetalleTarea({
  abierto,
  tarea,
  comentarios,
  historial,
  nuevoComentario,
  enviandoComentario,
  onClose,
  onChangeComentario,
  onSubmitComentario
}) {
  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
        {/* Cabecera Modal */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {tarea?.tipoTarea}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${PRIORIDAD_COLORS[tarea?.prioridad] || ''}`}>
                {tarea?.prioridad}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                {tarea?.estadoTarea}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              ID Tarea: #{tarea?.idTarea} • Fecha límite: {tarea?.fechaLimite || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/60 p-4 rounded-xl text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Objetivo / Ubicación:</span>
              <strong className="text-gray-800 dark:text-gray-200 text-sm">
                {tarea?.nombreZona ? `Zona: ${tarea.nombreZona}` : `Lote: ${tarea?.codigoLote} (${tarea?.especieLote || ''})`}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Trabajador Asignado:</span>
              <strong className="text-gray-800 dark:text-gray-200 text-sm">
                {tarea?.nombreTrabajador || 'Sin asignar (Backlog)'}
              </strong>
            </div>
          </div>

          {/* Comentarios del equipo */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              💬 Comentarios y Notas Operativas ({comentarios.length})
            </h4>

            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {comentarios.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No hay comentarios en esta tarea aún.</p>
              ) : (
                comentarios.map(c => (
                  <div key={c.idComentario} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs border border-gray-100 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-700 dark:text-gray-200">{c.nombreUsuario || 'Usuario'}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-400">{c.fechaCreacion}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{c.comentario}</p>
                  </div>
                ))
              )}
            </div>

            {/* Formulario nuevo comentario */}
            <form onSubmit={onSubmitComentario} className="flex gap-2">
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => onChangeComentario(e.target.value)}
                placeholder="Escribe una observación operativa..."
                className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={enviandoComentario || !nuevoComentario.trim()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Comentar
              </button>
            </form>
          </div>

          {/* Historial de Auditoría */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              🕒 Historial de Transiciones
            </h4>
            <div className="space-y-2 text-xs">
              {historial.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sin transiciones registradas.</p>
              ) : (
                historial.map(h => (
                  <div key={h.idHistorialTarea} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                    <div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{h.nombreUsuario || 'Operador'}: </span>
                      <span className="text-gray-500 dark:text-gray-400">{h.estadoAnterior || 'Inicio'} → </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{h.estadoNuevo}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-400">{h.fechaCambio}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
