import { HeaderWrapper } from "@/components/HeaderWrapper";
import { LegacySiteScripts } from "@/components/LegacySiteScripts";
import { LocaleProvider } from "@/components/LocaleProvider";
import { MemberAuthProvider } from "@/components/MemberAuthProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteModals } from "@/components/SiteModals";
import { SiteNotFound } from "@/components/SiteNotFound";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";
import { getMemberSession } from "@/lib/member/session";
import { getSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export default async function RootNotFound() {
  const locale = await getLocale();
  const [dictionary, settings, memberSession] = await Promise.all([
    getDictionary(locale),
    getSiteSettings(),
    getMemberSession(),
  ]);
  const initialMember = memberSession
    ? { userId: memberSession.userId, email: memberSession.email }
    : null;

  return (
    <LocaleProvider
      locale={locale}
      dictionary={dictionary}
      flags={{ careersHidden: settings.careersHidden }}
    >
      <MemberAuthProvider initialMember={initialMember}>
        <div className="d-flex flex-column">
          <HeaderWrapper />
          <SiteNotFound />
          <SiteFooter />
          <SiteModals />
          <LegacySiteScripts />
        </div>
      </MemberAuthProvider>
    </LocaleProvider>
  );
}
