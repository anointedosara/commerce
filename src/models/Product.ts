import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true }, // stored in cents
    currency: { type: String, default: "USD" },
    images: { type: [String], default: [] },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    stock: { type: Number, default: 0 },
    attributes: { type: Schema.Types.Mixed, default: {} },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "draft", "archived"], default: "active", index: true },
  },
  { timestamps: true },
);

export type ProductDoc = InferSchemaType<typeof productSchema> & { _id: Types.ObjectId };

export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) || model<ProductDoc>("Product", productSchema);
