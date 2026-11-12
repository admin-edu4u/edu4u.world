import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { CareerTabs } from "@/components/CareerTabs";
import { CDN } from "@/lib/cdn";
import { STATUS } from "@/lib/admin/status";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";
import { getSiteSettings } from "@/lib/siteSettings";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

export default async function CareersPage() {
  const settings = await getSiteSettings();
  if (settings.careersHidden) notFound();

  const supabase = createPublicClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  const [{ data: rawCategories }, { data: rawCareers }] = await Promise.all([
    supabase
      .from("career_categories")
      .select("*")
      .eq("cc_status", STATUS.ACTIVE)
      .order("cc_id"),
    supabase.from("careers").select("*").eq("c_status", STATUS.ACTIVE),
  ]);

  const categories = (rawCategories ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.jobCat, locale),
  );
  const careers = (rawCareers ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.job, locale),
  );

  return (
    <div className="pb-20">
      <style>{`
        .event-title-3 {
          display: block;
          width: 100%;
          margin: 0 auto;
        }
        @media screen and (max-width: 767px) {
          img.w-100 { height: 320px; object-fit: cover; }
          .event-title-2, .event-title-3 { width: 340px; max-width: calc(100vw - 40px); margin: 0 auto; }
          .mobile-font-size { font-size: 14px; }
        }
        .scrollable-tabs {
          overflow-x: auto;
          white-space: nowrap;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollable-tabs::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="position-relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${CDN}/images/assets/event-background.png`} className="w-100" alt="Careers background" />
        <div className="col-12 text-center event-overlay-text position-absolute">
          <span className="d-block event-title-1">{t("careers")}</span>
          <span className="d-block event-title-2 pt-5">{t("careersJoin")}</span>
          <span className="d-block event-title-3 pt-5">{t("careersGrow")}</span>
        </div>
      </div>

      <div className="mw-1200 mx-auto">
        <div className="pt-10"></div>
        <CareerTabs categories={categories} careers={careers} />
      </div>
    </div>
  );
}
