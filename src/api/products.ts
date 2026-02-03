/**
 * DummyJSON Products API – used endpoints:
 * - GET /products (limit, skip, sortBy, order, select)
 * - GET /products/search?q= (limit, skip, sortBy, order, select)
 * - GET /products/category/:name (limit=0 for all, select)
 * - GET /products/categories
 * - GET /products/:id (single product, full payload)
 */
const BASE = 'https://dummyjson.com';

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
  meta?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type CategoryItem = { slug: string; name: string };

/** Fields needed for catalog list/cards (smaller payload than full product) */
const LIST_SELECT = 'id,title,thumbnail,price,discountPercentage,rating,category,brand';

/** Fields needed for category list + client-side sort by date (includes meta) */
const CATEGORY_SELECT = 'id,title,thumbnail,price,discountPercentage,rating,category,brand,meta';

type FetchProductsParams = {
  q?: string;
  category?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  select?: string;
};

function applyProductParams(url: URL, params: FetchProductsParams, select: string): void {
  url.searchParams.set('select', select);
  if (params.limit != null) url.searchParams.set('limit', String(params.limit));
  if (params.skip != null) url.searchParams.set('skip', String(params.skip));
  if (params.sortBy) url.searchParams.set('sortBy', params.sortBy);
  if (params.order) url.searchParams.set('order', params.order);
}

export async function fetchProducts(params?: FetchProductsParams): Promise<ProductsResponse> {
  const select = params?.select ?? (params?.category ? CATEGORY_SELECT : LIST_SELECT);

  if (params?.q?.trim()) {
    const url = new URL(`${BASE}/products/search`);
    url.searchParams.set('q', params.q.trim());
    applyProductParams(url, params, select);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  }

  if (params?.category) {
    const url = new URL(`${BASE}/products/category/${encodeURIComponent(params.category)}`);
    url.searchParams.set('limit', '0'); // limit=0 = get all items (per DummyJSON docs)
    url.searchParams.set('select', select);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch products');
    const data = await res.json();
    return { products: data.products ?? [], total: data.total ?? 0, skip: data.skip ?? 0, limit: data.limit ?? 0 };
  }

  const url = new URL(`${BASE}/products`);
  applyProductParams(url, params ?? {}, select);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
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
