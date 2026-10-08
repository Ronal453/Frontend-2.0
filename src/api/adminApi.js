import api from './axios'

// ═══════════════════════════════════════════════════════════════
// INVENTARIO DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════

export const getProductosAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.nombre)      params.set('nombre',      filtros.nombre)
  if (filtros.idCategoria) params.set('idCategoria', filtros.idCategoria)
  if (filtros.idTipo)      params.set('idTipo',      filtros.idTipo)
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
