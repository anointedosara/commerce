import { NextResponse } from "next/server";

/** JSON success response. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/** JSON error response. */
export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Convert a Mongoose lean doc (with ObjectIds/Dates) into a plain JSON-safe object. */
export function serialize<T = unknown>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
