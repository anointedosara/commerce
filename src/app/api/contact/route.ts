import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  subject: z.string().optional(),
  body: z.string().min(1, "Message is required"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);

  await connectDB();
  await Message.create(parsed.data);

  return ok({ success: true }, { status: 201 });
}
