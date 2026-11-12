// Main CDN for assets that are live on edu4u.world (e.g. university logos).
export const CDN = "https://edu4u.world";

// Some media sets are not hosted on edu4u.world yet (university gallery
// images, internationalschool images/logos) and 500 there. These are staged
// in web/public/images/..., so default to app-relative URLs that ship with
// the app. Override with NEXT_PUBLIC_MEDIA_CDN if they move to a CDN later.
export const MEDIA_CDN = process.env.NEXT_PUBLIC_MEDIA_CDN ?? "";
