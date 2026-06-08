import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { ok, fail, serialize } from "@/lib/api";

// GET /api/products/:slug
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug }).lean();
  if (!product) return fail("Product not found", 404);

  return ok({ product: serialize(product) });
}
