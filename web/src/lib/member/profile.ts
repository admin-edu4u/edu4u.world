import type { SupabaseClient } from "@supabase/supabase-js";
import { mediaUrl } from "@/lib/admin/media";
import { resolveUserCharacterScores } from "@/lib/admin/resolveUserCharacterScores";

export type MemberProfilePayload = {
  status: true;
  result: { id: number; name: string; grade: string }[];
  character: { id: number; name: string; img: string }[];
  details: {
    id: number;
    name: string;
    contact_no: string;
    email: string;
    profile_pic: string;
    ic_front: { img: string; status: number }[];
    ic_back: { img: string; status: number }[];
    result: { id: number; name: string; img: string; size: number }[];
    resume: { id: number; name: string; img: string; size: number }[];
  };
};

export async function fetchMemberProfile(
  supabase: SupabaseClient,
  userId: number,
): Promise<MemberProfilePayload | { status: false; msg: string }> {
  const { data: u, error } = await supabase
    .from("app_users")
    .select(
      "id,username,email,contact_code,contact_no,profile_pic,gender,character,personality,interests,fullname,first_name,last_name",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !u) {
    return { status: false, msg: "errSystem" };
  }

  const { data: resultRows } = await supabase
    .from("results")
    .select("r_id,r_grade_type,r_subject_id,r_grade,r_cgpa,r_status")
    .eq("r_user_id", userId)
    .eq("r_status", 1);

  const subjectIds = (resultRows ?? [])
    .filter((r) => Number(r.r_grade_type) === 1 && r.r_subject_id)
    .map((r) => r.r_subject_id as number);
  const gradeIds = (resultRows ?? [])
    .filter((r) => Number(r.r_grade_type) === 1 && r.r_grade)
    .map((r) => r.r_grade as number);

  const [{ data: subjects }, { data: grades }] = await Promise.all([
    subjectIds.length
      ? supabase.from("subjects").select("s_id,s_name").in("s_id", subjectIds)
      : Promise.resolve({ data: [] as { s_id: number; s_name: string }[] }),
    gradeIds.length
      ? supabase.from("subject_grades").select("sg_id,sg_grade").in("sg_id", gradeIds)
      : Promise.resolve({ data: [] as { sg_id: number; sg_grade: string | null }[] }),
  ]);

  const subjectMap = new Map((subjects ?? []).map((s) => [s.s_id, s.s_name]));
  const gradeMap = new Map((grades ?? []).map((g) => [g.sg_id, g.sg_grade ?? "-"]));

  const result: MemberProfilePayload["result"] = [];
  for (const r of resultRows ?? []) {
    if (Number(r.r_grade_type) === 2) {
      result.push({ id: r.r_id, name: "CGPA", grade: String(r.r_cgpa ?? "-") });
    } else if (Number(r.r_grade_type) === 1) {
      result.push({
        id: r.r_id,
        name: subjectMap.get(Number(r.r_subject_id)) ?? "Subject",
        grade: gradeMap.get(Number(r.r_grade)) ?? "-",
      });
    }
  }

  const characterScores = await resolveUserCharacterScores(supabase, u);
  const characterIds = characterScores.map((c) => c.id);
  const { data: characterRows } = characterIds.length
    ? await supabase
        .from("characters")
        .select("c_id,c_name,c_img_male,c_img_female")
        .in("c_id", characterIds)
    : { data: [] as { c_id: number; c_name: string; c_img_male: string | null; c_img_female: string | null }[] };

  const isMale = Number(u.gender) === 1;
  const characterMap = new Map((characterRows ?? []).map((c) => [c.c_id, c]));
  const character = characterScores.map((score) => {
    const ch = characterMap.get(score.id);
    const imgFile = isMale ? ch?.c_img_male : ch?.c_img_female;
    return {
      id: score.id,
      name: ch?.c_name ?? `Character ${score.id}`,
      img: imgFile ? mediaUrl("characters", imgFile) : "",
    };
  });

  const { data: documentRows } = await supabase
    .from("user_documents")
    .select("ud_id,ud_type,ud_document,ud_status")
    .eq("ud_user_id", userId)
    .neq("ud_status", 99);

  const ic_front: MemberProfilePayload["details"]["ic_front"] = [];
  const ic_back: MemberProfilePayload["details"]["ic_back"] = [];
  const transcript: MemberProfilePayload["details"]["result"] = [];
  const resume: MemberProfilePayload["details"]["resume"] = [];

  for (const d of documentRows ?? []) {
    const type = Number(d.ud_type);
    const img = mediaUrl("document", d.ud_document);
    if (type === 1) ic_front.push({ img, status: Number(d.ud_status) });
    else if (type === 2) ic_back.push({ img, status: Number(d.ud_status) });
    else if (type === 3) {
      transcript.push({
        id: d.ud_id,
        name: d.ud_document,
        img,
        size: 0,
      });
    } else if (type === 4) {
      resume.push({
        id: d.ud_id,
        name: d.ud_document,
        img,
        size: 0,
      });
    }
  }

  const contact = `${u.contact_code ?? ""}${u.contact_no ?? ""}`.trim();

  const username = (u.username ?? "").trim();
  const fullname = (u.fullname as string | null)?.trim();
  const firstLast = [u.first_name, u.last_name]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(" ");
  const looksLikeEmail = username.includes("@");
  const displayName = fullname || firstLast || (looksLikeEmail ? "" : username);

  return {
    status: true,
    result,
    character,
    details: {
      id: u.id,
      name: displayName,
      contact_no: contact,
      email: u.email ?? "",
      profile_pic: u.profile_pic ? mediaUrl("profile", u.profile_pic) : "",
      ic_front,
      ic_back,
      result: transcript,
      resume,
    },
  };
}

export function normalizeContactNo(raw: string): string {
  let contact = raw.trim().replace(/\D/g, "");
  if (contact.startsWith("0")) contact = contact.slice(1);
  else if (contact.startsWith("60")) contact = contact.slice(2);
  return contact;
}
