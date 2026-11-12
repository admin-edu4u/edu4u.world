"use client";

import { useState } from "react";
import Link from "next/link";
import { CDN } from "@/lib/cdn";
import { useT } from "@/components/LocaleProvider";

type Blog = {
  b_id: number;
  b_url_code: string;
  b_cat_id: number;
  b_title: string;
  b_img: string;
  b_content: string;
  b_status: number;
  b_is_star: number;
  created_at: string;
};

type BlogCat = {
  bc_id: number;
  bc_name: string;
};

type Props = {
  blogs: Blog[];
  categories: BlogCat[];
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

export function BlogListing({ blogs, categories }: Props) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<number>(categories[0]?.bc_id ?? 0);

  const starredBlogs = blogs.filter((b) => b.b_is_star === 1);

  return (
    <>
      {/* Starred carousel */}
      <div id="carouselExampleIndicators" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
        <div className="carousel-indicators">
          {starredBlogs.map((b, i) => (
            <button
              key={b.b_id}
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to={i}
              className={i === 0 ? "active" : ""}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="carousel-inner">
          {starredBlogs.map((b, i) => (
            <div key={b.b_id} className={`carousel-item${i === 0 ? " active" : ""}`}>
              <Link href={`/blog-details/${b.b_url_code}`} className="cursor">
                <div className="mt-20 row align-items-center">
                  <div className="col-12 col-lg-6">
                    <img
                      src={`${CDN}/images/blogs/${b.b_img}`}
                      className="carousel-blog-img w-100 h-90"
                      alt={b.b_title}
                      width={1200}
                      height={630}
                    />
                  </div>
                  <div className="col-12 col-lg-6">
                    <span className="d-block blog-carousel-header">{b.b_title}</span>
                    <span className="pt-5 d-block blog-carousel-sub-header pt-3">
                      {stripHtml(b.b_content).substring(0, 100)}...
                    </span>
                    <span className="pt-5 d-block blog-carousel-date">{formatDate(b.created_at)}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="pt-10">
        <div className="scrollable-tabs" style={{ height: "54px" }}>
          <ul className="nav nav-tabs nav-pills flex-nowrap" role="tablist">
            {categories.map((cat) => (
              <li key={cat.bc_id} className="nav-item me-3">
                <a
                  className={`nav-link blog-nav-link${activeTab === cat.bc_id ? " active" : ""}`}
                  role="tab"
                  onClick={() => setActiveTab(cat.bc_id)}
                  style={{ cursor: "pointer" }}
                >
                  {cat.bc_name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="tab-content" id="myTabContent">
          {categories.map((cat) => {
            const catBlogs = blogs.filter((b) => b.b_cat_id === cat.bc_id);
            return (
              <div
                key={cat.bc_id}
                className={`tab-pane fade${activeTab === cat.bc_id ? " show active" : ""}`}
                role="tabpanel"
              >
                <div className="col-12 row">
                  {catBlogs.length === 0 && (
                    <div className="col-12 py-10 text-center">
                      <span className="uni-location">{t("noBlogs")}</span>
                    </div>
                  )}
                  {catBlogs.map((b) => (
                    <div key={b.b_id} className="col-12 col-lg-4 mt-15">
                      <Link href={`/blog-details/${b.b_url_code}`} className="cursor">
                        <img
                          className="w-100 h-8 br-8"
                          src={`${CDN}/images/blogs/${b.b_img}`}
                          alt={b.b_title}
                          width={1952}
                          height={1096}
                          style={{ height: "200px", objectFit: "cover" }}
                        />
                        <div>
                          <span className="blog-recommend-title d-block pt-5">{b.b_title}</span>
                          <span className="blog-recommend-desc pt-3">
                            {stripHtml(b.b_content).substring(0, 100)}...
                          </span>
                          <span className="blog-recommend-date d-block pt-3">{formatDate(b.created_at)}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
