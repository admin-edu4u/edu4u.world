import { createServiceClient } from "@/lib/supabase/server";
import { isModernPasswordHash, verifyPassword } from "@/lib/passwordHash";
import { getAdminSession, type AdminSession } from "@/lib/admin/session";
import { redirect } from "next/navigation";

/** Fixed id for admin session cookies (not an app_users row). */
export const ADMIN_PORTAL_USER_ID = 1;

export type AdminUserRow = {
  id: number;
  username: string;
  password: string;
  isactive: number;
};

function authenticateAdminFromEnv(
  username: string,
  password: string,
): { ok: true; user: AdminUserRow } | { ok: false; error: string } | null {
  const expected = process.env.ADMIN_USERNAME?.trim();
  const salt = process.env.ADMIN_PASSWORD_SALT?.trim();
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!expected || !salt || !hash) return null;
  if (username.trim() !== expected) {
    return { ok: false, error: "Invalid credentials" };
  }
  const storedHash = `scrypt$${salt}$${hash}`;
  if (!verifyPassword(password, storedHash)) {
    return { ok: false, error: "Invalid credentials" };
  }
  return {
    ok: true,
    user: {
      id: ADMIN_PORTAL_USER_ID,
      username: expected,
      password: storedHash,
      isactive: 1,
    },
  };
}

async function authenticateAdminFromDb(
  username: string,
  password: string,
): Promise<{ ok: true; user: AdminUserRow } | { ok: false; error: string } | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("admin_accounts")
    .select("id,username,password,isactive")
    .eq("username", username.trim())
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST205") return null;
    return { ok: false, error: "Unable to verify credentials" };
  }
  if (!data) return null;
  if (Number(data.isactive) !== 1) return { ok: false, error: "Account is inactive" };
  if (!isModernPasswordHash(data.password)) {
    return { ok: false, error: "Password must be reset for this account." };
  }
  if (!verifyPassword(password, data.password)) {
    return { ok: false, error: "Invalid credentials" };
  }
  return { ok: true, user: data as AdminUserRow };
}

export async function authenticateAdmin(
  username: string,
  password: string,
): Promise<{ ok: true; user: AdminUserRow } | { ok: false; error: string }> {
  const fromDb = await authenticateAdminFromDb(username, password);
  if (fromDb) return fromDb;

  const fromEnv = authenticateAdminFromEnv(username, password);
  if (fromEnv) return fromEnv;

  if (!process.env.ADMIN_USERNAME && !process.env.ADMIN_PASSWORD_HASH) {
    return { ok: false, error: "Admin login is not configured" };
  }
  return { ok: false, error: "Invalid credentials" };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/sign-in");
  return session;
}
