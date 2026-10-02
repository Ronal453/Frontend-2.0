import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCarrito,
  actualizarCantidad,
  eliminarItem,
  vaciarCarrito
} from '../api/carritoApi'
import { useCart } from '../context/CartContext'
import { ShoppingBag, Trash2, ArrowLeft, Plus, Minus, CreditCard, Leaf } from 'lucide-react'

export default function Cart() {
  const navigate = useNavigate()
  const { refreshCart, clearCart } = useCart()

  const [carrito,     setCarrito]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [actualizando,setActualizando]= useState(null)

  useEffect(() => {
    cargarCarrito()
  }, [])

  const cargarCarrito = async () => {
    setLoading(true)
    try {
      const res = await getCarrito()
      setCarrito(res.data)
      if (res.data.totalItems === 0) {
        clearCart()
      } else {
        refreshCart()
      }
    } catch {
      setError('No se pudo cargar el carrito')
      clearCart()
    } finally {
      setLoading(false)
    }
  }

  const handleCantidad = async (idItem, nuevaCantidad) => {
    if (nuevaCantidad < 0) return
    setActualizando(idItem)
    setError('')
    try {
      const res = await actualizarCantidad(idItem, nuevaCantidad)
      setCarrito(res.data)
      if (res.data.totalItems === 0) {
        clearCart()
      } else {
        refreshCart()
      }
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al actualizar cantidad')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActualizando(null)
    }
  }

  const handleEliminar = async (idItem) => {
    setActualizando(idItem)
    setError('')
    try {
      const res = await eliminarItem(idItem)
      setCarrito(res.data)
      if (res.data.totalItems === 0) {
        clearCart()
      } else {
        refreshCart()
      }
    } catch {
      setError('Error al eliminar el producto')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActualizando(null)
    }
  }

  const handleVaciar = async () => {
    if (!confirm('¿Estás seguro de vaciar tu carrito?')) return
    try {
      await vaciarCarrito()
      clearCart()
      await cargarCarrito()
    } catch {
      setError('Error al vaciar el carrito')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-32 min-h-[60vh] bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-100/50 dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-500 shadow-lg" />
    </div>
  )

  const estaVacio = !carrito?.items || carrito.items.length === 0

  if (estaVacio) return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-100/50 dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/20 flex flex-col items-center justify-center p-4 relative z-0 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-green-300/20 dark:bg-green-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-teal-300/20 dark:bg-teal-600/5 blur-[100px]" />
      </div>

      <div className="text-center py-20 px-8 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 rounded-3xl shadow-xl shadow-green-900/5 max-w-lg w-full relative z-10">
        <div className="w-24 h-24 bg-green-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShoppingBag className="text-green-400 dark:text-green-500/50" size={48} />
        </div>
        <h2 className="text-3xl font-black text-emerald-950 dark:text-white mb-3">
          Tu carrito está vacío
        </h2>
        <p className="text-emerald-700/70 dark:text-slate-400 mb-8 font-medium">
          Agrega plantas desde el catálogo para darle vida a este espacio.
        </p>
        <Link to="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600/90 dark:hover:bg-green-500 text-white px-8 py-3.5 rounded-2xl
                         font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-600/30">
          <Leaf size={20} strokeWidth={2.5} /> Ir al catálogo
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-100/50 dark:from-slate-900 dark:via-[#0F172A] dark:to-emerald-950/20 py-8 relative z-0 overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-green-300/20 dark:bg-green-600/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-teal-300/20 dark:bg-teal-600/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/60 dark:border-slate-700">
            <ShoppingBag className="text-green-600 dark:text-green-400" size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-emerald-950 dark:text-white tracking-tight drop-shadow-sm">
              Mi Carrito
            </h1>
            <p className="text-emerald-700/80 dark:text-slate-400 text-sm md:text-base mt-1 font-medium">
              Revisa tus plantas antes de proceder al pago.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50/90 dark:bg-red-900/40 backdrop-blur-md border border-red-200 dark:border-red-800/50
                          text-red-700 dark:text-red-300
                          rounded-2xl p-4 mb-6 text-sm font-bold shadow-sm animate-in fade-in">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="font-bold text-emerald-800/60 dark:text-slate-400 uppercase tracking-widest text-xs">
                {carrito.totalItems} producto(s) en tu bolsa
              </span>
              <button
                onClick={handleVaciar}
                className="text-sm font-bold text-red-500/80 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300
                           transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} /> Vaciar carrito
              </button>
            </div>

            <div className="space-y-4">
              {carrito.items.map(item => (
                <div key={item.idItem}
                     className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl
                                p-5 flex flex-col sm:flex-row gap-5 shadow-xl shadow-green-900/5 transition-all hover:shadow-green-900/10 dark:hover:shadow-green-900/20">

                  <div className="w-full sm:w-28 h-32 sm:h-28 bg-gradient-to-br from-green-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl
                                  overflow-hidden flex-shrink-0 flex items-center justify-center relative border border-white/50 dark:border-slate-700">
                    {item.imagenUrl
                      ? <img src={item.imagenUrl} alt={item.nombreProducto}
                             className="w-full h-full object-cover" />
                      : <Leaf className="text-green-300 dark:text-slate-600" size={32} />
                    }
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-lg text-emerald-950 dark:text-white leading-tight mb-1">
                        {item.nombreProducto}
                      </h3>
                      <p className="text-emerald-700/80 dark:text-emerald-400 font-bold text-sm">
                        ${item.precioUnitario?.toLocaleString('es-CO')} c/u
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 sm:mt-0">
                      
                      {/* Control de Cantidad */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleCantidad(item.idItem, item.cantidad - 1)}
                          disabled={actualizando === item.idItem}
                          className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm
                                     hover:text-green-600 dark:hover:text-green-400 hover:shadow-md disabled:opacity-50 transition-all active:scale-95"
                        ><Minus size={16} strokeWidth={3} /></button>

                        <span className="w-10 text-center font-black text-slate-800 dark:text-white">
                          {actualizando === item.idItem
                            ? <span className="inline-block w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            : item.cantidad}
                        </span>

                        <button
                          onClick={() => handleCantidad(item.idItem, item.cantidad + 1)}
                          disabled={actualizando === item.idItem}
                          className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm
                                     hover:text-green-600 dark:hover:text-green-400 hover:shadow-md disabled:opacity-50 transition-all active:scale-95"
                        ><Plus size={16} strokeWidth={3} /></button>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="font-black text-emerald-950 dark:text-white text-lg">
                          ${item.subtotal?.toLocaleString('es-CO')}
                        </p>
                        <button
                          onClick={() => handleEliminar(item.idItem)}
                          disabled={actualizando === item.idItem}
                          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400
                                     hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white disabled:opacity-50 transition-all shadow-sm"
                          title="Eliminar del carrito"
                        ><Trash2 size={18} strokeWidth={2.5} /></button>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Resumen Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-3xl
                            p-6 shadow-xl shadow-green-900/5 sticky top-24">
              <h2 className="font-black text-emerald-950 dark:text-white text-xl mb-6 flex items-center gap-2">
                Resumen de Compra
              </h2>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {carrito.items.map(item => (
                  <div key={item.idItem} className="flex justify-between font-medium items-start gap-4">
                    <span className="truncate">
                      {item.cantidad}x {item.nombreProducto}
                    </span>
                    <span className="flex-shrink-0 font-bold text-slate-800 dark:text-slate-300">
                      ${item.subtotal?.toLocaleString('es-CO')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 pt-5 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm">Total a pagar</span>
                  <span className="font-black text-3xl text-green-600 dark:text-green-400">
                    ${carrito.total?.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              {/* Botón Mejorado Brillante */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full relative group overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-500 
                           text-white font-black text-lg px-6 py-4 rounded-2xl shadow-xl shadow-green-600/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                {/* Destello de luz animado */}
                <div className="absolute inset-0 w-1/4 h-full bg-white/30 skew-x-12 -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
                <CreditCard size={22} strokeWidth={2.5} />
                Proceder al Pago
              </button>

              <Link to="/catalogo"
                    className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 mt-5 transition-colors">
                <ArrowLeft size={16} /> Seguir explorando plantas
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}