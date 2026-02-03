import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, fetchCategories, type Product, type CategoryItem } from '../api/products'
import ProductCard from '../components/ProductCard'
import { getErrorMessage } from '../utils/error'
import { useDebounce } from '../hooks/useDebounce'
import { CustomDropdown } from '../components/Dropdown'
import { SearchIcon, FilterIcon } from '../components/Icons'

const PAGE_SIZE = 8

export type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

/** Map UI sort option to DummyJSON sortBy & order (for server-side sort) */
function getSortParams(sort: SortOption): { sortBy: string; order: 'asc' | 'desc' } {
  switch (sort) {
    case 'newest':
      return { sortBy: 'id', order: 'desc' }
    case 'oldest':
      return { sortBy: 'id', order: 'asc' }
    case 'price-asc':
      return { sortBy: 'price', order: 'asc' }
    case 'price-desc':
      return { sortBy: 'price', order: 'desc' }
    default:
      return { sortBy: 'title', order: 'asc' }
  }
}

function getCreatedTime(p: Product): number {
  return p.meta?.createdAt ? new Date(p.meta.createdAt).getTime() : 0
}

/** Client-side sort (used only when filtering by category; category endpoint doesn't support sort) */
function sortProducts(products: Product[], sort: SortOption): Product[] {
  const arr = [...products]
  switch (sort) {
    case 'newest':
      return arr.sort((a, b) => getCreatedTime(b) - getCreatedTime(a))
    case 'oldest':
      return arr.sort((a, b) => getCreatedTime(a) - getCreatedTime(b))
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price)
    default:
      return arr
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [sort, setSort] = useState<SortOption>('price-asc')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search, 300)

  const isCategoryFilter = !!category

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    if (isCategoryFilter) {
      fetchProducts({ category })
        .then((res) => {
          if (!cancelled) {
            setProducts(res.products)
            setTotal(res.total)
          }
        })
        .catch((e) => {
          if (!cancelled) setError(getErrorMessage(e, 'Failed to load'))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    } else {
      const { sortBy, order } = getSortParams(sort)
      const params: Parameters<typeof fetchProducts>[0] = {
        limit: PAGE_SIZE,
        skip: page * PAGE_SIZE,
        sortBy,
        order,
      }
      if (debouncedSearch.trim()) params.q = debouncedSearch.trim()
      fetchProducts(params)
        .then((res) => {
          if (!cancelled) {
            setProducts(res.products)
            setTotal(res.total)
          }
        })
        .catch((e) => {
          if (!cancelled) setError(getErrorMessage(e, 'Failed to load'))
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }
    return () => { cancelled = true }
  }, [debouncedSearch, category, page, sort, isCategoryFilter])

  useEffect(() => setPage(0), [category])
  useEffect(() => setPage(0), [debouncedSearch])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort])
  const paginatedProducts = isCategoryFilter
    ? sortedProducts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
    : products
  const effectiveTotal = isCategoryFilter ? sortedProducts.length : total
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE))

  return (
    <div className="min-h-screen bg-gray-100">
      <main >
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Product Catalog</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Discover our wide selection of quality products</p>
          </header>

          <div className="w-full space-y-4 mb-6">
            <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1 min-w-0 w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(0)
                  }}
                  className="w-full pl-10 pr-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none transition-shadow hover:border-gray-400"
                />
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                <CustomDropdown
                  value={category}
                  onChange={setCategory}
                  placeholder="All Categories"
                  leftIcon={<FilterIcon />}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories.map((c) => ({ value: c.slug, label: c.name })),
                  ]}
                  triggerClassName="flex-1 sm:flex-initial sm:min-w-[180px]"
                />
                <CustomDropdown
                  value={sort}
                  onChange={setSort}
                  placeholder="Sort"
                  options={SORT_OPTIONS}
                  triggerClassName="flex-1 sm:flex-initial sm:min-w-[200px]"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Showing {paginatedProducts.length} of {effectiveTotal} products
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-600" />
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <li key={product.id}>
                    <Link to={`/products/${product.id}`} className="block h-full">
                      <ProductCard product={product} />
                    </Link>
                  </li>
                ))}
              </ul>
              {!loading && !error && paginatedProducts.length === 0 && (
                <p className="text-center text-gray-500 py-16">No products found.</p>
              )}

              {totalPages > 1 && (
                <nav
                  className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed min-h-[2.25rem] py-2"
                  >
                    <span aria-hidden className="text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Previous
                  </button>
                  <div className="flex items-center gap-3 sm:gap-4">
                    {Array.from({ length: totalPages }, (_, i) =>
                      page === i ? (
                        <span
                          key={i}
                          className="inline-flex items-center justify-center min-w-[2.25rem] h-9 px-3 rounded-md bg-white border border-gray-300 text-gray-900 text-sm font-medium"
                          aria-current="page"
                        >
                          {i + 1}
                        </span>
                      ) : (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i)}
                          className="inline-flex items-center justify-center min-h-[2.25rem] py-2 px-1 text-sm font-medium text-gray-900 hover:text-gray-600"
                        >
                          {i + 1}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed min-h-[2.25rem] py-2"
                  >
                    Next
                    <span aria-hidden className="text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
