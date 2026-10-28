import api from './axios'

// ═══════════════════════════════════════════════════════════════
// INVENTARIO DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════

export const getProductosAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.nombre)      params.set('nombre',      filtros.nombre)
  if (filtros.idCategoria) params.set('idCategoria', filtros.idCategoria)
  if (filtros.activo !== undefined && filtros.activo !== '') params.set('activo', filtros.activo)
  params.set('page', filtros.page  ?? 0)
  params.set('size', filtros.size  ?? 20)
  params.set('sort', filtros.sort  ?? 'nombreProducto')
  return api.get(`/admin/productos?${params}`)
}

export const crearProducto = (datos) => api.post('/admin/productos', datos)

export const actualizarProducto = (id, datos) => api.put(`/admin/productos/${id}`, datos)

export const activarProducto = (id) => api.patch(`/admin/productos/${id}/activar`)

export const desactivarProducto = (id) => api.patch(`/admin/productos/${id}/desactivar`)

/** Productos activos en stock crítico */
export const getProductosStockCritico = () => api.get('/admin/productos/stock-critico')


// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE PEDIDOS
// ═══════════════════════════════════════════════════════════════

export const getPedidosAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.estado) params.set('estado', filtros.estado)
  params.set('page', filtros.page ?? 0)
  params.set('size', filtros.size ?? 20)
  return api.get(`/admin/pedidos?${params}`)
}

export const actualizarEstadoPedido = (id, nuevoEstado) =>
  api.patch(`/admin/pedidos/${id}/estado`, { nuevoEstado })


// ═══════════════════════════════════════════════════════════════
// REPORTES / DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const getReporte = (fechaInicio, fechaFin) => {
  const params = new URLSearchParams()
  if (fechaInicio) params.set('fechaInicio', fechaInicio)
  if (fechaFin) params.set('fechaFin', fechaFin)
  return api.get(`/admin/reportes?${params.toString()}`)
}

/** [NUEVO] Exportar pedidos a CSV con filtro opcional de rango de fechas */
export const exportarReporteCSV = (fechaInicio, fechaFin) => {
  const params = new URLSearchParams()
  if (fechaInicio) params.set('fechaInicio', fechaInicio)
  if (fechaFin)    params.set('fechaFin', fechaFin)
  return api.get(`/admin/reportes/exportar-csv?${params}`, { responseType: 'blob' })
}


// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE USUARIOS 
// ═══════════════════════════════════════════════════════════════

export const getUsuariosAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.nombre) params.set('nombre', filtros.nombre)
  if (filtros.idRol)  params.set('idRol', filtros.idRol)
  if (filtros.activo !== undefined && filtros.activo !== '') {
    params.set('activo', filtros.activo)
  }
  params.set('page', filtros.page ?? 0)
  params.set('size', filtros.size ?? 20)
  return api.get(`/admin/usuarios?${params}`)
}

export const activarUsuario = (id) => api.patch(`/admin/usuarios/${id}/activar`)

export const desactivarUsuario = (id) => api.patch(`/admin/usuarios/${id}/desactivar`)

export const resetearPasswordUsuario = (id) => api.post(`/admin/usuarios/${id}/resetear-password`)

/** Crea una cuenta con rol TRABAJADOR. datos = { nombreCompleto, correo, passwordInicial } */
export const crearTrabajador = (datos) =>
  api.post('/admin/usuarios/trabajadores', datos)

// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE ZONAS
// ═══════════════════════════════════════════════════════════════

export const getZonasAdmin = () => api.get('/admin/zonas')
export const crearZona = (datos) => api.post('/admin/zonas', datos)
export const actualizarZona = (id, datos) => api.put(`/admin/zonas/${id}`, datos)
export const activarZona = (id) => api.patch(`/admin/zonas/${id}/activar`)
export const desactivarZona = (id) => api.patch(`/admin/zonas/${id}/desactivar`)

// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE LOTES
// ═══════════════════════════════════════════════════════════════

export const crearLote = (datos) => api.post('/admin/lotes', datos)
export const vincularLote = (id, datos) => api.post(`/admin/lotes/${id}/vincular`, datos)

export const getZonaDetalleAdmin = (id) => api.get('/zonas/' + id + '/detalle')

