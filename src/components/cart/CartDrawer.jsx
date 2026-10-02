import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCarrito, actualizarCantidad, eliminarItem, vaciarCarrito } from '../../api/carritoApi'
import { useCart } from '../../context/CartContext'
import { X, ShoppingBag, Trash2, ArrowRight, Minus, Plus, CreditCard, Leaf } from 'lucide-react'

export default function CartDrawer() {
  const navigate = useNavigate()
  const { isCartOpen, closeCart, refreshCart, clearCart } = useCart()

  const [carrito, setCarrito] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actualizando, setActualizando] = useState(null)

  useEffect(() => {
    if (isCartOpen) {
      cargarCarrito()
    }
  }, [isCartOpen])

  const cargarCarrito = async () => {
    setLoading(true)
    try {
      const res = await getCarrito()
      setCarrito(res.data)
      if (res.data.totalItems === 0) clearCart()
      else refreshCart()
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
      if (res.data.totalItems === 0) clearCart()
      else refreshCart()
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
      if (res.data.totalItems === 0) clearCart()
      else refreshCart()
    } catch {
      setError('Error al eliminar producto')
      setTimeout(() => setError(''), 3000)
    } finally {
      setActualizando(null)
    }
  }

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  const estaVacio = !carrito?.items || carrito.items.length === 0

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl z-[101] transform transition-transform duration-500 ease-in-out flex flex-col border-l border-white/50 dark:border-slate-700/50 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 text-emerald-950 dark:text-white">
            <ShoppingBag className="text-green-600 dark:text-green-400" size={24} strokeWidth={2.5} />
            <h2 className="text-xl font-black tracking-tight">Tu Carrito</h2>
            {!estaVacio && (
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-black px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-800/50">
                {carrito.totalItems}
              </span>
            )}
          </div>
          <button 
            onClick={closeCart}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {error && (
            <div className="bg-red-50/90 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-bold mb-4 border border-red-200 dark:border-red-800/50 backdrop-blur-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 dark:border-green-400" />
            </div>
          ) : estaVacio ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-24 h-24 bg-green-50/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <ShoppingBag size={48} className="text-green-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-black text-emerald-950 dark:text-white">Tu carrito está vacío</h3>
              <p className="text-emerald-700/70 dark:text-slate-400 text-sm max-w-[250px] font-medium">
                Agrega plantas increíbles desde nuestro catálogo para darle vida a tu espacio.
              </p>
              <button 
                onClick={() => { closeCart(); navigate('/catalogo'); }}
                className="mt-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-transform active:scale-95"
              >
                <Leaf size={18} /> Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {carrito.items.map(item => (
                <div key={item.idItem} className="flex gap-4 p-4 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-white/80 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-20 h-24 bg-gradient-to-br from-green-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-xl overflow-hidden flex-shrink-0 border border-white dark:border-slate-600">
                    {item.imagenUrl ? (
                      <img src={item.imagenUrl} alt={item.nombreProducto} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Leaf className="text-green-300" size={24} /></div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-emerald-950 dark:text-white text-sm line-clamp-2 pr-2 leading-tight mb-1">{item.nombreProducto}</h4>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          ${item.precioUnitario?.toLocaleString('es-CO')}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleEliminar(item.idItem)}
                        disabled={actualizando === item.idItem}
                        className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 p-1 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                        <button 
                          onClick={() => handleCantidad(item.idItem, item.cantidad - 1)}
                          disabled={actualizando === item.idItem}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:text-green-600 disabled:opacity-50"
                        ><Minus size={14} strokeWidth={3} /></button>
                        <span className="text-xs font-black text-slate-800 dark:text-white w-6 text-center">
                          {actualizando === item.idItem ? '...' : item.cantidad}
                        </span>
                        <button 
                          onClick={() => handleCantidad(item.idItem, item.cantidad + 1)}
                          disabled={actualizando === item.idItem}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:text-green-600 disabled:opacity-50"
                        ><Plus size={14} strokeWidth={3} /></button>
                      </div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">
                        ${item.subtotal?.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!estaVacio && !loading && (
          <div className="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex justify-between items-end mb-6">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Subtotal</span>
              <span className="text-3xl font-black text-green-600 dark:text-green-400">
                ${carrito?.total?.toLocaleString('es-CO')}
              </span>
            </div>
            
            {/* Shiny Button */}
            <button
              onClick={handleCheckout}
              className="w-full relative group overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-500 
                         text-white font-black text-lg px-6 py-4 rounded-2xl shadow-xl shadow-green-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 w-1/4 h-full bg-white/30 skew-x-12 -translate-x-full group-hover:animate-[shine_1s_ease-in-out]" />
              <CreditCard size={22} strokeWidth={2.5} />
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </>
  )
}
