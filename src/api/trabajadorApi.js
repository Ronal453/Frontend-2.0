import api from './axios'

// ═══════════════════════════════════════════════════════════════
// TAREAS KANBAN
// ═══════════════════════════════════════════════════════════════

export const getTareas = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.soloMias !== undefined) params.set('soloMias', filtros.soloMias)
  if (filtros.estado) params.set('estado', filtros.estado)
  if (filtros.prioridad) params.set('prioridad', filtros.prioridad)
  return api.get(`/tareas?${params}`)
}

export const getDetalleTarea = (id) => api.get(`/tareas/${id}`)

export const cambiarEstadoTarea = (id, nuevoEstado, comentario = '') =>
  api.patch(`/tareas/${id}/estado`, { nuevoEstado, comentario })

export const agregarComentarioTarea = (id, comentario) =>
  api.post(`/tareas/${id}/comentarios`, { comentario })

export const getComentariosTarea = (id) => api.get(`/tareas/${id}/comentarios`)

export const getHistorialTarea = (id) => api.get(`/tareas/${id}/historial`)


// ═══════════════════════════════════════════════════════════════
// LOTES DE PRODUCCIÓN
// ═══════════════════════════════════════════════════════════════

export const getLotes = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.idZona) params.set('idZona', filtros.idZona)
  if (filtros.estado) params.set('estado', filtros.estado)
  params.set('page', filtros.page ?? 0)
  params.set('size', filtros.size ?? 15)
  return api.get(`/lotes?${params}`)
}

export const getDetalleLote = (id) => api.get(`/lotes/${id}`)

export const cambiarEstadoLote = (id, nuevoEstado, observaciones = '') =>
  api.patch(`/lotes/${id}/estado`, { nuevoEstado, observaciones })

export const getHistorialLote = (id) => api.get(`/lotes/${id}/historial`)


// ═══════════════════════════════════════════════════════════════
// MERMAS Y PÉRDIDAS
// ═══════════════════════════════════════════════════════════════

export const getCausasMerma = () => api.get('/mermas/causas')

export const registrarMerma = (datos) => api.post('/mermas', datos)

export const getMermasRecientes = (limite = 20) => api.get(`/mermas?limite=${limite}`)


// ═══════════════════════════════════════════════════════════════
// ZONAS E INVERNADEROS
// ═══════════════════════════════════════════════════════════════

export const getZonas = () => api.get('/zonas')
export const getZonasOcupacion = () => api.get('/zonas/ocupacion')
export const getZonaDetalle = (id) => api.get(`/zonas/${id}/detalle`)

