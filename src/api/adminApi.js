import api from './axios'

// ═══════════════════════════════════════════════════════════════
// INVENTARIO DE PRODUCTOS
// ═══════════════════════════════════════════════════════════════

export const getProductosAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.nombre)      params.set('nombre',      filtros.nombre)
  if (filtros.idCategoria) params.set('idCategoria', filtros.idCategoria)
  if (filtros.idTipo)      params.set('idTipo',      filtros.idTipo)
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

export const getReporte = () => api.get('/admin/reportes')

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