import { NextResponse } from "next/server";

// Dev-only diagnostic endpoint: reports which env vars are present, never their values.
export function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ADMIN_USERNAME_SET: Boolean(process.env.ADMIN_USERNAME),
    ADMIN_PASSWORD_SALT_SET: Boolean(process.env.ADMIN_PASSWORD_SALT),
    ADMIN_PASSWORD_HASH_SET: Boolean(process.env.ADMIN_PASSWORD_HASH),
    ADMIN_PASSWORD_HASH_LEN: process.env.ADMIN_PASSWORD_HASH?.length,
    ADMIN_SESSION_SECRET_SET: Boolean(process.env.ADMIN_SESSION_SECRET),
    SUPABASE_SERVICE_ROLE_KEY_SET: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    NODE_ENV: process.env.NODE_ENV,
    keys: Object.keys(process.env)
      .filter((k) => k.startsWith("ADMIN") || k.startsWith("NEXT_PUBLIC") || k.startsWith("SUPABASE"))
      .sort(),
  });
}
