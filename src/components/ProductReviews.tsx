"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  REACTION_EMOJIS,
  type ShapedReview,
  type ShapedComment,
  type ReactionSummary,
} from "@/lib/reviews";

interface Viewer {
  userId: string;
  name: string;
}

function timeAgo(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ReactionBar({
  reactions,
  myReactions,
  canReact,
  onToggle,
}: ReactionSummary & { canReact: boolean; onToggle: (emoji: string) => void }) {
  const list = canReact
    ? REACTION_EMOJIS
    : REACTION_EMOJIS.filter((e) => (reactions[e] ?? 0) > 0);
  if (list.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {list.map((emoji) => {
        const count = reactions[emoji] ?? 0;
        const active = myReactions.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            disabled={!canReact}
            onClick={() => onToggle(emoji)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-all",
              canReact && "hover:border-brand-400 active:scale-90",
              active
                ? "border-brand-600 bg-brand-50 dark:bg-white/10"
                : "border-border",
              !canReact && "cursor-default",
            )}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span key={count} className="animate-pop text-xs font-medium text-muted">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-white/10 dark:text-brand-100">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function ProductReviews({
  slug,
  initialReviews,
  viewer,
}: {
  slug: string;
  initialReviews: ShapedReview[];
  viewer: Viewer | null;
}) {
  const [reviews, setReviews] = useState<ShapedReview[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const hasReviewed = reviews.some((r) => r.isMine);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not submit your review.");
        return;
      }
      setReviews((rs) => [data.review, ...rs]);
      setBody("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleReviewReaction(reviewId: string, emoji: string) {
    if (!viewer) return;
    const res = await fetch(`/api/reviews/${reviewId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as ReactionSummary;
    setReviews((rs) =>
      rs.map((r) =>
        r._id === reviewId ? { ...r, reactions: data.reactions, myReactions: data.myReactions } : r,
      ),
    );
  }

  async function toggleCommentReaction(reviewId: string, commentId: string, emoji: string) {
    if (!viewer) return;
    const res = await fetch(`/api/comments/${commentId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as ReactionSummary;
    setReviews((rs) =>
      rs.map((r) =>
        r._id !== reviewId
          ? r
          : {
              ...r,
              comments: r.comments.map((c) =>
                c._id === commentId
                  ? { ...c, reactions: data.reactions, myReactions: data.myReactions }
                  : c,
              ),
            },
      ),
    );
  }

  async function submitComment(reviewId: string) {
    const text = (drafts[reviewId] ?? "").trim();
    if (!text || busy[reviewId]) return;
    setBusy((b) => ({ ...b, [reviewId]: true }));
    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) return;
      const { comment } = (await res.json()) as { comment: ShapedComment };
      setReviews((rs) =>
        rs.map((r) => (r._id === reviewId ? { ...r, comments: [...r.comments, comment] } : r)),
      );
      setDrafts((d) => ({ ...d, [reviewId]: "" }));
    } finally {
      setBusy((b) => ({ ...b, [reviewId]: false }));
    }
  }

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Reviews {reviews.length > 0 && <span className="text-muted">({reviews.length})</span>}
      </h2>

      {/* Write a review */}
      {!viewer ? (
        <div className="mb-8 rounded-xl border border-dashed border-border p-5 text-sm text-muted">
          <Link href={`/login?next=/products/${slug}`} className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>{" "}
          to write a review, comment, and react.
        </div>
      ) : hasReviewed ? (
        <div className="mb-8 rounded-xl border border-border bg-brand-50/50 p-4 text-sm text-muted dark:bg-white/5">
          ✓ You&apos;ve reviewed this product. Thanks for sharing!
        </div>
      ) : (
        <form onSubmit={submitReview} className="mb-8 rounded-xl border border-border p-5">
          <p className="mb-2 text-sm font-medium text-foreground">Write a review</p>
          <div className="mb-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className={cn(
                  "text-2xl leading-none transition-transform hover:scale-110",
                  n <= rating ? "text-amber-500" : "text-border",
                )}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your thoughts about this product…"
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Posting…" : "Post review"}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first to review this product.</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {reviews.map((r) => (
            <li key={r._id} className="animate-fade-in-up rounded-xl border border-border p-5">
              <div className="flex items-start gap-3">
                <Avatar name={r.userName} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{r.userName}</span>
                    {r.isMine && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-white/10 dark:text-brand-100">
                        You
                      </span>
                    )}
                    <span className="text-amber-500">{"★".repeat(r.rating)}<span className="text-border">{"★".repeat(5 - r.rating)}</span></span>
                    <span className="text-xs text-muted">· {timeAgo(r.createdAt)}</span>
                  </div>
                  {r.body && <p className="mt-1.5 text-sm text-muted">{r.body}</p>}

                  <ReactionBar
                    reactions={r.reactions}
                    myReactions={r.myReactions}
                    canReact={!!viewer}
                    onToggle={(emoji) => toggleReviewReaction(r._id, emoji)}
                  />

                  {/* Comments */}
                  {r.comments.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-3 border-l border-border pl-4">
                      {r.comments.map((c) => (
                        <li key={c._id} className="animate-fade-in">
                          <div className="flex items-start gap-2.5">
                            <Avatar name={c.userName} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-foreground">{c.userName}</span>
                                {c.isMine && (
                                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-white/10 dark:text-brand-100">
                                    You
                                  </span>
                                )}
                                <span className="text-xs text-muted">· {timeAgo(c.createdAt)}</span>
                              </div>
                              <p className="mt-0.5 text-sm text-muted">{c.body}</p>
                              <ReactionBar
                                reactions={c.reactions}
                                myReactions={c.myReactions}
                                canReact={!!viewer}
                                onToggle={(emoji) => toggleCommentReaction(r._id, c._id, emoji)}
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Comment composer */}
                  {viewer ? (
                    <div className="mt-3 flex items-center gap-2 pl-4">
                      <input
                        value={drafts[r._id] ?? ""}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r._id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            submitComment(r._id);
                          }
                        }}
                        placeholder="Add a comment…"
                        className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-brand-500"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => submitComment(r._id)}
                        disabled={busy[r._id] || !(drafts[r._id] ?? "").trim()}
                      >
                        Comment
                      </Button>
                    </div>
                  ) : (
                    r.comments.length === 0 && (
                      <p className="mt-3 pl-4 text-xs text-muted">
                        <Link href={`/login?next=/products/${slug}`} className="text-brand-600 hover:underline">
                          Log in
                        </Link>{" "}
                        to join the conversation.
                      </p>
                    )
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
