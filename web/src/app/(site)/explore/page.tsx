import { redirect } from "next/navigation";

// Legacy tabbed entry point: /explore and /explore?tab=... now redirect
// to the dedicated section pages.
export default async function ExploreIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  redirect(tab === "course" || tab === "scholarship" ? `/explore/${tab}` : "/explore/university");
}
