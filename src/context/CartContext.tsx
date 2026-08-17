"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react"

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
  codAvailable: boolean
  color?: string
}

interface CartContextType {
  items: CartItem[]

  addItem: (
    item: CartItem
  ) => void

  removeItem: (
    productId: string,
    color?: string
  ) => void

  updateQuantity: (
    productId: string,
    quantity: number,
    color?: string
  ) => void

  clearCart: () => void

  totalItems: number

  totalPrice: number
}

const CartContext =
  createContext<
    CartContextType | undefined
  >(undefined)

const CART_STORAGE_KEY =
  "ah-store-cart"

export function CartProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [items, setItems] =
    useState<CartItem[]>([])

  const [isLoaded, setIsLoaded] =
    useState(false)

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          CART_STORAGE_KEY
        )

      if (saved) {
        const parsed =
          JSON.parse(saved)

        if (
          Array.isArray(parsed)
        ) {
          const cleaned =
            parsed.filter(
              (item) =>
                item &&
                typeof item.productId ===
                  "string" &&
                typeof item.quantity ===
                  "number" &&
                item.quantity > 0
            )

          setItems(cleaned)
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      )

      localStorage.removeItem(
        CART_STORAGE_KEY
      )
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(items)
      )
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      )
    }
  }, [items, isLoaded])

  const addItem = (
    item: CartItem
  ) => {
    if (
      item.stock <= 0 ||
      item.quantity <= 0
    ) {
      return
    }

    setItems((prev) => {
      const existing =
        prev.find(
          (current) =>
            current.productId ===
              item.productId &&
            current.color ===
              item.color
        )

      if (existing) {
        const newQuantity =
          Math.min(
            existing.quantity +
              item.quantity,
            item.stock
          )

        return prev.map(
          (current) =>
            current.productId ===
              item.productId &&
            current.color ===
              item.color
              ? {
                  ...current,
                  ...item,
                  quantity:
                    newQuantity,
                }
              : current
        )
      }

      return [
        ...prev,
        {
          ...item,
          quantity: Math.min(
            item.quantity,
            item.stock
          ),
        },
      ]
    })
  }

  const removeItem = (
    productId: string,
    color?: string
  ) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId ===
              productId &&
            item.color === color
          )
      )
    )
  }

  const updateQuantity = (
    productId: string,
    quantity: number,
    color?: string
  ) => {
    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      removeItem(
        productId,
        color
      )

      return
    }

    setItems((prev) =>
      prev.map((item) => {
        if (
          item.productId !==
            productId ||
          item.color !== color
        ) {
          return item
        }

        return {
          ...item,
          quantity: Math.min(
            quantity,
            item.stock
          ),
        }
      })
    )
  }

  const clearCart = () => {
    setItems([])

    try {
      localStorage.removeItem(
        CART_STORAGE_KEY
      )
    } catch (error) {
      console.error(
        "Failed to clear cart:",
        error
      )
    }
  }

  const totalItems =
    items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    )

  const totalPrice =
    items.reduce(
      (sum, item) =>
        sum +
        item.price *
          item.quantity,
      0
    )

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context =
    useContext(
      CartContext
    )

  if (!context) {
    throw new Error(
      "useCart must be used within CartProvider"
    )
  }

  return context
}