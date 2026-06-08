import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const messageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: "" },
    body: { type: String, required: true },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type MessageDoc = InferSchemaType<typeof messageSchema> & { _id: Types.ObjectId };

export const Message: Model<MessageDoc> =
  (models.Message as Model<MessageDoc>) || model<MessageDoc>("Message", messageSchema);
