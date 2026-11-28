import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.nameAr} | ${site.nameEn}`,
    short_name: site.nameAr,
    description: site.descriptionAr,
    id: "/",
    scope: "/",
    start_url: "/launch",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    background_color: "#1e1229",
    theme_color: "#1e1229",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
