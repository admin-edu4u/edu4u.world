import type { HeroBannerSlide } from "@/components/HeroBanner";
import { HERO_BANNER_SLIDES } from "@/lib/heroBannerConfig";
import { createPublicClient } from "@/lib/supabase/server";

/**
 * Fetch active hero banner slides from the `hero_banners` table.
 *
 * Falls back to the static config in `heroBannerConfig.ts` when the table is
 * unavailable or empty, so the homepage always renders a hero.
 */
export async function getHeroBannerSlides(): Promise<HeroBannerSlide[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("hero_banners")
      .select("title, description, button_text, button_url, right_image, background_image")
      .eq("is_active", true)
      .order("sort", { ascending: true });
    if (data && data.length > 0) {
      return data as HeroBannerSlide[];
    }
  } catch {
    // Table missing / RLS / network — fall back to config.
  }
  return HERO_BANNER_SLIDES;
}