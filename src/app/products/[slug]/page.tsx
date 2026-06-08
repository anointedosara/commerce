import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import { serialize } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { shapeReview } from "@/lib/reviews";
import { formatPrice } from "@/lib/utils";
import { AddToCart } from "@/components/AddToCart";
import { ProductReviews } from "@/components/ProductReviews";
import type { ProductLite } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  await connectDB();

  const doc = await Product.findOne({ slug }).lean();
  if (!doc) notFound();
  const product = serialize(doc) as ProductLite;

  const reviewDocs = await Review.find({ productId: doc._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const reviews = reviewDocs.map((r) => shapeReview(r, session?.userId));
  const viewer = session
    ? { userId: session.userId, name: session.name, role: session.role }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50 dark:bg-white/5">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-7xl">🛍️</div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{product.ratingAvg ? `★ ${product.ratingAvg.toFixed(1)}` : "No reviews"}</span>
            <span>·</span>
            <span>{product.ratingCount ?? 0} reviews</span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {formatPrice(product.price, product.currency)}
          </p>
          <p className="leading-relaxed text-muted">{product.description}</p>
          <p className="text-sm text-muted">
            {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : "Currently unavailable"}
          </p>
          <AddToCart productId={product._id} inStock={(product.stock ?? 0) > 0} />
        </div>
      </div>

      {/* Reviews, comments & reactions */}
      <ProductReviews slug={slug} initialReviews={reviews} viewer={viewer} />
    </div>
  );
}
