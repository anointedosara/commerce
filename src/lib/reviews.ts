/**
 * Shared shaping for reviews, comments, and reactions.
 *
 * `summarize` collapses a raw reaction array into per-emoji counts plus the
 * list of emojis the current viewer has used, so the client can render counts
 * and highlight the viewer's own reactions. These helpers are pure (no runtime
 * deps), so the emoji list is safe to import into client components too.
 */

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export function isReactionEmoji(value: unknown): value is ReactionEmoji {
  return typeof value === "string" && (REACTION_EMOJIS as readonly string[]).includes(value);
}

interface RawReaction {
  userId: unknown;
  emoji: string;
}

export interface ReactionSummary {
  reactions: Record<string, number>;
  myReactions: string[];
}

export function summarize(reactions: RawReaction[] = [], viewerId?: string): ReactionSummary {
  const counts: Record<string, number> = {};
  const mine: string[] = [];
  for (const r of reactions) {
    counts[r.emoji] = (counts[r.emoji] ?? 0) + 1;
    if (viewerId && String(r.userId) === viewerId) mine.push(r.emoji);
  }
  return { reactions: counts, myReactions: mine };
}

interface RawComment {
  _id: unknown;
  userId: unknown;
  userName: string;
  body: string;
  createdAt: Date | string;
  reactions?: RawReaction[];
}

interface RawReview {
  _id: unknown;
  userId: unknown;
  userName: string;
  rating: number;
  body: string;
  createdAt: Date | string;
  reactions?: RawReaction[];
  comments?: RawComment[];
}

export interface ShapedComment extends ReactionSummary {
  _id: string;
  userName: string;
  body: string;
  createdAt: string;
  isMine: boolean;
}

export interface ShapedReview extends ReactionSummary {
  _id: string;
  userName: string;
  rating: number;
  body: string;
  createdAt: string;
  isMine: boolean;
  comments: ShapedComment[];
}

export function shapeComment(c: RawComment, viewerId?: string): ShapedComment {
  return {
    _id: String(c._id),
    userName: c.userName,
    body: c.body,
    createdAt: new Date(c.createdAt).toISOString(),
    isMine: viewerId ? String(c.userId) === viewerId : false,
    ...summarize(c.reactions, viewerId),
  };
}

export function shapeReview(r: RawReview, viewerId?: string): ShapedReview {
  return {
    _id: String(r._id),
    userName: r.userName,
    rating: r.rating,
    body: r.body,
    createdAt: new Date(r.createdAt).toISOString(),
    isMine: viewerId ? String(r.userId) === viewerId : false,
    ...summarize(r.reactions, viewerId),
    comments: (r.comments ?? []).map((c) => shapeComment(c, viewerId)),
  };
}
