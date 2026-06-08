import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import {
  getSession,
  hashPassword,
  comparePassword,
  signToken,
  setSessionCookie,
} from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z
  .object({
    name: z.string().min(1).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6).optional(),
  })
  .refine((d) => !d.newPassword || d.currentPassword, {
    message: "Current password is required to set a new password",
  });

// PATCH /api/account -> update name and/or password for the current user
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return fail("Authentication required", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  const { name, currentPassword, newPassword } = parsed.data;

  await connectDB();
  const user = await User.findById(session.userId);
  if (!user) return fail("User not found", 404);

  if (newPassword) {
    const valid = await comparePassword(currentPassword!, user.passwordHash);
    if (!valid) return fail("Current password is incorrect", 403);
    user.passwordHash = await hashPassword(newPassword);
  }
  if (name) user.name = name;
  await user.save();

  // Re-issue the session token so the cookie reflects the new name.
  const next = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role as "customer" | "admin",
    name: user.name,
  };
  await setSessionCookie(await signToken(next));

  return ok({ user: next });
}
