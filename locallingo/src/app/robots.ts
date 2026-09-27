import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/panel", "/mensajes", "/reservas", "/login", "/registro"] },
    sitemap: `${brand.domain}/sitemap.xml`,
  };
}
