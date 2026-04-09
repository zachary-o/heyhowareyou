import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://ratemyopener.com", changeFrequency: "monthly", priority: 1 },
    { url: "https://ratemyopener.com/pricing", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://ratemyopener.com/tips", changeFrequency: "monthly", priority: 0.7 },
  ];
}