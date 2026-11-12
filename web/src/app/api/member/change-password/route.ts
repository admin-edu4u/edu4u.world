import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/passwordHash";
import { verifyMemberPassword } from "@/lib/member/memberPassword";
import { signupPasswordErrorKey } from "@/lib/password";
import { requireMemberUserId } from "@/lib/member/requireMember";

export async function POST(request: Request) {
  const userId = await requireMemberUserId();
  if (!userId) {
    return NextResponse.json({ status: false, msg: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    curr_pass?: string;
    pass?: string;
    confirm_pass?: string;
  };

  const currPass = String(body.curr_pass ?? "");
  const newPass = String(body.pass ?? "");
  const confirmPass = String(body.confirm_pass ?? "");

  if (!currPass || !newPass || !confirmPass) {
    return NextResponse.json({ status: false, msg: "Please fill in all password fields." });
  }
  if (newPass !== confirmPass) {
    return NextResponse.json({ status: false, msg: "passwordsMustMatch" });
  }

  const passwordKey = signupPasswordErrorKey(newPass);
  if (passwordKey) {
    return NextResponse.json({ status: false, msg: passwordKey });
  }

  const supabase = createServiceClient();
  const { data: user, error } = await supabase
    .from("app_users")
    .select("password")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user?.password) {
    return NextResponse.json({ status: false, msg: "errSystem" }, { status: 500 });
  }
  if (!verifyMemberPassword(currPass, user.password)) {
    return NextResponse.json({ status: false, msg: "invalidCredentials" });
  }

  const { error: updateError } = await supabase
    .from("app_users")
    .update({ password: hashPassword(newPass), updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json({ status: false, msg: "errSystem" }, { status: 500 });
  }

  return NextResponse.json({ status: true, msg: "Password updated successfully." });
}
