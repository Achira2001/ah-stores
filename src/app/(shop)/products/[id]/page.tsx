"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useCart } from "@/context/CartContext"

import {
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Minus,
  Plus,
  LogIn,
  Palette,
} from "lucide-react"

import toast from "react-hot-toast"

interface ColorVariant {
  color: string
  images: string[]
  stock: number
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  colorVariants: ColorVariant[]
  category: string
  stock: number
  codAvailable: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()

  const { data: session, status } =
    useSession()

  const { addItem } = useCart()

  const id = params?.id as string

  const [product, setProduct] =
    useState<Product | null>(null)

  const [loading, setLoading] =
    useState(true)

  /*
   * Example:
   *
   * {
   *   White: 1,
   *   Black: 2,
   *   Yellow: 1
   * }
   */
  const [selectedQuantities, setSelectedQuantities] =
    useState<Record<string, number>>({})

  const [selectedColor, setSelectedColor] =
    useState("")

  const [selectedImage, setSelectedImage] =
    useState(0)

  useEffect(() => {
    if (!id) return

    const fetchProduct = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `/api/products/${id}`,
          {
            cache: "no-store",
          }
        )

        if (!res.ok) {
          setProduct(null)
          return
        }

        const data =
          await res.json()

        const normalizedProduct: Product = {
          ...data,

          images:
            Array.isArray(data.images)
              ? data.images
              : [],

          colorVariants:
            Array.isArray(
              data.colorVariants
            )
              ? data.colorVariants
              : [],
        }

        setProduct(
          normalizedProduct
        )

        if (
          normalizedProduct
            .colorVariants
            .length > 0
        ) {
          setSelectedColor(
            normalizedProduct
              .colorVariants[0]
              .color
          )
        }
      } catch (error) {
        console.error(error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#0D5C63] border-t-transparent rounded-full mx-auto" />

        <p className="mt-4 text-stone-500">
          Loading product...
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center min-h-[60vh] flex items-center justify-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-10 shadow-sm">

          <p className="text-stone-500 text-lg">
            Product not found.
          </p>

          <Link
            href="/products"
            className="inline-flex items-center mt-6 bg-[#0D5C63] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#0A4A50] transition"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>

        </div>
      </div>
    )
  }

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

  /*
   * Images for currently previewed colour.
   */
  const previewVariant =
    product.colorVariants.find(
      (variant) =>
        variant.color ===
        selectedColor
    )

  const galleryImages =
    previewVariant &&
    previewVariant.images.length > 0
      ? previewVariant.images
      : product.images

  const updateQuantity = (
    color: string,
    quantity: number
  ) => {
    const variant =
      product.colorVariants.find(
        (v) => v.color === color
      )

    if (!variant) return

    const safeQuantity = Math.max(
      0,
      Math.min(
        quantity,
        variant.stock
      )
    )

    setSelectedQuantities(
      (prev) => ({
        ...prev,
        [color]: safeQuantity,
      })
    )
  }

  const increaseQuantity = (
    color: string
  ) => {
    const variant =
      product.colorVariants.find(
        (v) => v.color === color
      )

    if (!variant) return

    const current =
      selectedQuantities[color] ||
      0

    if (
      current >=
      variant.stock
    ) {
      return
    }

    updateQuantity(
      color,
      current + 1
    )
  }

  const decreaseQuantity = (
    color: string
  ) => {
    const current =
      selectedQuantities[color] ||
      0

    updateQuantity(
      color,
      current - 1
    )
  }

  const selectedItems =
    product.colorVariants
      .map((variant) => ({
        variant,
        quantity:
          selectedQuantities[
            variant.color
          ] || 0,
      }))
      .filter(
        (item) =>
          item.quantity > 0
      )

