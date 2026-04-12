import api from './axios'

/**
 * Listar productos con filtros opcionales
 * GET /api/productos
 * @param {Object} filtros - { nombre, idCategoria, idTipo, precioMin, precioMax, page, size, sort }
 * @returns Page<ProductoResponse>
 */
export const getProductos = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.nombre)      params.set('nombre',      filtros.nombre)
  if (filtros.idCategoria) params.set('idCategoria', filtros.idCategoria)
  if (filtros.idTipo)      params.set('idTipo',      filtros.idTipo)
  if (filtros.precioMin)   params.set('precioMin',   filtros.precioMin)
  if (filtros.precioMax)   params.set('precioMax',   filtros.precioMax)
  params.set('page', filtros.page ?? 0)
  params.set('size', filtros.size ?? 12)
  params.set('sort', filtros.sort ?? 'precio')
  return api.get(`/productos?${params}`)
}

/**
 * Obtener detalle de un producto
 * GET /api/productos/{id}
 * @returns ProductoResponse
 */
export const getProducto = (id) =>
  api.get(`/productos/${id}`)

/**
 * Listar todas las categorías disponibles
 * GET /api/productos/categorias
 * @returns CategoriaResponse[]
 */
export const getCategorias = () =>
  api.get('/productos/categorias')

export const getTipos = () =>
  api.get('/productos/tipos')