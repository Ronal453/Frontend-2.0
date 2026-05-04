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
  // Número total de ítems en el carrito para mostrar en el badge del navbar
  const [totalItems, setTotalItems] = useState(0)

  /**
   * Recarga el contador del carrito desde el backend.
   * Llama a GET /api/carrito y actualiza totalItems con el valor de la respuesta.
   * Si el carrito no existe o está vacío, pone totalItems en 0.
   * useCallback evita recrear la función en cada render.
   */
  const refreshCart = useCallback(async () => {
    try {
      const res = await getCarrito()
      // Usar totalItems de la respuesta, con fallback a 0
      setTotalItems(res.data.totalItems ?? 0)
    } catch {
      // Si falla (carrito no existe, error de red, etc.) → mostrar 0
      setTotalItems(0)
    }
  }, [])

  /**
   * Limpia el contador del carrito sin llamar al backend.
   * Se usa después del checkout exitoso para que el badge desaparezca
   * inmediatamente sin esperar una llamada a la API.
   * useCallback evita recrear la función en cada render.
   */
  const clearCart = useCallback(() => setTotalItems(0), [])

  return (
    <CartContext.Provider value={{ totalItems, refreshCart, clearCart }}>
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