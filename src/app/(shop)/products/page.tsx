import ProductCard from "@/components/ProductCard"
import CategoryFilter from "@/components/CategoryFilter"
import SortDropdown from "@/components/SortDropdown"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  await connectDB()
  
  const category = searchParams.category as string
  const sort = searchParams.sort as string
  const search = searchParams.search as string
  const page = parseInt((searchParams.page as string) || "1")
  const limit = 12

  const query: any = {}
  if (category && category !== "all") query.category = category
  if (search) query.$text = { $search: search }

  let sortOption: any = { createdAt: -1 }
  if (sort === "price-asc") sortOption = { price: 1 }
  if (sort === "price-desc") sortOption = { price: -1 }
  if (sort === "name-asc") sortOption = { name: 1 }
  if (sort === "name-desc") sortOption = { name: -1 }

  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ])

  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { products, total, pages, currentPage } = await getProducts(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <CategoryFilter />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              All Products
              <span className="text-sm font-normal text-gray-500 ml-2">({total} items)</span>
            </h1>
            <SortDropdown />
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                    <a
                      key={page}
                      href={`?${new URLSearchParams({
                        ...searchParams,
                        page: page.toString(),
                      } as Record<string, string>).toString()}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
