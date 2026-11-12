"use client";

import Link from "next/link";
import { Globe, Hamburger, User } from "@phosphor-icons/react/dist/ssr";
import { useMemberAuth } from "@/components/MemberAuthProvider";
import { useSiteFlags, useT } from "@/components/LocaleProvider";

/** Open SiteModals via custom events (shared with home #pathway CTAs). */
function openEduModal(kind: "login" | "signup" | "pathway" | "language") {
  window.dispatchEvent(new CustomEvent("edu4u:open-modal", { detail: { kind } }));
}

const LogoDark = () => (
  <svg className="com-logo" xmlns="http://www.w3.org/2000/svg" width="72" height="26" viewBox="0 0 83 30" fill="none">
    <path d="M0 6.59174V24.4887H12.3744V19.7332H6.03377V17.6623H11.5818V13.3159H6.03377V11.3473H12.2466V6.59174H0Z" fill="#1A124E"/>
    <path d="M22.4989 19.1195C24.9533 19.1195 26.2827 17.7901 26.2827 15.5401C26.2827 13.2902 24.9533 11.9608 22.4989 11.9608H21.2972V19.1195H22.4989ZM15.2634 6.59174H23.0614C28.7884 6.59174 32.5211 10.3245 32.5211 15.5401C32.5211 20.7558 28.7884 24.4886 23.0614 24.4886H15.2634V6.59174Z" fill="#1A124E"/>
    <path d="M34.95 17.0743V6.59174H41.1371V17.1509C41.1371 18.685 41.9554 19.5031 43.2338 19.5031C44.5121 19.5031 45.3302 18.685 45.3302 17.1509V6.59174H51.5174V17.0743C51.5174 21.9831 48.5006 25 43.2338 25C37.9668 25 34.95 21.9831 34.95 17.0743Z" fill="#1A124E"/>
    <path d="M65.8347 17.0743V6.59174H72.022V17.1509C72.022 18.685 72.8395 19.5031 74.1181 19.5031C75.3966 19.5031 76.2148 18.685 76.2148 17.1509V6.59174H82.4021V17.0743C82.4021 21.9831 79.3847 25 74.1181 25C68.8514 25 65.8347 21.9831 65.8347 17.0743Z" fill="#1A124E"/>
    <path d="M59.8966 1.94003L56.9049 6.18799H59.8966V1.94003ZM59.8966 8.81583V7.07915H56.1701C55.99 7.07915 55.8438 6.93308 55.8438 6.75276V6.3394C55.8438 6.27271 55.8644 6.20743 55.9026 6.15264L59.4028 1.13963C59.4637 1.05221 59.5638 1 59.6702 1H60.6314C60.8115 1 60.9576 1.14607 60.9576 1.32633V6.18799H61.8332C62.0134 6.18799 62.1594 6.33406 62.1594 6.51418V6.75276C62.1594 6.93289 62.0134 7.07896 61.8332 7.07896H60.9576V8.81564C60.9576 8.99596 60.8115 9.14203 60.6314 9.14203H60.2228C60.0427 9.14203 59.8966 8.99596 59.8966 8.81583Z" fill="#1A124E"/>
  </svg>
);

export function SiteHeader() {
  const t = useT();
  const { member } = useMemberAuth();
  const { careersHidden } = useSiteFlags();

  const exploreItems = [
    { href: "/explore?tab=university", title: t("uni") },
    { href: "/explore?tab=course", title: t("courses") },
    { href: "/compare-course", title: t("compareCourse") },
    { href: "/visit-campus", title: t("campusVisit") },
  ];

  // Header is always solid white with dark chrome.
  const textColorClass = "header-option-black";

  return (
    <div
      className={`position-fixed w-100 custom-header bg-white`}
      style={{ zIndex: 100, top: 0, left: 0 }}
    >
      <div className="header-bar d-flex justify-content-between align-items-center">
        {/* Left: logo + nav */}
        <div className="d-flex align-items-center header-nav-left">
          <Link href="/" className="d-flex align-items-center">
            <LogoDark />
          </Link>

          <nav className="d-none d-lg-flex align-items-center header-menu">
            {exploreItems.map((item) => (
              <Link
                key={item.href}
                className={`${textColorClass} cursor`}
                href={item.href}
              >
                {item.title}
              </Link>
            ))}

            {!careersHidden ? (
              <Link className={`${textColorClass} cursor`} href="/careers">{t("careers")}</Link>
            ) : null}
            <Link className={`${textColorClass} cursor`} href="/blog">{t("blog")}</Link>
            <span
              className={`${textColorClass} cursor`}
              id="pathway"
              role="button"
              tabIndex={0}
              onClick={() => openEduModal("pathway")}
              onKeyDown={(e) => e.key === "Enter" && openEduModal("pathway")}
            >
              {t("pathway360")}
            </span>
            <Link className={`${textColorClass} cursor`} href="/contact-us">{t("enquireNow")}</Link>
          </nav>
        </div>

        {/* Right: language + auth (desktop) */}
        <div className="d-none d-lg-flex align-items-center header-actions">
          <button
            type="button"
            className={`header-lang-btn ${"header-lang-btn-dark"}`}
            aria-label={t("selectLanguage")}
            onClick={() => openEduModal("language")}
          >
            <Globe size={24} weight="light" color="#1A124E" />
          </button>
          {member ? (
            <Link
              href="/characters"
              className="ms-3 header-profile-btn"
              id="profile_btn"
              aria-label={t("myAccount")}
              title={member.email}
            >
              <User size={24} weight="light" />
            </Link>
          ) : (
            <>
              <span
                className={"header-login-active cursor"}
                id="login_btn"
                role="button"
                tabIndex={0}
                onClick={() => openEduModal("login")}
                onKeyDown={(e) => e.key === "Enter" && openEduModal("login")}
              >
                {t("logIn")}
              </span>
              <span
                className={`cursor text-center ${"header-started-active"}`}
                id="join_btn"
                role="button"
                tabIndex={0}
                onClick={() => openEduModal("signup")}
                onKeyDown={(e) => e.key === "Enter" && openEduModal("signup")}
              >
                {t("join")}
              </span>
            </>
          )}
        </div>

        {/* Mobile: language + hamburger */}
        <div className="d-flex d-lg-none align-items-center gap-2">
          <button
            type="button"
            className={`header-lang-btn ${"header-lang-btn-dark"}`}
            aria-label={t("selectLanguage")}
            onClick={() => openEduModal("language")}
          >
            <Globe size={24} weight="light" color="#1A124E" />
          </button>
          {member ? (
            <Link href="/characters" className="header-profile-btn" id="profile_btn" aria-label={t("myAccount")} title={member.email}>
              <User size={24} weight="light" />
            </Link>
          ) : null}
          <Hamburger size={24}
            weight="light"
            color="#1A124E"
            className="cursor"
            role="button"
            tabIndex={0}
            aria-label="Open menu"
            onClick={() => window.dispatchEvent(new CustomEvent("edu4u:open-drawer"))}
          />
        </div>
      </div>
    </div>
  );
}
