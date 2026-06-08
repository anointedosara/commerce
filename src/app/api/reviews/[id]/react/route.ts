import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { summarize, isReactionEmoji } from "@/lib/reviews";

// POST /api/reviews/:id/react  (auth required) — toggle an emoji reaction on a review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return fail("Review not found", 404);

  const { emoji } = (await request.json().catch(() => ({}))) as { emoji?: string };
  if (!isReactionEmoji(emoji)) return fail("Unsupported reaction", 422);

  await connectDB();
  const review = await Review.findById(id);
  if (!review) return fail("Review not found", 404);

  const uid = session.userId;
  const arr = review.reactions as unknown as Array<{ userId: Types.ObjectId; emoji: string }>;
  const idx = arr.findIndex((r) => String(r.userId) === uid && r.emoji === emoji);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.push({ userId: new Types.ObjectId(uid), emoji });
  review.markModified("reactions");
  await review.save();

  return ok(summarize(arr, uid));
}
