import { getMemberSession } from "@/lib/member/session";

export async function requireMemberUserId(): Promise<number | null> {
  const session = await getMemberSession();
  if (!session?.userId || session.isAdmin) return null;
  return session.userId;
}
