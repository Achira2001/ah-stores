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
    <div className="bg-[#FAF7F1] min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-10">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <CategoryFilter />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm">
              <h1 className="text-xl lg:text-2xl font-black text-[#201C1B]">
                All Products
                <span className="text-sm font-normal text-stone-500 ml-2">({total} items)</span>
              </h1>
              <SortDropdown />
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-stone-200 rounded-2xl">
                <p className="text-stone-500 text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product: any) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="mt-10 flex justify-center flex-wrap gap-2">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                      <a
                        key={page}
                        href={`?${new URLSearchParams({
                          ...searchParams,
                          page: page.toString(),
                        } as Record<string, string>).toString()}`}
                        className={`min-w-[42px] h-[42px] flex items-center justify-center rounded-xl text-sm font-semibold transition ${
                          currentPage === page
                            ? "bg-[#0D5C63] text-white shadow-sm"
                            : "bg-white border border-stone-200 text-stone-700 hover:border-[#0D5C63] hover:text-[#0D5C63]"
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
    </div>
  )
}