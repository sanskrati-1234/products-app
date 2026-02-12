import type { Product } from '../api/products'
import StarRating from './StarRating'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.discountPercentage
    ? product.price * (1 - product.discountPercentage / 100)
    : product.price

  return (
    <article className="h-full bg-white rounded-[14px] border border-gray-200 overflow-hidden shadow-[2px_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[2px_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
      <div className="aspect-[4/3] bg-white-100 overflow-hidden p-2">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="w-full h-full object-cover rounded-t-xl bg-gray-100"
        />
      </div>
      <div className="p-4">
        <h2 className="font-[400] text-base text-gray-900 line-clamp-2">{product.title}</h2>
        <div className="mt-4">
          <StarRating rating={product.rating} showValue size="sm" />
        </div>
        <p className="mt-10 text-[16px] font-[400] text-gray-900">${displayPrice.toFixed(2)}</p>
      </div>
    </article>
  )
}
