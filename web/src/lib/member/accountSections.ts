export type AccountSection = "account" | "student-profile" | "documents";

export const ACCOUNT_ROUTES: Record<AccountSection, string> = {
  account: "/account",
  "student-profile": "/account/student-profile",
  documents: "/account/documents",
};

export function accountSectionFromPath(pathname: string): AccountSection | null {
  if (pathname === ACCOUNT_ROUTES.account) return "account";
  if (pathname === ACCOUNT_ROUTES["student-profile"]) return "student-profile";
  if (pathname === ACCOUNT_ROUTES.documents) return "documents";
  return null;
}
