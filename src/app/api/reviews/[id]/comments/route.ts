import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Review } from "@/models/Review";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { shapeComment } from "@/lib/reviews";

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

// POST /api/reviews/:id/comments  (auth required) — comment under a review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return fail("Review not found", 404);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Comment text is required", 422);

  await connectDB();
  const review = await Review.findById(id);
  if (!review) return fail("Review not found", 404);

  const comments = review.comments as unknown as Array<{ toObject(): unknown }>;
  comments.push({
    userId: new Types.ObjectId(session.userId),
    userName: session.name,
    body: parsed.data.body,
    reactions: [],
  } as never);
  await review.save();

  const created = comments[comments.length - 1];
  return ok(
    { comment: shapeComment(created.toObject() as Parameters<typeof shapeComment>[0], session.userId) },
    { status: 201 },
  );
}
