import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { serialize } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ProductCard";
import type { ProductLite } from "@/types";

export const dynamic = "force-dynamic";

async function getFeatured(): Promise<ProductLite[]> {
  await connectDB();
  const items = await Product.find({ status: "active" })
    .sort({ ratingAvg: -1, createdAt: -1 })
    .limit(8)
    .lean();
  return serialize(items) as ProductLite[];
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-white/5 dark:text-brand-100">
          New season, new arrivals
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Everything you love, in one place.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Browse thousands of products, build your cart, and check out in seconds.
          A full-stack store powered by Next.js and MongoDB.
        </p>
        <div className="flex gap-3">
          <Link href="/products">
            <Button size="lg">Shop now</Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline">Create account</Button>
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="pb-20">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-foreground">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-brand-600 hover:underline">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
            No products yet. Run <code className="text-foreground">npm run seed</code> to load demo data.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
