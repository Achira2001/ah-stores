"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Search,
  ShoppingCart,
  ArrowRight,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  LogIn,
} from "lucide-react"
import toast from "react-hot-toast"
import { useCart } from "@/context/CartContext"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: string
  stock: number
  codAvailable: boolean
  featured: boolean
  ratings?: {
    average: number
    count: number
  }
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addItem } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])

  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)

      /*
       * Fetch all products.
       * API limit is configured to allow up to 1000 products.
       */
      const res = await fetch("/api/products?limit=1000", {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await res.json()

      setProducts(data.products || [])
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast.error("Unable to load products")
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)

      const res = await fetch("/api/categories", {
        cache: "no-store",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await res.json()

      setCategories(data.categories || [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search.trim() ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        !selectedCategory ||
        product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory])

  const featuredProducts = filteredProducts.filter(
    (product) => product.featured
  )

  /*
   * IMPORTANT:
   * Previously this was:
   *
   * filteredProducts.slice(0, 8)
   *
   * That limited the home page to 8 products.
   *
   * Now all matching products are displayed.
   */
  const newArrivals = filteredProducts

  const handleAddToCart = (product: Product) => {
    if (status !== "authenticated") {
      toast("Please sign in to add products to your cart.", {
        icon: "🔐",
      })

      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          `/products/${product._id}`
        )}`
      )

      return
    }

    if (product.stock <= 0) {
      toast.error("This product is out of stock")
      return
    }

    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      stock: product.stock,
      codAvailable: product.codAvailable,
    })

    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-14 lg:py-20">

            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold mb-5">
                <Package className="w-4 h-4" />
                Everything you need, in one place
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                Shop smarter.
                <span className="text-blue-600 block">
                  Live better.
                </span>
              </h1>

              <p className="mt-5 text-gray-500 text-base sm:text-lg max-w-xl leading-relaxed">
                Discover quality products at great prices with convenient
                shopping and reliable delivery across Sri Lanka.
              </p>

              <div className="mt-8 relative max-w-xl">

                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="flex flex-wrap gap-3 mt-6">

                <a
                  href="#products"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Explore Products
                  <ArrowRight className="w-4 h-4" />
                </a>

                {!session && (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 border border-gray-200 bg-white px-5 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Link>
                )}

              </div>

            </div>

            <div className="hidden lg:block">

              <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] p-10 min-h-[400px] overflow-hidden">

                <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10" />
                <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white/10" />

                <div className="relative z-10 text-white">

                  <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">
                    AH Store
                  </p>

                  <h2 className="text-4xl font-black mt-4 leading-tight">
                    Quality products.
                    <br />
                    Simple shopping.
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mt-10">

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <Truck className="w-7 h-7 mb-3" />
                      <p className="font-bold">Fast Delivery</p>
                      <p className="text-xs text-blue-100 mt-1">
                        Across Sri Lanka
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <ShieldCheck className="w-7 h-7 mb-3" />
                      <p className="font-bold">Secure Shopping</p>
                      <p className="text-xs text-blue-100 mt-1">
                        Shop with confidence
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST FEATURES
      ========================================================= */}

      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-bold">Fast Delivery</p>
                <p className="text-xs text-gray-500">
                  Islandwide delivery
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-bold">Secure Shopping</p>
                <p className="text-xs text-gray-500">
                  Safe & reliable
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-bold">Easy Returns</p>
                <p className="text-xs text-gray-500">
                  Hassle-free
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm font-bold">Quality Products</p>
                <p className="text-xs text-gray-500">
                  Carefully selected
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">

        <div className="flex items-end justify-between mb-5">

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Browse
            </p>

            <h2 className="text-2xl font-black text-gray-900 mt-1">
              Shop by Category
            </h2>
          </div>

        </div>

        {loadingCategories ? (

          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>

        ) : categories.length > 0 ? (

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => setSelectedCategory("")}
              className={`px-5 py-3 rounded-xl text-sm font-bold transition ${
                selectedCategory === ""
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-700 hover:border-blue-300"
              }`}
            >
              All Products
            </button>

            {categories.map((category) => (

              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category ? "" : category
                  )
                }
                className={`px-5 py-3 rounded-xl text-sm font-bold transition ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-gray-700 hover:border-blue-300"
                }`}
              >
                {category}
              </button>

            ))}

          </div>

        ) : (

          <div className="bg-white border rounded-xl p-5 text-sm text-gray-500">
            Categories will appear here when products are added.
          </div>

        )}

      </section>

      {/* =========================================================
          PRODUCTS
      ========================================================= */}

      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >

        {selectedCategory && (
          <div className="mb-6">

            <p className="text-sm text-gray-500">
              Showing products in
            </p>

            <h2 className="text-2xl font-black text-gray-900">
              {selectedCategory}
            </h2>

          </div>
        )}

        {/* Featured Products */}

        {!search && !selectedCategory && featuredProducts.length > 0 && (

          <div className="mb-14">

            <div className="flex items-center justify-between mb-6">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Recommended
                </p>

                <h2 className="text-2xl font-black text-gray-900">
                  Featured Products
                </h2>
              </div>

            </div>

            <ProductGrid
              products={featuredProducts}
              onAddToCart={handleAddToCart}
              session={session}
            />

          </div>
        )}

        {/* All/New Products */}

        <div>

          <div className="flex items-center justify-between mb-6">

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Explore
              </p>

              <h2 className="text-2xl font-black text-gray-900">
                {search
                  ? "Search Results"
                  : selectedCategory
                  ? selectedCategory
                  : "All Products"}
              </h2>
            </div>

            <span className="text-sm text-gray-500">
              {newArrivals.length} products
            </span>

          </div>

          {loadingProducts ? (

            <ProductSkeleton />

          ) : newArrivals.length === 0 ? (

            <div className="bg-white border rounded-2xl p-12 text-center">

              <Package className="w-12 h-12 mx-auto text-gray-300" />

              <h3 className="font-bold text-gray-800 mt-4">
                No products found
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Try another search or category.
              </p>

            </div>

          ) : (

            <ProductGrid
              products={newArrivals}
              onAddToCart={handleAddToCart}
              session={session}
            />

          )}

        </div>

      </section>

      {/* =========================================================
          LOGIN CTA
      ========================================================= */}

      {!session && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 text-center text-white">

            <h2 className="text-3xl font-black">
              Ready to start shopping?
            </h2>

            <p className="text-gray-400 mt-3 max-w-lg mx-auto">
              Create an account to add products to your cart and place orders.
            </p>

            <div className="flex justify-center gap-3 mt-7">

              <Link
                href="/signup"
                className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
              >
                Sign In
              </Link>

            </div>

          </div>

        </section>
      )}

    </div>
  )
}

/* =========================================================
   PRODUCT GRID
========================================================= */

function ProductGrid({
  products,
  onAddToCart,
  session,
}: {
  products: Product[]
  onAddToCart: (product: Product) => void
  session: any
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

      {products.map((product) => {

        const discount =
          product.comparePrice &&
          product.comparePrice > product.price
            ? Math.round(
                ((product.comparePrice - product.price) /
                  product.comparePrice) *
                  100
              )
            : 0

        return (
          <div
            key={product._id}
            className="bg-white rounded-2xl border overflow-hidden group hover:shadow-lg transition"
          >

            {/* Image */}

            <Link href={`/products/${product._id}`}>

              <div className="relative h-56 bg-gray-100 overflow-hidden">

                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700">
                  {product.category}
                </div>

                {discount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    -{discount}%
                  </div>
                )}

              </div>

            </Link>

            {/* Details */}

            <div className="p-4">

              <Link href={`/products/${product._id}`}>

                <h3 className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600">
                  {product.name}
                </h3>

              </Link>

              <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[40px]">
                {product.description}
              </p>

              <div className="flex items-center gap-2 mt-4">

                <span className="text-lg font-black text-blue-600">
                  LKR {product.price.toLocaleString()}
                </span>

                {product.comparePrice &&
                  product.comparePrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      LKR {product.comparePrice.toLocaleString()}
                    </span>
                  )}

              </div>

              <div className="flex items-center justify-between mt-3">

                <span
                  className={`text-xs font-bold ${
                    product.stock > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>

              </div>

              {/* ONLY DETAILS BUTTON */}

              <div className="mt-4">

                <Link
                  href={`/products/${product._id}`}
                  className="w-full py-2.5 rounded-xl border text-center text-xs font-bold text-gray-700 hover:bg-gray-50 block"
                >
                  Details
                </Link>

              </div>

            </div>

          </div>
        )
      })}

    </div>
  )
}

/* =========================================================
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="bg-white rounded-2xl border overflow-hidden"
        >

          <div className="h-56 bg-gray-200 animate-pulse" />

          <div className="p-4 space-y-3">

            <div className="h-4 bg-gray-200 rounded animate-pulse" />

            <div className="h-8 bg-gray-100 rounded animate-pulse" />

            <div className="h-5 bg-gray-200 rounded animate-pulse" />

            <div className="h-10 bg-gray-200 rounded animate-pulse" />

          </div>

        </div>
      ))}

    </div>
  )
}