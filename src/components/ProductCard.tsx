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
    <div className="group relative bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-1 hover:border-[#0D5C63]/30 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* IMAGE */}

      <Link href={productUrl} className="block">
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          <Image
            src={mainImage}
            alt={
              selectedColor
                ? `${product.name} - ${selectedColor}`
                : product.name
            }
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />

          {discount > 0 && (
            <span className="absolute top-3 left-0 bg-[#E1553F] text-white text-xs font-bold pl-3 pr-2.5 py-1 rounded-r-full shadow-md">
              -{discount}% OFF
            </span>
          )}

          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-white font-semibold tracking-wide text-sm border border-white/40 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}

          {hasColors &&
            selectedColor && (
              <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm text-[#201C1B] text-xs font-semibold px-2.5 py-1 rounded-md shadow">
                {selectedColor}
              </span>
            )}
        </div>
      </Link>

      {/* DETAILS */}

      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-[#0D5C63] font-bold uppercase tracking-wider">
          {product.category}
        </p>

        <Link href={productUrl}>
          <h3 className="mt-1 font-semibold text-[#201C1B] line-clamp-2 leading-snug hover:text-[#0D5C63] transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* PRICE */}

        <div className="mt-2 flex items-baseline space-x-2">
          <span className="text-lg font-black text-[#0A4A50] tabular-nums">
            LKR{" "}
            {product.price.toLocaleString()}
          </span>

          {product.comparePrice &&
            product.comparePrice >
              product.price && (
              <span className="text-sm text-stone-400 line-through tabular-nums">
                LKR{" "}
                {product.comparePrice.toLocaleString()}
              </span>
            )}
        </div>

        {/* COLOURS */}

        {hasColors && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-600">
                Colour:
                <span className="ml-1 font-semibold text-[#201C1B]">
                  {selectedColor}
                </span>
              </span>

              <span className="text-[10px] text-stone-400">
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
                            ? "border-[#0D5C63] ring-2 ring-[#0D5C63]/20 scale-105"
                            : "border-stone-200 hover:border-stone-400"
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

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          {product.codAvailable ? (
            <span className="text-[11px] font-semibold bg-[#E8F3F0] text-[#0A4A50] px-2 py-1 rounded-full">
              COD Available
            </span>
          ) : (
            <span />
          )}

          {hasColors ? (
            <Link
              href={productUrl}
              className="
                ml-auto flex items-center space-x-1.5
                px-3.5 py-2 rounded-lg
                text-sm font-semibold
                transition
                bg-[#201C1B] text-white
                hover:bg-[#0D5C63]
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
                ml-auto flex items-center space-x-1.5
                px-3.5 py-2 rounded-lg
                text-sm font-semibold transition
                ${
                  added
                    ? "bg-emerald-600 text-white"
                    : product.stock <= 0
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : "bg-[#0D5C63] text-white hover:bg-[#0A4A50]"
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