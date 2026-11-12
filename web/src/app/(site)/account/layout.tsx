import { redirect } from "next/navigation";
import { requireMemberUserId } from "@/lib/member/requireMember";
import { MemberAccountPage } from "@/components/member-account/MemberAccountPage";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireMemberUserId();
  if (!userId) {
    redirect("/?login=1");
  }
  return (
    <>
      <MemberAccountPage />
      {children}
    </>
  );
}
