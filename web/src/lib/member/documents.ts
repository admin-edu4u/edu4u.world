import type { SupabaseClient } from "@supabase/supabase-js";
import { nextSerialId } from "@/lib/nextSerialId";

const BUCKET = "admin-uploads";
const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "pdf"]);

function extensionFor(file: File): "pdf" | "jpg" {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  return "jpg";
}

function assertAllowedFile(file: File): void {
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("invalidFileSize");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error("invalidFileType");
  }
}

async function uploadDocumentFile(
  supabase: SupabaseClient,
  file: File,
  filename: string,
): Promise<void> {
  const path = `document/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType =
    file.type ||
    (filename.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(error.message);
  }
}

async function insertDocumentRow(
  supabase: SupabaseClient,
  userId: number,
  type: number,
  filename: string,
  now: string,
): Promise<boolean> {
  const udId = await nextSerialId(supabase, "user_documents", "ud_id");
  const { error } = await supabase.from("user_documents").insert({
    ud_id: udId,
    ud_user_id: userId,
    ud_type: type,
    ud_document: filename,
    ud_status: 1,
    created_at: now,
    updated_at: now,
  });
  if (error) {
    console.error("[member documents] insert error:", error);
  }
  return !error;
}

export async function addMemberDocumentsFromForm(
  supabase: SupabaseClient,
  userId: number,
  form: FormData,
): Promise<{ ok: true } | { ok: false; msg: string }> {
  const now = new Date().toISOString();
  let anyInserted = false;

  const icFront = form.get("ic_front");
  if (icFront instanceof File && icFront.size > 0) {
    try {
      assertAllowedFile(icFront);
      const doc = `ic-front-${crypto.randomUUID().replace(/-/g, "").slice(0, 13)}.jpg`;
      await uploadDocumentFile(supabase, icFront, doc);
      if (await insertDocumentRow(supabase, userId, 1, doc, now)) {
        anyInserted = true;
      }
    } catch (e) {
      const msg = e instanceof Error && e.message === "invalidFileSize" ? "invalidFileSize" : "invalidFileType";
      return { ok: false, msg };
    }
  }

  const icBack = form.get("ic_back");
  if (icBack instanceof File && icBack.size > 0) {
    try {
      assertAllowedFile(icBack);
      const doc = `ic-back-${crypto.randomUUID().replace(/-/g, "").slice(0, 13)}.jpg`;
      await uploadDocumentFile(supabase, icBack, doc);
      if (await insertDocumentRow(supabase, userId, 2, doc, now)) {
        anyInserted = true;
      }
    } catch (e) {
      const msg = e instanceof Error && e.message === "invalidFileSize" ? "invalidFileSize" : "invalidFileType";
      return { ok: false, msg };
    }
  }

  const results = form.getAll("result[]").filter((v): v is File => v instanceof File && v.size > 0);
  for (const file of results) {
    try {
      assertAllowedFile(file);
      const ext = extensionFor(file);
      const doc = `result-${crypto.randomUUID().replace(/-/g, "").slice(0, 13)}.${ext}`;
      await uploadDocumentFile(supabase, file, doc);
      if (await insertDocumentRow(supabase, userId, 3, doc, now)) {
        anyInserted = true;
      }
    } catch (e) {
      const msg = e instanceof Error && e.message === "invalidFileSize" ? "invalidFileSize" : "invalidFileType";
      return { ok: false, msg };
    }
  }

  const resumes = form.getAll("resume[]").filter((v): v is File => v instanceof File && v.size > 0);
  for (const file of resumes) {
    try {
      assertAllowedFile(file);
      const ext = extensionFor(file);
      const doc = `resume-${crypto.randomUUID().replace(/-/g, "").slice(0, 13)}.${ext}`;
      await uploadDocumentFile(supabase, file, doc);
      if (await insertDocumentRow(supabase, userId, 4, doc, now)) {
        anyInserted = true;
      }
    } catch (e) {
      const msg = e instanceof Error && e.message === "invalidFileSize" ? "invalidFileSize" : "invalidFileType";
      return { ok: false, msg };
    }
  }

  if (!anyInserted) {
    return { ok: false, msg: "noDocumentsSelected" };
  }
  return { ok: true };
}

export async function softDeleteMemberDocument(
  supabase: SupabaseClient,
  userId: number,
  documentId: number,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_documents")
    .select("ud_id,ud_user_id")
    .eq("ud_id", documentId)
    .maybeSingle();
  if (error || !data || Number(data.ud_user_id) !== userId) {
    return false;
  }
  const { error: updateError } = await supabase
    .from("user_documents")
    .update({ ud_status: 99, updated_at: new Date().toISOString() })
    .eq("ud_id", documentId);
  return !updateError;
}
