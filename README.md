# Products App

A React + TypeScript product catalog and product detail app that lists products from [DummyJSON](https://dummyjson.com/docs/products), with search, category filter, sort, pagination, and full product detail pages. The UI matches a Figma design (Product Catalog and Product Details) with full-width layout and responsive components.

---

## Tech stack

| Technology      | Purpose                    |
|-----------------|----------------------------|
| **React 18**    | UI library                 |
| **TypeScript**  | Type safety                |
| **Vite**        | Build tool and dev server  |
| **Tailwind CSS**| Styling                    |
| **React Router 6** | Client-side routing     |

---

## Project structure

```
products-app/
├── public/              # Static assets
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── products.ts   # DummyJSON API: fetchProducts, fetchProduct, fetchCategories
│   ├── components/
│   │   └── ProductCard.tsx   # Product card with image, title, star rating, price
│   ├── pages/
│   │   ├── ProductsPage.tsx      # Catalog: search, filters, grid, pagination
│   │   └── ProductDetailPage.tsx # PDP: image, details, specs, accordions, reviews
│   ├── icons/           # Icon assets (optional)
│   ├── App.tsx          # Routes: / and /products/:id
│   ├── main.tsx         # Entry point
│   └── tailwind.css     # Tailwind + global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Setup and run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check and production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Features

### Product catalog (`/`)

- **Full-width layout** – Content uses full viewport width with consistent padding.
- **Search** – Full-width search bar with magnifying glass icon. Debounced (300 ms); uses DummyJSON search API.
- **Filters**
  - **All Categories** – Dropdown with filter icon; options from `/products/categories`. Selecting a category loads products for that category (client-side pagination).
  - **Price / Sort** – Dropdown: Newest, Oldest, Price: Low to High, Price: High to Low. Applied client-side after fetch.
- **Dropdown design** – Rounded corners, hover/focus states, focus ring and shadow when focused, chevron icon, consistent height. Responsive: full width on small screens, auto width on larger screens.
- **Product count** – “Showing X of Y products” below the filters.
- **Product grid** – Responsive grid: 1 column (mobile), 2 (tablet), 4 (desktop). Each card shows image, title, star rating with numeric value, and price (discount applied when present).
- **Pagination** – “Previous” (with left chevron), page numbers (current page in a white bordered box, others as plain text), “Next” (with right chevron). Responsive with flex-wrap and touch-friendly targets. 8 products per page.

### Product detail page (`/products/:id`)

- **Full-width layout** – Same full-width approach as the catalog.
- **Header** – “Product Details” title and “← Back to Products” link.
- **Main block** – Two columns (stacked on mobile): product image (left), details (right).
- **Details**
  - Category and “In Stock” tags (light gray and dark charcoal).
  - Title, description, star rating with “X out of 5 stars”.
  - **Price** – Label “Price” above the amount, then large bold price.
  - Specs in two columns: Brand, Stock, Dimensions, SKU, Weight (labels light gray, values darker).
  - Tags as pills (e.g. category, brand).
  - Full-width “Order Now” button (dark, with cart icon).
  - “Fast Shipping” and “Secure Payment” with icons, left-aligned.
- **Second block** – Accordions: Additional Information, Warranty, Shipping, Return Policy. Then “Customer Reviews” with sample reviews (name, email, text, stars, date).

---

## API (DummyJSON)

All product data comes from [DummyJSON](https://dummyjson.com/docs/products). No hardcoded product data.

| Endpoint / usage | Purpose |
|------------------|--------|
| `GET /products?limit=&skip=` | Paginated product list |
| `GET /products/search?q=` | Search by query |
| `GET /products/category/:category` | Products in a category |
| `GET /products/categories` | Category list for filter |
| `GET /products/:id` | Single product for PDP |

The app uses `limit` and `skip` for catalog pagination (8 per page) and shows `total` from the API for “Showing X of Y products”. Category filter loads all products for the selected category and paginates them client-side.

---

## Design notes

- **Figma alignment** – Product Catalog and Product Details pages are implemented to match the provided Figma (titles, subtitles, search/filter bar, product count, grid, card layout, PDP layout, tags, buttons, accordions, reviews).
- **Full width** – Catalog and PDP use full viewport width; inner content has horizontal padding only.
- **Pagination** – Matches the requested design: Previous (with chevron), current page in a bordered box, other pages as text, Next (with chevron); responsive and accessible.
- **Search and dropdowns** – Search bar is full width (and grows in the row on larger screens). Dropdowns have clear open/focus styling (ring + shadow), hover states, and consistent height; they are full width on small screens.

---

## Browser support

Modern browsers that support ES modules and the features used by React 18, Vite, and Tailwind CSS.

---

## License

Private / assignment use as required.
