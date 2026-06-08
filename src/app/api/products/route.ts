import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { getSession } from "@/lib/auth";
import { ok, fail, serialize } from "@/lib/api";
import { slugify } from "@/lib/utils";

// GET /api/products?search=&category=&sort=&page=&limit=
export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search")?.trim();
  const categorySlug = searchParams.get("category")?.trim();
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") ?? 12)));

  const filter: Record<string, unknown> = { status: "active" };
  if (search) filter.title = { $regex: search, $options: "i" };
  if (categorySlug) {
    const cat = await Category.findOne({ slug: categorySlug }).lean();
    if (cat) filter.categoryId = cat._id;
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { ratingAvg: -1 },
  };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] ?? sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return ok({
    products: serialize(items),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
});

// POST /api/products  (admin only)
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);
  if (session.role !== "admin") return fail("Admin access required", 403);

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

  await connectDB();
  const product = await Product.create({
    ...parsed.data,
    slug: `${slugify(parsed.data.title)}-${Date.now().toString(36)}`,
  });

  return ok({ product: serialize(product.toObject()) }, { status: 201 });
}
