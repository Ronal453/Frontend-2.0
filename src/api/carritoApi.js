import api from './axios'

/**
 * Ver el carrito activo del usuario autenticado
 * GET /api/carrito
 * @returns CarritoResponse { idCarrito, estado, items[], totalItems, total }
 */
export const getCarrito = () =>
  api.get('/carrito')

/**
 * Agregar un producto al carrito
 * POST /api/carrito/items
 * @param {number} idProducto
 * @param {number} cantidad
 * @returns CarritoResponse actualizado
 */
export const agregarItem = (idProducto, cantidad) =>
  api.post('/carrito/items', { idProducto, cantidad })

/**
 * Actualizar la cantidad de un ítem del carrito
 * PUT /api/carrito/items/{idItem}
 * Si cantidad = 0, el ítem se elimina automáticamente
 * @param {number} idItem
 * @param {number} cantidad
 * @returns CarritoResponse actualizado
 */
export const actualizarCantidad = (idItem, cantidad) =>
  api.put(`/carrito/items/${idItem}`, { cantidad })

/**
 * Eliminar un ítem del carrito
 * DELETE /api/carrito/items/{idItem}
 * @param {number} idItem
 * @returns CarritoResponse actualizado
 */
export const eliminarItem = (idItem) =>
  api.delete(`/carrito/items/${idItem}`)

/**
 * Vaciar completamente el carrito
 * DELETE /api/carrito
 * @returns 204 No Content
 */
export const vaciarCarrito = () =>
  api.delete('/carrito')
