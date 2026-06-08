import { Schema, model, models, Types, type InferSchemaType, type Model } from "mongoose";

const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
});

export type CategoryDoc = InferSchemaType<typeof categorySchema> & { _id: Types.ObjectId };

export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>("Category", categorySchema);
