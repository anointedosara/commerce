import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { ProductLite } from "@/types";

export function ProductCard({ product, index = 0 }: { product: ProductLite; index?: number }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
      className="group flex animate-fade-in-up flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-square w-full overflow-hidden bg-brand-50 dark:bg-white/5">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🛍️</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-medium text-foreground">{product.title}</h3>
        <p className="text-sm text-muted">
          {product.ratingAvg ? `★ ${product.ratingAvg.toFixed(1)}` : "No reviews yet"}
        </p>
        <p className="mt-auto pt-2 text-lg font-semibold text-foreground">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
