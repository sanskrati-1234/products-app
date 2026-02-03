import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchProduct, type Product } from '../api/products'
import StarRating from '../components/StarRating'
import { getErrorMessage } from '../utils/error'

const MOCK_REVIEWS = [
  { name: 'Lisa Anderson', email: 'lisa.a@example.com', text: 'Keeps my coffee hot all morning!', rating: 5, date: 'October 14, 2025' },
  { name: 'Tom Wilson', email: 'tom.w@example.com', text: 'Perfect size and great quality', rating: 5, date: 'October 11, 2025' },
]

function formatCategory(value: string): string {
  return value
    .split(/[- ]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' & ')
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-gray-900 font-medium"
      >
        {title}
        <span className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      {open && <div className="pb-4 text-gray-600 text-sm leading-relaxed">{children}</div>}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchProduct(id)
      .then((p) => {
        if (!cancelled) setProduct(p)
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e, 'Failed to load'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-white-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-gray-600" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white-100 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600">{error ?? 'Product not found'}</p>
        <Link to="/" className="text-gray-700 hover:underline font-medium">
          ← Back to Products
        </Link>
      </div>
    )
  }

  const displayPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price
  const mainImage = product.images?.[0] ?? product.thumbnail
  const categoryDisplay = formatCategory(product.category ?? '')
  const tags = [product.category, product.brand?.toLowerCase() ?? '', 'quality'].filter(Boolean).slice(0, 4)
  const sku = `HL-${String(product.id).padStart(3, '0')}`
  const dimensions = '7 x 26 x 7 cm'
  const weight = '400g'

  return (
    <div className="min-h-screen bg-white-100">
      <div className="w-full px-8 py-6 md:py-8">
        <header className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 mt-2 text-sm md:text-base text-gray-700 hover:text-gray-900 font-medium"
          >
            ← Back to Products
          </Link>
        </header>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
            <div className="aspect-square max-h-[480px] bg-gray-100 rounded-lg overflow-hidden w-full">
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-700">
                  {categoryDisplay}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-800 text-white">
                  In Stock
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{product.title}</h2>
              <p className="text-sm text-gray-800 mt-2 leading-relaxed">{product.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-gray-800">{product.rating.toFixed(1)} out of 5 stars</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500 font-normal">Price</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">${displayPrice.toFixed(2)}</p>
              </div>

              <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 font-normal">Brand</dt>
                  <dd className="text-gray-800 font-medium mt-0.5">{product.brand}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-normal">Stock</dt>
                  <dd className="text-gray-800 font-medium mt-0.5">{product.stock} units available</dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-normal">Dimensions</dt>
                  <dd className="text-gray-800 font-medium mt-0.5">{dimensions}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-normal">SKU</dt>
                  <dd className="text-gray-800 font-medium mt-0.5">{sku}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 font-normal">Weight</dt>
                  <dd className="text-gray-800 font-medium mt-0.5">{weight}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2 mt-5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gray-800 text-white text-base font-medium hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Now
              </button>

              <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-500 justify-start">
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9-4v-4h4v4M6 12h.01M6 16h.01M10 12h.01M10 16h.01M14 12h.01M14 16h.01" />
                  </svg>
                  Fast Shipping
                </span>
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Payment
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="divide-y divide-gray-200">
              <Accordion title="Additional Information">
                Material, care instructions, and product specifications are available from the manufacturer. This product meets standard quality and safety requirements.
              </Accordion>
              <Accordion title="Warranty Information">
                This product is covered by a standard manufacturer warranty. Please retain your proof of purchase for warranty claims.
              </Accordion>
              <Accordion title="Shipping Information">
                Standard delivery within 5–7 business days. Express shipping options available at checkout. Free shipping on orders over a qualifying amount.
              </Accordion>
              <Accordion title="Return Policy">
                We offer a 30-day return policy for unused items in original packaging. Contact our support team to initiate a return.
              </Accordion>
            </div>

            <section className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>
              <ul className="space-y-6">
                {MOCK_REVIEWS.map((review, i) => (
                  <li key={i} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900">{review.name}</p>
                        <p className="text-sm text-gray-500">{review.email}</p>
                      </div>
                      <StarRating rating={review.rating} size="md" />
                    </div>
                    <p className="mt-2 text-gray-700">{review.text}</p>
                    <p className="mt-1 text-sm text-gray-500">{review.date}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
