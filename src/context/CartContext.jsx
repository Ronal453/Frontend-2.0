import { createContext, useState, useContext, useCallback } from 'react'
import { getCarrito } from '../api/carritoApi'

/**
 * Contexto global del carrito de compras.
 *
 * Provee:
 *   - totalItems: número de ítems en el carrito (para el badge del navbar)
 *   - refreshCart(): recarga el contador desde el backend
 *   - clearCart(): pone el contador en 0 sin llamar al backend
 *
 * FIXES:
 *   - clearCart() pone totalItems en 0 inmediatamente (para después del checkout)
 *   - refreshCart() solo se llama explícitamente (no automáticamente en Navbar)
 *   - Si el carrito está CONVERTIDO o no existe, el backend devuelve 0 ítems
 *     o un carrito vacío, así que refreshCart() también funcionaría.
 *     Pero clearCart() es más rápido y confiable para el caso del checkout.
 *
 * Ruta destino: From/src/context/CartContext.jsx
 */
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [totalItems, setTotalItems] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const refreshCart = useCallback(async () => {
    try {
      const res = await getCarrito()
      setTotalItems(res.data.totalItems ?? 0)
    } catch {
      setTotalItems(0)
    }
  }, [])

  const clearCart = useCallback(() => setTotalItems(0), [])
  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  return (
    <CartContext.Provider value={{ totalItems, refreshCart, clearCart, isCartOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  )
}

/**
 * Hook para acceder al contexto del carrito desde cualquier componente.
 * Uso: const { totalItems, refreshCart, clearCart } = useCart()
 */
export function useCart() {
  return useContext(CartContext)
}