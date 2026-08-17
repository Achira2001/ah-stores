"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X, Palette, Plus, Minus } from "lucide-react"
import toast from "react-hot-toast"

interface ProductImage {
  url: string
  color: string
}

interface ColorStock {
  color: string
  images: string[]
  stock: number
}

export default function AddProductPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  const [images, setImages] = useState<ProductImage[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "",
    codAvailable: true,
    featured: false,
  })

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files

    if (!files) return

    setUploadingImages(true)

    try {
      const uploadedImages: ProductImage[] = []

      for (const file of Array.from(files)) {
        const uploadData = new FormData()

        uploadData.append("file", file)
        uploadData.append("folder", "products")

        const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        })

        if (!res.ok) {
          throw new Error("Image upload failed")
        }

        const data = await res.json()

        if (data.url) {
          uploadedImages.push({
            url: data.url,
            color: "",
          })
        }
      }

      setImages((prev) => [...prev, ...uploadedImages])

      toast.success("Images uploaded successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to upload image")
    } finally {
      setUploadingImages(false)
      e.target.value = ""
    }
  }

  const updateImageColor = (
    index: number,
    color: string
  ) => {
    setImages((prev) =>
      prev.map((image, i) =>
        i === index
          ? {
              ...image,
              color,
            }
          : image
      )
    )
  }

  const removeImage = (index: number) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    )
  }

  /*
   * Build colour groups from images.
   */
  const getColorGroups = (): ColorStock[] => {
    const map: Record<string, ColorStock> = {}

    images.forEach((image) => {
      const color = image.color.trim()

      if (!color) return

      if (!map[color]) {
        map[color] = {
          color,
          images: [],
          stock: 0,
        }
      }

      map[color].images.push(image.url)
    })

    return Object.values(map)
  }

  const colorGroups = getColorGroups()

  const [colorStocks, setColorStocks] = useState<
    Record<string, number>
  >({})

  const updateColorStock = (
    color: string,
    stock: number
  ) => {
    setColorStocks((prev) => ({
      ...prev,
      [color]: Math.max(
        0,
        Number.isFinite(stock) ? stock : 0
      ),
    }))
  }

  const totalStock = colorGroups.reduce(
    (total, group) =>
      total + (colorStocks[group.color] || 0),
    0
  )

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Product name is required")
      return
    }

    if (!formData.description.trim()) {
      toast.error("Product description is required")
      return
    }

    if (!formData.category.trim()) {
      toast.error("Please enter a category")
      return
    }

    if (!formData.price || Number(formData.price) < 0) {
      toast.error("Please enter a valid price")
      return
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image")
      return
    }

    const imagesWithoutColor = images.filter(
      (image) => !image.color.trim()
    )

    if (imagesWithoutColor.length > 0) {
      toast.error(
        "Please enter a colour for every image"
      )
      return
    }

    if (colorGroups.length === 0) {
      toast.error("Please add at least one colour")
      return
    }

    for (const group of colorGroups) {
      const stock = colorStocks[group.color]

      if (
        stock === undefined ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        toast.error(
          `Please enter valid stock for ${group.color}`
        )
        return
      }
    }

    setLoading(true)

    try {
      const colorVariants = colorGroups.map(
        (group) => ({
          color: group.color,
          images: group.images,
          stock: colorStocks[group.color] || 0,
        })
      )

      const res = await fetch("/api/products", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: formData.name.trim(),

          description:
            formData.description.trim(),

          price: Number(formData.price),

          comparePrice:
            formData.comparePrice
              ? Number(formData.comparePrice)
              : undefined,

          images: images.map(
            (image) => image.url
          ),

          colorVariants,

          stock: totalStock,

          category:
            formData.category.trim(),

          codAvailable:
            formData.codAvailable,

          featured:
            formData.featured,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(
          data.error ||
            "Failed to create product"
        )
        return
      }

      toast.success(
        "Product created successfully"
      )

      router.push("/dashboard/products")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Add New Product
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Add product images, colours and
          colour-specific stock.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border shadow-sm p-6 space-y-6"
      >

        {/* IMAGES */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images & Colours *
          </label>

          <div className="space-y-4">
            {images.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-gray-50"
              >
                <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden border">

                  <Image
                    src={image.url}
                    alt={`Product image ${
                      index + 1
                    }`}
                    fill
                    unoptimized
                    className="object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeImage(index)
                    }
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colour
                  </label>

                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                    <input
                      type="text"
                      value={image.color}
                      onChange={(e) =>
                        updateImageColor(
                          index,
                          e.target.value
                        )
                      }
                      placeholder="e.g. White, Black, Yellow"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Multiple images can belong
                    to the same colour.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <label className="mt-4 aspect-[3/1] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
            <Upload className="w-7 h-7 text-gray-400" />

            <span className="text-sm text-gray-500 mt-2">
              Upload Product Images
            </span>

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImages}
            />
          </label>

          {uploadingImages && (
            <p className="text-sm text-blue-600 mt-3">
              Uploading images...
            </p>
          )}
        </div>

        {/* COLOUR STOCK */}

        {colorGroups.length > 0 && (
          <div className="border rounded-2xl p-5 bg-gray-50">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900">
                  Stock by Colour
                </h2>

                <p className="text-sm text-gray-500">
                  Set the available quantity for
                  each colour.
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Total Stock
                </p>

                <p className="text-xl font-bold text-blue-600">
                  {totalStock}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {colorGroups.map((group) => (
                <div
                  key={group.color}
                  className="flex items-center gap-4 bg-white p-4 rounded-xl border"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {group.color}
                    </p>

                    <p className="text-xs text-gray-500">
                      {group.images.length} image
                      {group.images.length !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        updateColorStock(
                          group.color,
                          Math.max(
                            0,
                            (colorStocks[
                              group.color
                            ] || 0) - 1
                          )
                        )
                      }
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={
                        colorStocks[
                          group.color
                        ] ?? 0
                      }
                      onChange={(e) =>
                        updateColorStock(
                          group.color,
                          Number(e.target.value)
                        )
                      }
                      className="w-20 text-center py-2 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        updateColorStock(
                          group.color,
                          (colorStocks[
                            group.color
                          ] || 0) + 1
                        )
                      }
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NAME */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>

          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Gaming Mouse"
          />
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>

          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* PRICE */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (LKR) *
            </label>

            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value,
                })
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compare Price
            </label>

            <input
              type="number"
              min="0"
              value={formData.comparePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comparePrice: e.target.value,
                })
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

        </div>

        {/* CATEGORY */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>

          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value,
              })
            }
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Electronics"
          />
        </div>

        {/* OPTIONS */}

        <div className="flex flex-col sm:flex-row gap-5">

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.codAvailable}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  codAvailable:
                    e.target.checked,
                })
              }
              className="w-4 h-4"
            />

            <span className="text-sm text-gray-700">
              Cash on Delivery Available
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  featured:
                    e.target.checked,
                })
              }
              className="w-4 h-4"
            />

            <span className="text-sm text-gray-700">
              Featured Product
            </span>
          </label>

        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            loading ||
            uploadingImages
          }
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            `Create Product${
              totalStock > 0
                ? ` — ${totalStock} Total Stock`
                : ""
            }`
          )}
        </button>

      </form>
    </div>
  )
}