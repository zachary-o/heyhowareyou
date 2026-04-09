import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/tips"],
      disallow: ["/saved", "/explore", "/sign-in", "/api/"],
    },
    sitemap: "https://ratemyopener.com/sitemap.xml",
  };
}