"use client";

import Link from "next/link";
import { FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { useSiteFlags, useT } from "@/components/LocaleProvider";

const EduLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="83" height="30" viewBox="0 0 83 30" fill="none">
    <path d="M 0 4.79404 V 18.3666 H 9.2808 V 14.7999 H 4.52533 V 13.2467 H 8.68635 V 9.987 H 4.52533 V 8.51047 H 9.18495 V 4.94385 H 0 Z" fill="white"/>
    <path d="M 16.8742 13.9052 C 18.715 13.9052 19.712 12.9383 19.712 11.302 C 19.712 9.66567 18.715 8.69884 16.8742 8.69884 H 15.9729 V 14.3397 H 16.8742 Z M 11.4475 4.79404 H 17.2961 C 21.5913 4.79404 24.3908 7.50873 24.3908 11.302 C 24.3908 15.0952 21.5913 17.81 17.2961 17.81 H 11.4475 V 4.94385 Z" fill="white"/>
    <path d="M 26.2125 12.4177 V 4.94385 H 30.8528 V 12.8633 C 30.8528 13.5891 31.4665 14.1841 32.4254 14.1841 C 33.3841 14.1841 33.9977 13.5891 33.9977 12.4735 V 4.94385 H 38.638 V 12.8057 C 38.638 15.9878 36.3755 18.1818 32.4254 18.1818 C 28.4751 18.1818 26.2125 15.9878 26.2125 12.4177 Z" fill="white"/>
    <path d="M 49.376 12.4177 V 4.94385 H 54.0165 V 12.8633 C 54.0165 13.5891 54.6296 14.1841 55.5886 14.1841 C 56.5475 14.1841 57.1611 13.5891 57.1611 12.4735 V 4.94385 H 61.8016 V 12.8057 C 61.8016 15.9878 59.5385 18.1818 55.5886 18.1818 C 51.6385 18.1818 49.376 15.9878 49.376 12.4177 Z" fill="white"/>
    <path d="M 44.9224 1.41093 L 42.6787 4.50036 H 44.9224 V 1.45502 Z M 44.9224 6.41151 V 5.30936 H 42.1276 C 41.9925 5.14847 41.8829 5.04224 41.8829 4.9111 V 4.75455 C 41.8829 4.56197 41.8983 4.51449 41.9269 4.47465 L 44.5521 0.828822 C 44.5978 0.765244 44.6728 0.727273 44.7527 0.727273 H 45.4736 C 45.6086 0.727273 45.7182 0.833505 45.7182 0.964604 V 4.64099 H 46.3749 C 46.51 4.50036 46.6195 4.60659 46.6195 4.73759 V 5.06457 C 46.6195 5.0421 46.51 5.14833 46.3749 5.14833 H 45.7182 V 6.61173 C 45.7182 6.54252 45.6086 6.64875 45.4736 6.64875 H 45.1671 C 45.032 6.64875 44.9224 6.54252 44.9224 6.41151 Z" fill="white"/>
  </svg>
);

const XhsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.25" y="2.46023" width="19.5" height="18.9091" rx="3" fill="white"/>
    <path d="M 9.56693 13.7958 C 9.7542 13.853 10.1415 13.8786 10.8111 13.8644" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 4.86538 10.9776 C 4.86538 11.8003 4.76038 12.8707 4.5 13.2759" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 6.6673 9.82385 V 13.9639 C 6.66741 13.5883 6.65637 13.6354 6.63481 13.6794 C 6.61326 13.7233 6.58161 13.7633 6.54168 13.797 C 6.50176 13.8308 6.45432 13.8575 6.4021 13.8758 C 6.34987 13.894 6.29388 13.9035 6.23731 13.9036 H 5.84692" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 11.2986 12.651 H 10.889 C 10.346 12.651 10.234 12.7001 10.4575 12.2878 L 11.0475 11.2003" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 18.8877 10.0991 C 19.1935 10.1974 19.3773 10.374 19.5004 10.6226" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 15.3237 10.3473 H 17.5768 C 17.816 10.3473 18.0083 10.509 18.0083 10.7101 V 12.24" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 16.3514 9.73295 V 14.5371" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 13.2997 10.3441 V 14.299 M 11.7832 13.8657 H 14.6063 M 12.2582 10.3441 H 14.2613" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 8.42873 10.9776 C 8.42873 11.8003 8.53373 12.8707 8.79413 13.2759" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 11.3415 11.1985 H 10.63 C 10.0865 11.1985 9.97462 11.2477 10.1984 10.8354 L 10.7881 9.74785" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 14.9356 11.9812 H 18.7863 C 19.0255 11.9812 19.2182 12.1428 19.2182 12.344 V 13.925 C 19.2184 13.5505 19.2073 13.5977 19.1857 13.6417 C 19.1642 13.6856 19.1326 13.7256 19.0926 13.7593 C 19.0527 13.7929 19.0052 13.8197 18.953 13.838 C 18.9008 13.8563 18.8448 13.8657 18.7882 13.8658 H 18.0878" stroke="#1A124E" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function SiteFooter() {
  const t = useT();
  const { careersHidden } = useSiteFlags();

  return (
    <div className="bg-blue pt-20 pb-20">
      <div className="mw-1024 mx-auto">
        {/* Desktop layout */}
        <div className="d-none d-md-flex">
          {/* Products column */}
          <div className="col-3">
            <span className="footer-title">{t("products")}</span>
            <div className="mt-5">
              <span className="footer-sub-title d-block pt-5">
                <Link href="/explore?tab=university" style={{ color: "white" }}>{t("uni")}</Link>
              </span>
              <span className="footer-sub-title d-block pt-5">
                <Link href="/explore?tab=scholarship" style={{ color: "white" }}>{t("scholarships")}</Link>
              </span>
              <span className="footer-sub-title d-block pt-5">
                <Link href="/explore?tab=course" style={{ color: "white" }}>{t("courses")}</Link>
              </span>
              <span className="footer-sub-title d-block pt-5">
                <Link href="/compare-course" style={{ color: "white" }}>{t("comparisonTool")}</Link>
              </span>
              <span className="footer-sub-title d-block pt-5" id="p a t h w a y" style={{ cursor: "pointer" }}>
                {t("pathway360")}
              </span>
            </div>
          </div>

          {/* About us column */}
          <div className="col-2">
            <span className="footer-title">{t("aboutUs")}</span>
            <div className="mt-5">
              {!careersHidden ? (
                <span className="footer-sub-title d-block pt-5">
                  <Link href="/careers" style={{ color: "white" }}>{t("careers")}</Link>
                </span>
              ) : null}
              <span className="footer-sub-title d-block pt-5">
                <Link href="/contact-us" style={{ color: "white" }}>{t("contactUs")}</Link>
              </span>
              <span className="footer-sub-title d-block pt-5">
                <Link href="/blog" style={{ color: "white" }}>{t("blog")}</Link>
              </span>
            </div>
          </div>

          {/* Support column */}
          <div className="col-2">
            <span className="footer-title">{t("support")}</span>
            <div className="mt-5">
              <span className="footer-sub-title d-block pt-5">
                <Link href="/terms" style={{ color: "white" }}>{t("terms")}</Link>
              </span>
              <span className="footer-sub-title d-block pt-5">
                <Link href="/privacy" style={{ color: "white" }}>{t("privacy")}</Link>
              </span>
            </div>
          </div>

          {/* Logo + social + copyright */}
          <div className="col-5 d-flex flex-column align-items-end justify-content-between">
            <EduLogo />
            <div className="d-flex flex-column align-items-end">
              <div className="d-flex mb-3">
                <Link className="me-5" href="https://www.facebook.com/edu4Uworld/">
                  <FacebookLogo size={24} weight="fill" color="white" />
                </Link>
                <Link className="me-5" href="https://www.instagram.com/edu4u_/">
                  <InstagramLogo size={24} weight="fill" color="white" />
                </Link>
                <Link href="https://www.xiaohongshu.com/user/profile/644e67d8000000002a00bf55">
                  <XhsIcon />
                </Link>
              </div>
              <div style={{ color: "#FFFFFF", opacity: 0.5, fontSize: 13, textAlign: "right", lineHeight: 1.4 }}>
                Copyright &copy; 2024 EDU4U SDN. BHD.
                <br />
                202301019089 (1513011-U)
              </div>
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="d-md-none col-12 row">
          <div className="col-6 ps-10">
            <span className="footer-title">{t("products")}</span>
            <div className="mb-15">
              <span className="footer-sub-title d-block pt-3"><Link href="/explore" style={{ color: "white" }}>{t("uni")}</Link></span>
              <span className="footer-sub-title d-block pt-3"><Link href="/explore" style={{ color: "white" }}>{t("scholarships")}</Link></span>
              <span className="footer-sub-title d-block pt-3"><Link href="/explore" style={{ color: "white" }}>{t("courses")}</Link></span>
              <span className="footer-sub-title d-block pt-3"><Link href="/compare-course" style={{ color: "white" }}>{t("comparisonTool")}</Link></span>
              <span className="footer-sub-title d-block pt-3" style={{ cursor: "pointer" }}>{t("pathway360")}</span>
            </div>
            <span className="footer-title mt-20">{t("aboutUs")}</span>
            <div className="mb-15">
              {!careersHidden ? (
                <span className="footer-sub-title d-block pt-3"><Link href="/careers" style={{ color: "white" }}>{t("careers")}</Link></span>
              ) : null}
              <span className="footer-sub-title d-block pt-3"><Link href="/contact-us" style={{ color: "white" }}>{t("contactUs")}</Link></span>
              <span className="footer-sub-title d-block pt-3"><Link href="/blog" style={{ color: "white" }}>{t("blog")}</Link></span>
            </div>
            <span className="footer-title">{t("support")}</span>
            <div className="mb-15">
              <span className="footer-sub-title d-block pt-3"><Link href="/terms" style={{ color: "white" }}>{t("terms")}</Link></span>
              <span className="footer-sub-title d-block pt-3"><Link href="/privacy" style={{ color: "white" }}>{t("privacy")}</Link></span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex justify-content-end">
              <EduLogo />
            </div>
          </div>
        </div>

        {/* Mobile social + copyright */}
        <div className="d-md-none col-12 d-flex justify-content-between mt-10">
          <div>
            <Link href="https://www.facebook.com/edu4Uworld/">
              <FacebookLogo size={24} weight="fill" color="white" className="ms-7 me-5" />
            </Link>
            <Link href="https://www.instagram.com/edu4u_/">
              <InstagramLogo size={24} weight="fill" color="white" />
            </Link>
          </div>
          <div className="float-end me-7" style={{ fontSize: 14, color: "#FFFFFF", opacity: 0.5, alignContent: "center" }}>
            &copy; 2024 EDU4U SDN. BHD.
            <div>202301019089 (1513011-U)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
