import type { HeroBannerSlide } from "@/components/HeroBanner";

/**
 * Homepage hero banner slides.
 *
 * Edit this file to change what shows in the hero carousel. Each slide carries
 * its own title, description, CTA button (text + link), a square right-side
 * image, and an optional full-bleed background image.
 *
 * Image paths are resolved from https://edu4u.world/images/<folder>/<filename>.
 * Pass a full http(s) URL to use an external image instead.
 */
export const HERO_BANNER_SLIDES: HeroBannerSlide[] = [
  {
    title: "Find your course in 3 minutes",
    description:
      "Answer a few quick questions and our AI Ubie will match your personality to courses, then suggest the universities that offer them.",
    button_text: "Start Pathway360",
    button_url: "/personality",
    right_image: "assets/ubie_sitting_down_with_arrow.png",
    background_image: "home/home-65f97947ab623.png",
  },
  {
    title: "Scholarships that fit your profile",
    description:
      "Browse funding options tailored to your qualifications and background so you can study with confidence.",
    button_text: "See scholarships",
    button_url: "/explore?tab=scholarship",
    right_image: "assets/girl_mass_com_1.png",
    background_image: "home/home-65f97947ab66f.jpeg",
  },
  {
    title: "Connect with universities directly",
    description:
      "We are an official partner of 100+ local and international institutions. Enquire, book counselling, or arrange a campus tour.",
    button_text: "See universities",
    button_url: "/explore?tab=university",
    right_image: "assets/girl_light_bulb.png",
    background_image: "home/home-65f97947ab687.jpg",
  },
];