// ════════════════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE PROVEEDORES
// ════════════════════════════════════════════════════════════════════════════════════════

export const getProveedoresAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.nombre) params.set('nombre', filtros.nombre)
  if (filtros.tipoInsumo) params.set('tipoInsumo', filtros.tipoInsumo)
  if (filtros.activo !== undefined && filtros.activo !== '') params.set('activo', filtros.activo)
  params.set('page', filtros.page ?? 0)
  params.set('size', filtros.size ?? 20)
  return api.get(`/admin/proveedores?${params}`)
}
export const getProveedorPorId = (id) => api.get(`/admin/proveedores/${id}`)
export const crearProveedor = (datos) => api.post('/admin/proveedores', datos)
export const actualizarProveedor = (id, datos) => api.put(`/admin/proveedores/${id}`, datos)
export const activarProveedor = (id) => api.patch(`/admin/proveedores/${id}/activar`)
export const desactivarProveedor = (id) => api.patch(`/admin/proveedores/${id}/desactivar`)
export const getReporteProveedor = () => api.get(`/admin/proveedores/reporte`)

export const asignarProveedorLote = (id, datos) => api.patch(`/admin/lotes/${id}/proveedor`, datos)

// ════════════════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE BACKUP
// ════════════════════════════════════════════════════════════════════════════════════════

