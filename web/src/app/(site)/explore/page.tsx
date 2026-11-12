import { createPublicClient } from "@/lib/supabase/server";
import ExploreClient from "./ExploreClient";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "university" } = await searchParams;
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
    <div className="mw-1200 mx-auto pt-80">
      <ExploreClient
        initialTab={tab}
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
