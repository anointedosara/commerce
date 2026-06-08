import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { comparePassword, signToken, setSessionCookie } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail("Email and password are required", 422);
  const { email, password } = parsed.data;

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return fail("Invalid email or password", 401);
  }

  const session = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role as "customer" | "admin",
    name: user.name,
  };
  await setSessionCookie(await signToken(session));

  return ok({ user: session });
}
