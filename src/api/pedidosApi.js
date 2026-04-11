import api from './axios'

/**
 * Procesar el checkout del carrito activo
 * POST /api/pedidos/checkout
 * @param {number} idMetodoPago  — 1=TARJETA_CREDITO, 2=TARJETA_DEBITO, 3=TRANSFERENCIA, 4=EFECTIVO
 * @param {string} direccionEnvio
 * @returns PedidoResponse con pedido creado
 */
export const checkout = (idMetodoPago, direccionEnvio) =>
  api.post('/pedidos/checkout', { idMetodoPago, direccionEnvio })

/**
 * Obtener el historial de pedidos del usuario autenticado
 * GET /api/pedidos
 * @returns PedidoResponse[] ordenados del más reciente al más antiguo
 */
export const getHistorial = () =>
  api.get('/pedidos')

/**
 * Obtener el detalle de un pedido específico
 * GET /api/pedidos/{id}
 * Solo puedes ver tus propios pedidos
 * @param {number} id
 * @returns PedidoResponse con detalles y pago
 */
export const getDetallePedido = (id) =>
  api.get(`/pedidos/${id}`)