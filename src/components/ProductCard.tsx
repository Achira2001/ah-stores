"use client"

import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import {
  ShoppingCart,
  Check,
  Palette,
} from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

interface ColorVariant {
  color: string
  images: string[]
  stock: number
}

interface ProductCardProps {
  product: {
    _id: string
    name: string
    price: number
    comparePrice?: number
    images: string[]
    category: string
    stock: number
    codAvailable: boolean
    colorVariants?: ColorVariant[]
  }
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { addItem } = useCart()

  const [added, setAdded] =
    useState(false)

  const colorVariants =
    product.colorVariants?.filter(
      (variant) =>
        variant.color?.trim() &&
        Array.isArray(
          variant.images
        ) &&
        variant.images.length > 0
    ) || []

  const hasColors =
    colorVariants.length > 0

  const [selectedColor, setSelectedColor] =
    useState<string>(
      colorVariants[0]?.color || ""
    )

  const selectedVariant =
    colorVariants.find(
      (variant) =>
        variant.color ===
        selectedColor
    )

  const mainImage =
    selectedVariant?.images?.[0] ||
    product.images?.[0] ||
    "/placeholder-product.png"

  const discount =
    product.comparePrice &&
    product.comparePrice >
      product.price
      ? Math.round(
          ((product.comparePrice -
            product.price) /
            product.comparePrice) *
            100
        )
      : 0

  const handleAddToCart = (
    e: React.MouseEvent
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock <= 0) {
      toast.error(
        "Product is out of stock"
      )
      return
    }

    addItem({
      productId:
        product._id,

      name:
        product.name,

      price:
        product.price,

      image:
        mainImage,

      quantity: 1,

      stock:
        product.stock,

      codAvailable:
        product.codAvailable,
    })

    setAdded(true)

    toast.success(
      `${product.name} added to cart!`
    )

    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const productUrl =
    hasColors &&
    selectedColor
      ? `/products/${product._id}?color=${encodeURIComponent(
          selectedColor
        )}`
      : `/products/${product._id}`

  return (
    <div className="group bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* IMAGE */}

      <Link href={productUrl}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={
              selectedColor
                ? `${product.name} - ${selectedColor}`
                : product.name
            }
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}

          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">
                Out of Stock
              </span>
            </div>
          )}

          {hasColors &&
            selectedColor && (
              <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow">
                {selectedColor}
              </span>
            )}
        </div>
      </Link>

      {/* DETAILS */}

      <div className="p-4">
        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
          {product.category}
        </p>

        <Link href={productUrl}>
          <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}

        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-lg font-bold text-gray-900">
            LKR{" "}
            {product.price.toLocaleString()}
          </span>

          {product.comparePrice &&
            product.comparePrice >
              product.price && (
              <span className="text-sm text-gray-500 line-through">
                LKR{" "}
                {product.comparePrice.toLocaleString()}
              </span>
            )}
        </div>

        {/* COLOURS */}

        {hasColors && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">
                Colour:
                <span className="ml-1 font-semibold text-gray-900">
                  {selectedColor}
                </span>
              </span>

              <span className="text-[10px] text-gray-500">
                {colorVariants.length}{" "}
                {colorVariants.length === 1
                  ? "colour"
                  : "colours"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {colorVariants.map(
                (variant) => {
                  const isSelected =
                    selectedColor ===
                    variant.color

                  return (
                    <button
                      key={
                        variant.color
                      }
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        setSelectedColor(
                          variant.color
                        )
                      }}
                      title={
                        variant.color
                      }
                      aria-label={`Select ${variant.color}`}
                      className={`
                        relative w-10 h-10 rounded-lg overflow-hidden
                        border-2 transition-all duration-200
                        ${
                          isSelected
                            ? "border-blue-600 ring-2 ring-blue-200 scale-105"
                            : "border-gray-200 hover:border-gray-400"
                        }
                      `}
                    >
                      <Image
                        src={
                          variant.images[0]
                        }
                        alt={
                          variant.color
                        }
                        fill
                        sizes="40px"
                        className="object-cover"
                      />

                      {isSelected && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  )
                }
              )}
            </div>
          </div>
        )}

        {/* ACTION */}

        <div className="mt-4 flex items-center justify-between">
          {product.codAvailable ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              COD Available
            </span>
          ) : (
            <span />
          )}

          {hasColors ? (
            <Link
              href={productUrl}
              className="
                ml-auto flex items-center space-x-1
                px-3 py-2 rounded-lg
                text-sm font-medium
                transition
                bg-gray-900 text-white
                hover:bg-gray-800
              "
            >
              <Palette className="w-4 h-4" />

              <span>
                Select Colour
              </span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={
                product.stock <= 0 ||
                added
              }
              className={`
                ml-auto flex items-center space-x-1
                px-3 py-2 rounded-lg
                text-sm font-medium transition
                ${
                  added
                    ? "bg-green-500 text-white"
                    : product.stock <= 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }
              `}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    Added
                  </span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    Add
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}