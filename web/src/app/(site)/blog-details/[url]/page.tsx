import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { CDN } from "@/lib/cdn";
import { BlogDetailsSidebar, BlogDetailsPathwayCTA } from "@/components/BlogDetailsSidebar";
import { getLocale } from "@/lib/i18n/locale";
import { pickLocalizedFields } from "@/lib/i18n/cms";
import { CMS_I18N_FIELDS } from "@/lib/admin/cmsFields";
import { getDictionary, translate } from "@/lib/i18n/dictionaries";

type Params = { url: string };

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function BlogDetailsPage({ params }: { params: Promise<Params> }) {
  const { url } = await params;
  const supabase = createPublicClient();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = (key: string) => translate(dict, key);

  const { data: rawBlog } = await supabase
    .from("blogs")
    .select("*")
    .eq("b_url_code", url)
    .eq("b_status", 1)
    .single();

  if (!rawBlog) {
    notFound();
  }

  const blog = pickLocalizedFields(rawBlog, CMS_I18N_FIELDS.blog, locale);

  const pageUrl = `https://edu4u.world/blog-details/${url}`;

  return (
    <div className="pb-20">
      <style>{`
        @media (max-width: 767px) { .blog-share { display: none; } }
        .share-post-text { font-size: 16px; }
        .blog-details-img { max-width: 100%; height: auto; }
      `}</style>

      <div className="blog-header">
        <div className="mw-1200 mx-auto">
          <div className="d-flex align-items-center">
            <Link href="/blog">
              <ArrowLeft weight="light" size={24} color="black" className="me-10" />
            </Link>
            <span className="blog-header-title">{t("edu4uBlog")}</span>
          </div>
        </div>
      </div>

      <div className="mw-1200 mx-auto pt-10">
        <div className="col-12 row">
          <div className="col-lg-9 col-12">
            <span className="blog-carousel-header d-block">{blog.b_title}</span>
            <span className="blog-recommend-date d-block pt-3">
              {formatDate(blog.updated_at ?? blog.created_at)}
            </span>
            <img
              src={`${CDN}/images/blogs/${blog.b_img}`}
              className="blog-details-img br-8 mt-5"
              alt={blog.b_title}
            />
            <div className="mt-10">
              <span className="blog-details-desc">
                <div dangerouslySetInnerHTML={{ __html: blog.b_content }} />
              </span>
            </div>
          </div>

          <BlogDetailsSidebar pageUrl={pageUrl} />
        </div>
      </div>

      <BlogDetailsPathwayCTA imgSrc={`${CDN}/images/assets/girl_light_bulb.png`} />
    </div>
  );
}
