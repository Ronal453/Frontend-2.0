import api from './axios'

// ═══════════════════════════════════════════════════════════════
// API DE ADMINISTRACIÓN — INVENTARIO DE PRODUCTOS
// Todos los endpoints requieren token JWT con rol ADMINISTRADOR
// ═══════════════════════════════════════════════════════════════

/**
 * Listar todos los productos (activos + inactivos) — solo admin
 * GET /api/admin/productos
 * @param {Object} filtros - { nombre, idCategoria, idTipo, page, size, sort }
 */
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

/**
 * Crear un nuevo producto
 * POST /api/admin/productos
 * @param {Object} datos - campos del producto (ver ProductoAdminRequest)
 */
export const crearProducto = (datos) =>
  api.post('/admin/productos', datos)

/**
 * Actualizar un producto existente
 * PUT /api/admin/productos/{id}
 * @param {number} id    - ID del producto a actualizar
 * @param {Object} datos - campos a actualizar
 */
export const actualizarProducto = (id, datos) =>
  api.put(`/admin/productos/${id}`, datos)

/**
 * Activar un producto (visible en catálogo público)
 * PATCH /api/admin/productos/{id}/activar
 */
export const activarProducto = (id) =>
  api.patch(`/admin/productos/${id}/activar`)

/**
 * Desactivar un producto (oculto del catálogo público)
 * PATCH /api/admin/productos/{id}/desactivar
 */
export const desactivarProducto = (id) =>
  api.patch(`/admin/productos/${id}/desactivar`)


// ═══════════════════════════════════════════════════════════════
// API DE ADMINISTRACIÓN — GESTIÓN DE PEDIDOS
// ═══════════════════════════════════════════════════════════════

/**
 * Listar todos los pedidos del sistema — solo admin
 * GET /api/admin/pedidos
 * @param {Object} filtros - { estado, page, size }
 */
export const getPedidosAdmin = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.estado) params.set('estado', filtros.estado)
  params.set('page', filtros.page ?? 0)
  params.set('size', filtros.size ?? 20)
  return api.get(`/admin/pedidos?${params}`)
}

/**
 * Actualizar el estado de un pedido
 * PATCH /api/admin/pedidos/{id}/estado
 * @param {number} id          - ID del pedido
 * @param {string} nuevoEstado - "PREPARANDO" | "ENVIADO" | "ENTREGADO" | "CANCELADO"
 */
export const actualizarEstadoPedido = (id, nuevoEstado) =>
  api.patch(`/admin/pedidos/${id}/estado`, { nuevoEstado })


// ═══════════════════════════════════════════════════════════════
// API DE ADMINISTRACIÓN — REPORTES / DASHBOARD
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener todas las métricas del dashboard
 * GET /api/admin/reportes
 * @returns ReporteResponse con KPIs, estados y top productos
 */
export const getReporte = () =>
  api.get('/admin/reportes')