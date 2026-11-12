import { createServiceClient } from "@/lib/supabase/server";
import { isModernPasswordHash } from "@/lib/passwordHash";
import {
  upgradeMemberPasswordToScrypt,
  verifyMemberPassword,
} from "@/lib/member/memberPassword";

export type MemberUserRow = {
  id: number;
  email: string | null;
  username: string | null;
  password: string;
  isadmin: number | null;
  isactive: number | null;
};

export async function authenticateMember(
  email: string,
  password: string,
): Promise<{ ok: true; user: MemberUserRow } | { ok: false; msg: string }> {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    return { ok: false, msg: "Please enter a valid email address." };
  }
  if (!password) {
    return { ok: false, msg: "Please enter password." };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("app_users")
    .select("id,username,email,password,isadmin,isactive")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("[member auth] lookup error:", error);
    return { ok: false, msg: "somethingWentWrong" };
  }
  if (!data) {
    return { ok: false, msg: "Email address is not registered." };
  }
  if (Number(data.isadmin) === 1) {
    return { ok: false, msg: "invalidCredentials" };
  }
  if (Number(data.isactive) !== 1) {
    return { ok: false, msg: "accountInactive" };
  }

  if (!verifyMemberPassword(password, data.password)) {
    return { ok: false, msg: "invalidCredentials" };
  }

  if (!isModernPasswordHash(data.password)) {
    await upgradeMemberPasswordToScrypt(supabase, data.id, password);
  }

  return { ok: true, user: data as MemberUserRow };
}
