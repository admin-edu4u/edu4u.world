import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchMemberProfile, normalizeContactNo } from "@/lib/member/profile";
import { requireMemberUserId } from "@/lib/member/requireMember";

export async function GET() {
  const userId = await requireMemberUserId();
  if (!userId) {
    return NextResponse.json({ status: false, msg: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const payload = await fetchMemberProfile(supabase, userId);
  if (!payload.status) {
    return NextResponse.json(payload, { status: 500 });
  }
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const userId = await requireMemberUserId();
  if (!userId) {
    return NextResponse.json({ status: false, msg: "Unauthorized" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const supabase = createServiceClient();

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const contactRaw = String(form.get("contact_no") ?? "");
    const updates: Record<string, string> = {
      username: name,
      contact_no: normalizeContactNo(contactRaw),
      updated_at: new Date().toISOString(),
    };

    const file = form.get("profile_pic");
    if (file instanceof File && file.size > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase() === "png" ? "png" : "jpg";
      const filename = `profile-${userId}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("admin-uploads")
        .upload(`profile/${filename}`, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });
      if (uploadError) {
        console.error("[member profile] upload error:", uploadError);
        return NextResponse.json({ status: false, msg: "errSystem" }, { status: 500 });
      }
      updates.profile_pic = filename;
    }

    const { error } = await supabase.from("app_users").update(updates).eq("id", userId);
    if (error) {
      console.error("[member profile] update error:", error);
      return NextResponse.json({ status: false, msg: "errSystem" }, { status: 500 });
    }
    return NextResponse.json({ status: true, msg: "User details have been updated" });
  }

  const body = (await request.json()) as { name?: string; contact_no?: string };
  const name = String(body.name ?? "").trim();
  const { error } = await supabase
    .from("app_users")
    .update({
      username: name,
      contact_no: normalizeContactNo(String(body.contact_no ?? "")),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[member profile] update error:", error);
    return NextResponse.json({ status: false, msg: "errSystem" }, { status: 500 });
  }
  return NextResponse.json({ status: true, msg: "User details have been updated" });
}
