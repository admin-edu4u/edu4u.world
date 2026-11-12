import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/server";
import {
  AdminField,
  AdminForm,
  AdminFormActions,
  AdminFormSection,
  AdminImageField,
  AdminPageHeader,
} from "@/components/admin/AdminUi";
import { updateHeroBannerAction } from "./actions";
import { SubmitButton } from "@/components/admin/DeleteButton";

export default async function AdminHeroBannersPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: rows } = await supabase
    .from("hero_banners")
    .select("*")
    .order("sort", { ascending: true });

  return (
    <>
      <AdminPageHeader title="Hero banners" />
      <p className="text-muted mb-16">
        Each slide has its own title, description, CTA button (text + link), a
        square right-side image, and an optional full-bleed background image.
        Unchecked slides are hidden from the homepage.
      </p>

      <AdminForm action={updateHeroBannerAction} encType="multipart/form-data">
        <AdminFormSection title="Slide 1" description="First banner shown on the homepage.">
          <HeroBannerFields index={1} row={rows?.[0]} />
        </AdminFormSection>
        <AdminFormSection title="Slide 2" description="Second banner in the carousel.">
          <HeroBannerFields index={2} row={rows?.[1]} />
        </AdminFormSection>
        <AdminFormSection title="Slide 3" description="Third banner in the carousel.">
          <HeroBannerFields index={3} row={rows?.[2]} />
        </AdminFormSection>
        <AdminFormActions backHref="/admin/dashboard">
          <SubmitButton />
        </AdminFormActions>
      </AdminForm>
    </>
  );
}

function HeroBannerFields({
  index,
  row,
}: {
  index: number;
  row?: {
    id?: number;
    title?: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    right_image?: string;
    background_image?: string;
    is_active?: boolean;
  };
}) {
  return (
    <>
      <input type="hidden" name={`id_${index}`} value={row?.id ?? ""} />
      <input type="hidden" name={`is_active_${index}`} value={row?.is_active ? "1" : "0"} />

      <AdminField label="Title" span={6}>
        <input
          name={`title_${index}`}
          className="form-control"
          defaultValue={row?.title ?? ""}
          required
        />
      </AdminField>
      <AdminField label="Button text" span={6}>
        <input
          name={`button_text_${index}`}
          className="form-control"
          defaultValue={row?.button_text ?? ""}
        />
      </AdminField>

      <AdminField label="Description" span={12}>
        <textarea
          name={`description_${index}`}
          className="form-control"
          rows={3}
          defaultValue={row?.description ?? ""}
        />
      </AdminField>

      <AdminField label="Button URL" span={6}>
        <input
          name={`button_url_${index}`}
          className="form-control"
          defaultValue={row?.button_url ?? ""}
        />
      </AdminField>
      <AdminField label="Active" span={6}>
        <select
          name={`is_active_${index}`}
          className="form-select"
          defaultValue={row?.is_active ? "1" : "0"}
        >
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      </AdminField>

      <AdminImageField
        name={`right_image_${index}`}
        label="Right-side square image"
        folder="hero"
        filename={row?.right_image ?? null}
        span={6}
      />
      <AdminImageField
        name={`background_image_${index}`}
        label="Background image"
        folder="hero"
        filename={row?.background_image ?? null}
        span={6}
      />
    </>
  );
}