export const generarBackup = () => api.get('/admin/backup/generar', { responseType: 'blob' })
export const getResumenBackup = () => api.get('/admin/backup/resumen')
export const restaurarBackup = (archivo) => {
  const fd = new FormData()
  fd.append('archivo', archivo)
  return api.post('/admin/backup/restaurar', fd, { 
    timeout: 300000,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ════════════════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE TAREAS Y KANBAN OPERATIVO (ADMIN)
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene la lista de tareas con filtros avanzados para el panel administrativo.
 * Permite filtrar por estado, trabajador asignado, tipo, prioridad, lote, zona o vencimiento.
 *
 * @param {Object} filtros - Criterios opcionales de búsqueda
 * @returns {Promise} Respuesta HTTP con la lista de tareas
 */
export const getTareasAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.estado)       params.set('estado', filtros.estado)
  if (filtros.idAsignadoA)  params.set('idAsignadoA', filtros.idAsignadoA)
  if (filtros.tipo)         params.set('tipo', filtros.tipo)
  if (filtros.prioridad)    params.set('prioridad', filtros.prioridad)
  if (filtros.idLote)       params.set('idLote', filtros.idLote)
  if (filtros.idZona)       params.set('idZona', filtros.idZona)
  if (filtros.soloVencidas) params.set('soloVencidas', filtros.soloVencidas)
  return api.get(`/admin/tareas?${params}`)
}

/**
 * Crea una nueva tarea puntual desde el panel de administración (HU22).
 *
 * @param {Object} datos - Datos de la tarea a registrar
 * @returns {Promise} Tarea creada
 */
export const crearTareaAdmin = (datos) => api.post('/admin/tareas', datos)

/**
 * Registra una regla de tarea recurrente y opcionalmente su primera instancia inmediata (HU23).
 *
 * @param {Object} datos - Datos de la tarea recurrente
 * @returns {Promise} Tarea inicial creada
 */
export const crearTareaConRecurrencia = (datos) => api.post('/admin/tareas-recurrentes', datos)

/**
 * Reasigna una tarea existente a un operario diferente (HU30).
 * Registra auditoría automática de la reasignación en el historial.
 *
 * @param {number|string} id - ID de la tarea
 * @param {Object} datos - { nuevoIdAsignadoA, motivo }
 * @returns {Promise} Tarea actualizada
 */
export const reasignarTareaAdmin = (id, datos) => api.patch(`/admin/tareas/${id}/reasignar`, datos)

/**
 * Obtiene el resumen consolidado de métricas operativas de vivero para HU29.
 * Incluye KPIs de tareas activas, vencidas, completadas, desglose por estado y carga por operario.
 *
 * @param {string} [fechaInicio] - Fecha inicio formato YYYY-MM-DD
 * @param {string} [fechaFin] - Fecha fin formato YYYY-MM-DD
 * @returns {Promise} Métricas operativas
 */
export const getResumenTareas = (fechaInicio, fechaFin) => {
  const params = new URLSearchParams()
  if (fechaInicio) params.set('fechaInicio', fechaInicio)
  if (fechaFin)    params.set('fechaFin', fechaFin)
  return api.get(`/admin/tareas/resumen?${params}`)
}

/**
 * Obtiene la lista simplificada de operarios activos (Rol TRABAJADOR = 2) disponibles para asignación.
 *
 * @returns {Promise} Lista de trabajadores { idUsuario, nombreCompleto, correo }
 */
export const getTrabajadoresActivos = () => api.get('/admin/tareas/trabajadores')

/**
 * Ejecuta manualmente el proceso de detección y notificación por correo de tareas vencidas (HU28).
 *
 * @returns {Promise} Resultado del proceso con total de alertas enviadas
 */
export const procesarAlertasVencidas = () => api.post('/admin/tareas/procesar-alertas-vencidas')

// ════════════════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE TAREAS RECURRENTES (ADMIN - HU23)
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * Lista las reglas de tareas recurrentes programadas en el vivero.
 *
 * @param {boolean} [soloActivas=false] - Si es true, solo trae reglas activas
 * @returns {Promise} Lista de tareas recurrentes
 */
export const getTareasRecurrentes = (soloActivas = false) => {
  const params = new URLSearchParams()
  if (soloActivas) params.set('soloActivas', 'true')
  return api.get(`/admin/tareas-recurrentes?${params}`)
}

/**
 * Crea una nueva regla de tarea recurrente.
 *
 * @param {Object} datos - Parámetros de la recurrencia
 * @returns {Promise} Regla creada
 */
export const crearTareaRecurrente = (datos) => api.post('/admin/tareas-recurrentes', datos)

/**
 * Actualiza la configuración de una regla de tarea recurrente existente.
 *
 * @param {number|string} id - ID de la tarea recurrente
 * @param {Object} datos - Nuevos parámetros de la recurrencia
 * @returns {Promise} Regla actualizada
 */
export const actualizarTareaRecurrente = (id, datos) => api.put(`/admin/tareas-recurrentes/${id}`, datos)

/**
 * Reactiva una regla de tarea recurrente que estaba pausada.
 *
 * @param {number|string} id - ID de la tarea recurrente
 * @returns {Promise} Regla actualizada
 */
export const activarTareaRecurrente = (id) => api.patch(`/admin/tareas-recurrentes/${id}/activar`)

/**
 * Pausa una regla de tarea recurrente para que no genere más instancias automáticas.
 *
 * @param {number|string} id - ID de la tarea recurrente
 * @returns {Promise} Regla actualizada
 */
export const pausarTareaRecurrente = (id) => api.patch(`/admin/tareas-recurrentes/${id}/pausar`)

/**
 * Dispara de forma manual la generación de instancias pendientes para hoy de todas las reglas activas.
 *
 * @returns {Promise} Resultado con cantidad de instancias generadas
 */
export const generarInstanciasRecurrentes = () => api.post('/admin/tareas-recurrentes/generar-pendientes')

// ════════════════════════════════════════════════════════════════════════════════════════
// MONITOR Y LOGS DEL SISTEMA (ADMIN)
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * Consulta los registros de actividad, auditoría en base de datos y eventos internos del sistema.
 * Permite filtrar por texto libre, módulo funcional, nivel de severidad, origen y límite de filas.
 *
 * @param {Object} [filtros={}] - Criterios opcionales de filtrado
 * @returns {Promise} Respuesta HTTP con KPIs y listado cronológico de logs
 */
export const getLogsSistema = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.busqueda) params.set('busqueda', filtros.busqueda)
  if (filtros.modulo)   params.set('modulo', filtros.modulo)
  if (filtros.nivel)    params.set('nivel', filtros.nivel)
  if (filtros.origen)   params.set('origen', filtros.origen)
  params.set('limite', filtros.limite ?? 300)
  return api.get(`/admin/logs?${params}`)
}

/**
 * Limpia el buffer de eventos transitorios en memoria del servidor conservando intacta
 * la auditoría histórica de la base de datos.
 *
 * @returns {Promise} Confirmación de limpieza
 */
export const limpiarLogsMemoria = () => api.delete('/admin/logs/memoria')
