"use client";

import { CDN } from "@/lib/cdn";
import { BlogDetailsShare } from "@/components/BlogDetailsShare";
import { FacebookLogo, InstagramLogo, TwitterLogo, UserCircle } from "@phosphor-icons/react/dist/ssr";
import { useT } from "@/components/LocaleProvider";

type Props = {
  pageUrl: string;
};

export function BlogDetailsSidebar({ pageUrl }: Props) {
  const t = useT();
  function openPathwayModal() {
    window.dispatchEvent(new CustomEvent("edu4u:open-modal", { detail: { kind: "pathway" } }));
  }

  return (
    <div className="blog-share col-3">
      <div className="blog-share-div text-center">
        <UserCircle
          weight="fill"
          size={24}
          color="#1F1F1F"
          style={{ display: "block", margin: "0 auto" }}
        />
        <span className="d-block pt-5">{t("blogDesc")}</span>
        <button className="mt-7" onClick={openPathwayModal}>
          {t("registerNow")}
        </button>
      </div>
      <span className="share-post-text d-block pt-15">{t("sharePost")}</span>
      <div className="d-flex mt-5">
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer">
          <TwitterLogo size={24} weight="fill" color="#999999" className="me-10" />
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&display=popup`} target="_blank" rel="noopener noreferrer">
          <FacebookLogo size={24} weight="fill" color="#999999" className="me-10" />
        </a>
        <BlogDetailsShare />
      </div>
    </div>
  );
}

export function BlogDetailsPathwayCTA({ imgSrc }: { imgSrc: string }) {
  const t = useT();
  function openPathwayModal() {
    window.dispatchEvent(new CustomEvent("edu4u:open-modal", { detail: { kind: "pathway" } }));
  }

  return (
    <div className="mt-20">
      <div className="mw-1024 mx-auto">
        <div className="col-12 m-0 row pt-20 pb-lg-20 align-items-center">
          <div className="col-lg-7 col-12 order-2 order-lg-1 mt-lg-0 mt-20">
            <span className="d-block text-center text-lg-start home-title-3 mb-3">
              {t("blogDesc")}
            </span>
            <a className="home-btn-get-started-2" style={{ cursor: "pointer" }} onClick={openPathwayModal}>
              {t("registerNow")}
            </a>
          </div>
          <div className="col-lg-5 col-12 d-flex justify-lg-content-end justify-content-center order-1 order-lg-2">
            <img src={imgSrc} alt="Register" />
          </div>
        </div>
      </div>
    </div>
  );
}