  const totalSelectedQuantity =
    selectedItems.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    )

  const totalSelectedPrice =
    totalSelectedQuantity *
    product.price

  const handleAddToCart = () => {
    if (!product) return

    if (
      status !==
      "authenticated"
    ) {
      toast(
        "Please sign in to add products to your cart.",
        {
          icon: "🔐",
        }
      )

      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/products/${product._id}`
        )}`
      )

      return
    }

    if (product.stock <= 0) {
      toast.error(
        "Product is out of stock"
      )
      return
    }

    if (
      product.colorVariants.length >
        0 &&
      selectedItems.length === 0
    ) {
      toast.error(
        "Please select at least one colour and quantity"
      )
      return
    }

    /*
     * Add every selected colour
     * as a separate cart item.
     */
    selectedItems.forEach(
      ({
        variant,
        quantity,
      }) => {
        const image =
          variant.images[0] ||
          product.images[0] ||
          ""

        addItem({
          productId:
            product._id,

          name:
            product.name,

          price:
            product.price,

          image,

          stock:
            variant.stock,

          codAvailable:
            product.codAvailable,

          color:
            variant.color,

          quantity,
        })
      }
    )

    /*
     * Product without colours.
     */
    if (
      product.colorVariants.length ===
      0
    ) {
      addItem({
        productId:
          product._id,

        name:
          product.name,

        price:
          product.price,

        image:
          product.images[0] ||
          "",

        stock:
          product.stock,

        codAvailable:
          product.codAvailable,

        quantity:
          Math.max(
            1,
            totalSelectedQuantity
          ),
      })
    }

    toast.success(
      `${totalSelectedQuantity} item${
        totalSelectedQuantity !==
        1
          ? "s"
          : ""
      } added to cart`
    )

    /*
     * Reset selected quantities
     * after adding.
     */
    setSelectedQuantities({})
  }

  return (
    <div className="bg-[#FAF7F1] min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <Link
  href="/"
  className="inline-flex items-center text-stone-600 hover:text-[#0D5C63] mb-8 font-medium transition-colors"
>
  <ChevronLeft className="w-5 h-5 mr-1" />
  Back to Home
</Link>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 lg:p-10">

            {/* IMAGE */}

            <div>

              <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden">

                {galleryImages.length >
                0 ? (
                  <Image
                    src={
                      galleryImages[
                        selectedImage
                      ]
                    }
                    alt={
                      product.name
                    }
                    fill
                    priority
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-stone-400">
                      No image available
                    </span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="absolute top-4 left-0 bg-[#E1553F] text-white pl-4 pr-3 py-2 rounded-r-full text-sm font-bold shadow-md">
                    -{discount}% OFF
                  </div>
                )}

              </div>

              {galleryImages.length >
                1 && (
                <div className="flex gap-3 mt-4 overflow-x-auto">

                  {galleryImages.map(
                    (
                      image,
                      index
                    ) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            index
                          )
                        }
                        className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                          selectedImage ===
                          index
                            ? "border-[#0D5C63]"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${
                            index +
                            1
                          }`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* DETAILS */}

            <div className="flex flex-col">

              <span className="text-sm font-bold text-[#0D5C63] uppercase tracking-wider">
                {product.category}
              </span>

              <h1 className="text-3xl lg:text-4xl font-black text-[#201C1B] mt-2 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-6">

                <span className="text-3xl font-black text-[#0A4A50] tabular-nums">
                  LKR{" "}
                  {product.price.toLocaleString()}
                </span>

                {product.comparePrice &&
                  product.comparePrice >
                    product.price && (
                    <span className="text-lg text-stone-400 line-through tabular-nums">
                      LKR{" "}
                      {product.comparePrice.toLocaleString()}
                    </span>
                  )}

              </div>

              {discount > 0 && (
                <p className="text-sm text-[#E1553F] font-semibold mt-2">
                  You save {discount}%
                </p>
              )}

              <div className="border-t border-b border-stone-200 py-6 my-6">

                <h2 className="font-bold text-[#201C1B] mb-2">
                  Description
                </h2>

                <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>

              </div>

              {/* COLOURS */}

              {product.colorVariants.length >
                0 && (
                <div className="mb-6">

                  <div className="flex items-center gap-2 mb-4">

                    <Palette className="w-5 h-5 text-[#0D5C63]" />

                    <span className="font-bold text-[#201C1B]">
                      Select Colours & Quantity
                    </span>

                  </div>

                  <div className="space-y-3">

                    {product.colorVariants.map(
                      (
                        variant
                      ) => {
                        const quantity =
                          selectedQuantities[
                            variant.color
                          ] || 0

                        const isSelected =
                          selectedColor ===
                          variant.color

                        return (
                          <div
                            key={
                              variant.color
                            }
                            className={`flex items-center gap-4 p-3 rounded-xl border-2 transition ${
                              isSelected
                                ? "border-[#0D5C63] bg-[#E8F3F0]"
                                : "border-stone-200"
                            }`}
                          >

                            {/* IMAGE */}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedColor(
                                  variant.color
                                )
                                setSelectedImage(
                                  0
                                )
                              }}
                              className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-stone-200"
                            >
                              {variant.images[0] ? (
                                <Image
                                  src={
                                    variant.images[0]
                                  }
                                  alt={
                                    variant.color
                                  }
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-stone-100" />
                              )}
                            </button>

                            {/* NAME/STOCK */}

                            <div className="flex-1">

                              <p className="font-bold text-[#201C1B]">
                                {variant.color}
                              </p>

                              <p
                                className={`text-xs ${
                                  variant.stock >
                                  0
                                    ? "text-emerald-600"
                                    : "text-[#E1553F]"
                                }`}
                              >
                                {variant.stock >
                                0
                                  ? `${variant.stock} available`
                                  : "Out of stock"}
                              </p>

                            </div>

                            {/* QUANTITY */}

                            {variant.stock >
                              0 ? (
                              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">

                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      variant.color
                                    )
                                  }
                                  className="p-2 hover:bg-stone-100 transition"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>

                                <span className="w-10 text-center font-bold tabular-nums">
                                  {quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(
                                      variant.color
                                    )
                                  }
                                  disabled={
                                    quantity >=
                                    variant.stock
                                  }
                                  className="p-2 hover:bg-stone-100 disabled:text-stone-300 transition"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>

                              </div>
                            ) : (
                              <span className="text-xs text-[#E1553F] font-semibold">
                                Sold Out
                              </span>
                            )}

                          </div>
                        )
                      }
                    )}

                  </div>

                </div>
              )}

              {/* TOTAL */}

              {totalSelectedQuantity >
                0 && (
                <div className="bg-[#E8F3F0] border border-[#0D5C63]/20 rounded-xl p-4 mb-4">

                  <div className="flex justify-between">

                    <span className="text-stone-700">
                      Selected quantity
                    </span>

                    <span className="font-bold text-[#201C1B]">
                      {totalSelectedQuantity}
                    </span>

                  </div>

                  <div className="flex justify-between mt-1">

                    <span className="text-stone-700">
                      Total
                    </span>

                    <span className="font-bold text-[#0A4A50] tabular-nums">
                      LKR{" "}
                      {totalSelectedPrice.toLocaleString()}
                    </span>

                  </div>

                </div>
              )}

              {/* GENERAL STOCK */}

              {product.colorVariants.length ===
                0 && (
                <span
                  className={`px-3 py-2 rounded-full text-sm font-semibold w-fit ${
                    product.stock >
                    0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.stock >
                  0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              )}

              {product.codAvailable && (
                <span className="px-3 py-2 rounded-full text-sm font-semibold bg-[#E8F3F0] text-[#0A4A50] w-fit mt-3">
                  COD Available
                </span>
              )}

              {/* ADD */}

              <button
                type="button"
                onClick={
                  handleAddToCart
                }
                disabled={
                  product.stock <=
                    0 ||
                  (product.colorVariants.length >
                    0 &&
                    totalSelectedQuantity ===
                      0)
                }
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#0D5C63] text-white py-4 rounded-xl font-bold hover:bg-[#0A4A50] transition disabled:bg-stone-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >

                {status !==
                "authenticated" ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In to Add to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />

                    {totalSelectedQuantity >
                    0
                      ? `Add ${totalSelectedQuantity} to Cart`
                      : "Select Colours"}
                  </>
                )}

              </button>

              {/* TRUST */}

              <div className="grid grid-cols-3 gap-3 mt-8 pt-8 border-t border-stone-200">

                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto text-[#0D5C63]" />

                  <p className="text-xs text-stone-600 mt-2">
                    Fast Delivery
                  </p>
                </div>

                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto text-[#0D5C63]" />

                  <p className="text-xs text-stone-600 mt-2">
                    Secure Payment
                  </p>
                </div>

                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto text-[#0D5C63]" />

                  <p className="text-xs text-stone-600 mt-2">
                    Easy Returns
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}