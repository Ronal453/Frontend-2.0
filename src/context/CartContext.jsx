import { createContext, useState, useContext, useCallback } from 'react'
import { getCarrito } from '../api/carritoApi'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [totalItems, setTotalItems] = useState(0)

  const refreshCart = useCallback(async () => {
    try {
      const res = await getCarrito()
      setTotalItems(res.data.totalItems ?? 0)
    } catch {
      setTotalItems(0)
    }
  }, [])

  const clearCart = useCallback(() => setTotalItems(0), [])

  return (
    <CartContext.Provider value={{ totalItems, refreshCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}