import { createPublicClient } from "@/lib/supabase/server";
import { BlogListing } from "@/components/BlogListing";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

export default async function BlogPage() {
  const supabase = createPublicClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  const [{ data: rawBlogs }, { data: rawCategories }] = await Promise.all([
    supabase
      .from("blogs")
      .select("*")
      .eq("b_status", 1)
      .order("created_at", { ascending: false }),
    supabase.from("blog_cats").select("*").eq("bc_status", 1),
  ]);

  const blogs = (rawBlogs ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.blog, locale)
  );
  const categories = (rawCategories ?? []).map((r) =>
    pickLocalizedFields(r, CMS_I18N_FIELDS.blogCat, locale)
  );

  return (
    <div className="pb-20">
      <style>{`
        .scrollable-tabs {
          overflow-x: auto;
          white-space: nowrap;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollable-tabs::-webkit-scrollbar { display: none; }
        @media (max-width: 767px) {
          .carousel-inner { height: 360px; }
          .blog-carousel-header { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .blog-carousel-sub-header { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        }
      `}</style>

      <div className="blog-header">
        <div className="mw-1200 mx-auto">
          <span className="blog-header-title">{t("edu4uBlog")}</span>
        </div>
      </div>

      <div className="mw-1200 mx-auto">
        <BlogListing blogs={blogs} categories={categories} />
      </div>
    </div>
  );
}
