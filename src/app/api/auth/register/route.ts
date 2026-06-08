import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }
  const { name, email, password } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return fail("An account with that email already exists", 409);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
  });

  const session = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role as "customer" | "admin",
    name: user.name,
  };
  await setSessionCookie(await signToken(session));

  return ok({ user: session }, { status: 201 });
}
