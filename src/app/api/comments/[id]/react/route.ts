import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { summarize, isReactionEmoji } from "@/lib/reviews";

// POST /api/comments/:id/react  (auth required) — toggle an emoji reaction on a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return fail("Comment not found", 404);

  const { emoji } = (await request.json().catch(() => ({}))) as { emoji?: string };
  if (!isReactionEmoji(emoji)) return fail("Unsupported reaction", 422);

  await connectDB();
  // Comments are embedded; find the parent review that holds this comment.
  const review = await Review.findOne({ "comments._id": id });
  if (!review) return fail("Comment not found", 404);

  const comments = review.comments as unknown as Array<{
    _id: Types.ObjectId;
    reactions: Array<{ userId: Types.ObjectId; emoji: string }>;
  }>;
  const comment = comments.find((c) => String(c._id) === id);
  if (!comment) return fail("Comment not found", 404);

  const uid = session.userId;
  const arr = comment.reactions;
  // One reaction per user: remove any existing reaction by this user first.
  const hadSame = arr.some((r) => String(r.userId) === uid && r.emoji === emoji);
  for (let i = arr.length - 1; i >= 0; i--) {
    if (String(arr[i].userId) === uid) arr.splice(i, 1);
  }
  // Re-clicking the current emoji toggles it off; a different one replaces it.
  if (!hadSame) arr.push({ userId: new Types.ObjectId(uid), emoji });
  review.markModified("comments");
  await review.save();

  return ok(summarize(arr, uid));
}
