import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import ExploreClient, { type ExploreType } from "../ExploreClient";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";

const TYPES: ExploreType[] = ["university", "course", "scholarship"];

export default async function ExploreSectionPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!TYPES.includes(type as ExploreType)) notFound();

  const supabase = createPublicClient();
  const locale = await getLocale();

  const [{ data: studyFields }, { data: states }, { data: schFields }] =
    await Promise.all([
      supabase.from("categories").select("c_id,c_name,i18n").order("c_name"),
      supabase.from("states").select("state_id,state_name").order("state_name"),
      // Scholarships store study fields as sub_cats IDs
      supabase.from("sub_cats").select("sc_id,sc_name,i18n").order("sc_name"),
    ]);

  const localizedFields = (studyFields ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.category, locale),
  );
  const localizedSchFields = (schFields ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.subCat, locale),
  );

  return (
    <div className="explore-full pt-80">
      <ExploreClient
        type={type as ExploreType}
        studyFields={localizedFields}
        scholarshipFields={localizedSchFields.map((r) => ({
          c_id: r.sc_id,
          c_name: r.sc_name,
        }))}
        states={states ?? []}
      />
    </div>
  );
}
