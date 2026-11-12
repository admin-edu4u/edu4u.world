"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/components/LocaleProvider";
import {
  ACCOUNT_ROUTES,
  type AccountSection,
} from "@/lib/member/accountSections";
const NAV_ITEMS: {
  section: AccountSection;
  labelKey: "myAccount" | "studentProfile" | "myDocument";
}[] = [
  { section: "account", labelKey: "myAccount" },
  { section: "student-profile", labelKey: "studentProfile" },
  { section: "documents", labelKey: "myDocument" },
];

type Props = {
  active: AccountSection;
  onNavigate?: () => void;
  className?: string;
};

export function MemberAccountSidebar({
  active,
  onNavigate,
  className = "",
}: Props) {
  const t = useT();
  const pathname = usePathname();

  return (
    <aside className={`edu-profile-sidebar edu-member-account-sidebar ${className}`.trim()}>
      <nav className="edu-profile-nav" aria-label={t("account")}>
        {NAV_ITEMS.map((item) => {
          const href = ACCOUNT_ROUTES[item.section];
          const isActive = active === item.section || pathname === href;
          return (
            <Link
              key={item.section}
              href={href}
              scroll={false}
              className={`edu-profile-nav-item${isActive ? " active" : ""}`}
              onClick={onNavigate}
            >
              <span className="edu-profile-nav-label">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MemberAccountMobileNav({ active, onNavigate }: { active: AccountSection; onNavigate?: () => void }) {
  const t = useT();
  return (
    <nav className="edu-member-account-mobile-nav" aria-label={t("account")}>
      {NAV_ITEMS.map((item) => {
        const href = ACCOUNT_ROUTES[item.section];
        const isActive = active === item.section;
        return (
          <Link
            key={item.section}
            href={href}
            scroll={false}
            className={`edu-member-account-mobile-tab${isActive ? " active" : ""}`}
            onClick={onNavigate}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
