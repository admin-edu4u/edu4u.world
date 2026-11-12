import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { requireMemberUserId } from "@/lib/member/requireMember";
import {
  addMemberDocumentsFromForm,
  softDeleteMemberDocument,
} from "@/lib/member/documents";

export async function POST(request: NextRequest) {
  const userId = await requireMemberUserId();
  if (!userId) {
    return NextResponse.json({ status: false, msg: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const supabase = createServiceClient();
  const result = await addMemberDocumentsFromForm(supabase, userId, form);
  if (!result.ok) {
    return NextResponse.json({ status: false, msg: result.msg });
  }
  return NextResponse.json({
    status: true,
    msg: "User document have been added successfully",
  });
}

export async function DELETE(request: NextRequest) {
  const userId = await requireMemberUserId();
  if (!userId) {
    return NextResponse.json({ status: false, msg: "Unauthorized" }, { status: 401 });
  }

  const idRaw = request.nextUrl.searchParams.get("id");
  const documentId = Number(idRaw);
  if (!Number.isFinite(documentId) || documentId <= 0) {
    return NextResponse.json({ status: false, msg: "errSystem" });
  }

  const supabase = createServiceClient();
  const ok = await softDeleteMemberDocument(supabase, userId, documentId);
  if (!ok) {
    return NextResponse.json({ status: false, msg: "errSystem" });
  }
  return NextResponse.json({ status: true, msg: "Document removed." });
}
