"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { uploadAdminFile } from "@/lib/admin/upload";

type SlideFields = {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  right_image: string | null;
  background_image: string | null;
  is_active: boolean;
};

function readSlide(formData: FormData, index: 1 | 2 | 3): SlideFields {
  const f = (k: string) => (formData.get(k) as string) ?? "";
  const file = (k: string) => (formData.get(k) as File | null) ?? null;

  // AdminImageField emits: <name>_keep (comma list of kept filenames),
  // <name>_remove ("1" when cleared), and a file input named <name>.
  const keep = f(`right_image_${index}_keep`)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const removed = f(`right_image_${index}_remove`) === "1";
  const rightFile = file(`right_image_${index}`);

  const bgKeep = f(`background_image_${index}_keep`)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const bgRemoved = f(`background_image_${index}_remove`) === "1";
  const bgFile = file(`background_image_${index}`);

  return {
    id: f(`id_${index}`),
    title: f(`title_${index}`),
    description: f(`description_${index}`),
    button_text: f(`button_text_${index}`),
    button_url: f(`button_url_${index}`),
    right_image: removed && rightFile === null && keep.length === 0 ? null : keep[0] ?? null,
    background_image:
      bgRemoved && bgFile === null && bgKeep.length === 0 ? null : bgKeep[0] ?? null,
    is_active: f(`is_active_${index}`) === "1",
  };
}

export async function updateHeroBannerAction(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const slides: SlideFields[] = [1, 2, 3].map((i) => readSlide(formData, i as 1 | 2 | 3));

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const rightFile = formData.get(`right_image_${i + 1}`) as File | null;
    const bgFile = formData.get(`background_image_${i + 1}`) as File | null;

    let right_image = s.right_image;
    let background_image = s.background_image;

    if (rightFile && rightFile.size > 0) {
      right_image = await uploadAdminFile("hero", rightFile);
    }
    if (bgFile && bgFile.size > 0) {
      background_image = await uploadAdminFile("hero", bgFile);
    }

    if (!s.id) {
      if (!s.title.trim()) continue; // skip empty new slides
      await supabase.from("hero_banners").insert({
        title: s.title,
        description: s.description,
        button_text: s.button_text,
        button_url: s.button_url,
        right_image: right_image || null,
        background_image: background_image || null,
        sort: i,
        is_active: s.is_active,
      });
    } else {
      await supabase
        .from("hero_banners")
        .update({
          title: s.title,
          description: s.description,
          button_text: s.button_text,
          button_url: s.button_url,
          right_image: right_image || null,
          background_image: background_image || null,
          is_active: s.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(s.id));
    }
  }

  revalidatePath("/admin/hero");
  revalidatePath("/");
}