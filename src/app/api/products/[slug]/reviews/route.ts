import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { shapeReview } from "@/lib/reviews";

// GET /api/products/:slug/reviews  (public — anyone can read)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(); // optional: lets us flag the viewer's own reactions/reviews
  await connectDB();
  const product = await Product.findOne({ slug }).select("_id").lean();
  if (!product) return fail("Product not found", 404);

  const reviews = await Review.find({ productId: product._id }).sort({ createdAt: -1 }).lean();
  return ok({
    reviews: reviews.map((r) => shapeReview(r, session?.userId)),
    viewer: session ? { userId: session.userId, name: session.name } : null,
  });
}

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().optional(),
});

// POST /api/products/:slug/reviews  (auth required)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const { slug } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("A rating between 1 and 5 is required", 422);

  await connectDB();
  const product = await Product.findOne({ slug });
  if (!product) return fail("Product not found", 404);

  const existing = await Review.findOne({
    productId: product._id,
    userId: session.userId,
  }).select("_id").lean();
  if (existing) return fail("You have already reviewed this product", 409);

  const review = await Review.create({
    productId: product._id,
    userId: session.userId,
    userName: session.name,
    rating: parsed.data.rating,
    body: parsed.data.body ?? "",
  });

  // Recompute aggregate rating
  const agg = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { productId: product._id } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  product.ratingAvg = Math.round((agg[0]?.avg ?? 0) * 10) / 10;
  product.ratingCount = agg[0]?.count ?? 0;
  await product.save();

  return ok({ review: shapeReview(review.toObject(), session.userId) }, { status: 201 });
}
