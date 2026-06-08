import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { serialize } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { cn } from "@/lib/utils";
import type { ProductLite } from "@/types";

export const dynamic = "force-dynamic";

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top rated" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; category?: string }>;
}) {
  const { search, sort = "newest", category } = await searchParams;

  await connectDB();

  const categories = serialize(
    await Category.find().sort({ name: 1 }).lean(),
  ) as { _id: string; name: string; slug: string }[];

  const filter: Record<string, unknown> = { status: "active" };
  if (search) filter.title = { $regex: search, $options: "i" };

  const activeCategory = category
    ? categories.find((c) => c.slug === category)
    : undefined;
  if (activeCategory) filter.categoryId = activeCategory._id;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { ratingAvg: -1 },
  };

  const items = serialize(
    await Product.find(filter).sort(sortMap[sort] ?? sortMap.newest).limit(48).lean(),
  ) as ProductLite[];

  // Build a /products href that keeps the current search & sort but swaps category.
  const hrefFor = (slug?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort && sort !== "newest") params.set("sort", sort);
    if (slug) params.set("category", slug);
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        {activeCategory ? activeCategory.name : "All products"}
      </h1>

      {/* Filters */}
      <form className="mb-5 flex flex-wrap items-end gap-3" action="/products" method="get">
        {/* Preserve the active category when searching/sorting via the form. */}
        {category && <input type="hidden" name="category" value={category} />}
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="search" className="text-sm font-medium">Search</label>
          <input
            id="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search products…"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sort" className="text-sm font-medium">Sort</label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
        <button className="h-10 rounded-lg bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700">
          Apply
        </button>
      </form>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={hrefFor()}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              !activeCategory
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-border text-muted hover:text-foreground",
            )}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c._id}
              href={hrefFor(c.slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory?._id === c._id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border text-muted hover:text-foreground",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          No products found.{" "}
          {(search || activeCategory) && (
            <Link href="/products" className="text-brand-600 hover:underline">Clear filters</Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
