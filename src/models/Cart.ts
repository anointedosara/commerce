import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 1 },
    priceAtAdd: { type: Number, required: true }, // cents, snapshot
  },
  { _id: false },
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true },
);

export type CartDoc = InferSchemaType<typeof cartSchema> & { _id: Types.ObjectId };

export const Cart: Model<CartDoc> =
  (models.Cart as Model<CartDoc>) || model<CartDoc>("Cart", cartSchema);
