import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

// DELETE /api/comments/:id  (author or admin) — remove a comment from a review
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return fail("Comment not found", 404);

  await connectDB();
  const review = await Review.findOne({ "comments._id": id });
  if (!review) return fail("Comment not found", 404);

  const comments = review.comments as unknown as Array<{ _id: Types.ObjectId; userId: Types.ObjectId }>;
  const idx = comments.findIndex((c) => String(c._id) === id);
  if (idx < 0) return fail("Comment not found", 404);

  if (String(comments[idx].userId) !== session.userId && session.role !== "admin") {
    return fail("You can only delete your own comment", 403);
  }

  comments.splice(idx, 1);
  review.markModified("comments");
  await review.save();

  return ok({ deleted: true });
}
