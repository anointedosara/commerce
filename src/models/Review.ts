import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const reactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { _id: false },
);

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    body: { type: String, required: true },
    reactions: { type: [reactionSchema], default: [] },
  },
  { timestamps: true },
);

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    body: { type: String, default: "" },
    reactions: { type: [reactionSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true },
);

export type ReviewDoc = InferSchemaType<typeof reviewSchema> & { _id: Types.ObjectId };

export const Review: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) || model<ReviewDoc>("Review", reviewSchema);
