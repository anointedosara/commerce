import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { serialize } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { AdminProductForm } from "@/components/AdminProductForm";
import type { ProductLite } from "@/types";

export const dynamic = "force-dynamic";

interface AdminProduct extends ProductLite {
  stock: number;
  status: string;
}

export default async function AdminProductsPage() {
  await connectDB();
  const products = serialize<AdminProduct[]>(
    await Product.find({}).sort({ createdAt: -1 }).limit(100).lean(),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
      </div>

      <div className="mb-6">
        <AdminProductForm />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left text-muted dark:bg-white/5">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <span className={p.stock === 0 ? "text-red-500" : ""}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs capitalize text-brand-700 dark:bg-white/5 dark:text-brand-100">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
