import type { SupabaseClient } from "@supabase/supabase-js";
import {
  hashPassword,
  isModernPasswordHash,
  verifyPassword,
} from "@/lib/passwordHash";

export function verifyMemberPassword(plain: string, stored: string): boolean {
  if (isModernPasswordHash(stored)) {
    return verifyPassword(plain, stored);
  }
  // Legacy (Laravel-encrypted) passwords are no longer supported.
  return false;
}

export async function upgradeMemberPasswordToScrypt(
  supabase: SupabaseClient,
  userId: number,
  plainPassword: string,
): Promise<void> {
  const { error } = await supabase
    .from("app_users")
    .update({
      password: hashPassword(plainPassword),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) {
    console.error("[member password] upgrade error:", error);
  }
}