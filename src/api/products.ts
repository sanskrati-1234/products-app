const BASE = 'https://dummyjson.com';

export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  thumbnail: string;
  images: string[];
  availabilityStatus?: string;
  meta?: { createdAt: string; updatedAt: string };
  sku?: string;
  reviews?: ProductReview[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type CategoryItem = { slug: string; name: string };

export async function fetchProducts(params?: {
  q?: string;
  category?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}): Promise<ProductsResponse> {
  let url: URL;

  if (params?.q?.trim()) {
    url = new URL(`${BASE}/products/search`);
    url.searchParams.set('q', params.q.trim());
  } else if (params?.category) {
    url = new URL(`${BASE}/products/category/${encodeURIComponent(params.category)}`);
    url.searchParams.set('limit', '0');
  } else {
    url = new URL(`${BASE}/products`);
  }

  if (params?.limit != null) url.searchParams.set('limit', String(params.limit));
  if (params?.skip != null) url.searchParams.set('skip', String(params.skip));
  if (params?.sortBy) url.searchParams.set('sortBy', params.sortBy);
  if (params?.order) url.searchParams.set('order', params.order);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  return {
    products: data.products ?? [],
    total: data.total ?? 0,
    skip: data.skip ?? 0,
    limit: data.limit ?? 0,
  };
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const res = await fetch(`${BASE}/products/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
