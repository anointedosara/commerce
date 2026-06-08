import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

// DELETE /api/reviews/:id  (author or admin) — remove a review
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return fail("Review not found", 404);

  await connectDB();
  const review = await Review.findById(id);
  if (!review) return fail("Review not found", 404);

  if (String(review.userId) !== session.userId && session.role !== "admin") {
    return fail("You can only delete your own review", 403);
  }

  const productId = review.productId;
  await review.deleteOne();

  // Recompute the product's aggregate rating after removal.
  const agg = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { productId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const product = await Product.findById(productId);
  if (product) {
    product.ratingAvg = Math.round((agg[0]?.avg ?? 0) * 10) / 10;
    product.ratingCount = agg[0]?.count ?? 0;
    await product.save();
  }

  return ok({ deleted: true });
}
