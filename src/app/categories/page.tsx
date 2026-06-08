import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { Product } from "@/models/Product";
import { serialize } from "@/lib/api";

export const dynamic = "force-dynamic";

interface CategoryWithMeta {
  _id: string;
  name: string;
  slug: string;
  count: number;
  image?: string;
}

async function getCategories(): Promise<CategoryWithMeta[]> {
  await connectDB();
  const cats = serialize(await Category.find().sort({ name: 1 }).lean()) as {
    _id: string;
    name: string;
    slug: string;
  }[];

  // Attach an active-product count and a sample image per category.
  return Promise.all(
    cats.map(async (c) => {
      const [count, sample] = await Promise.all([
        Product.countDocuments({ categoryId: c._id, status: "active" }),
        Product.findOne({ categoryId: c._id, status: "active" }).select("images").lean(),
      ]);
      return {
        ...c,
        count,
        image: (sample as { images?: string[] } | null)?.images?.[0],
      };
    }),
  );
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-foreground">Shop by category</h1>
      <p className="mb-8 text-muted">Browse our collections and find exactly what you need.</p>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          No categories yet. Run <code className="text-foreground">npm run seed</code> to load demo data.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c._id}
              href={`/products?category=${c.slug}`}
              className="group relative flex aspect-[16/9] flex-col justify-end overflow-hidden rounded-xl border border-border bg-brand-50 dark:bg-white/5"
            >
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-5xl">🗂️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="relative p-5">
                <h2 className="text-xl font-semibold text-white">{c.name}</h2>
                <p className="text-sm text-white/80">
                  {c.count} product{c.count === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
