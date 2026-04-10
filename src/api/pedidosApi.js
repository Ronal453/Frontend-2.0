import api from './axios'

export const checkout = (data) =>
  api.post('/pedidos/checkout', data)

export const getHistorial = () =>
  api.get('/pedidos')

export const getDetallePedido = (id) =>
  api.get(`/pedidos/${id}`)

export const getMetodosPago = () =>
  api.get('/pedidos/metodos-pago')
