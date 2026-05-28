import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import { VIBES } from "@/data/vibes";
import { CARDS } from "@/data/cards";
import { STYLES } from "@/data/styles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const blogPosts = getAllBlogPosts();

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vibes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/trending`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${SITE_URL}/best-family-photo-prompts`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${SITE_URL}/cards`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/styles`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...VIBES.map((v) => ({
      url: `${SITE_URL}/${v.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...CARDS.map((c) => ({
      url: `${SITE_URL}/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...STYLES.map((s) => ({
      url: `${SITE_URL}/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(`${post.date}T00:00:00`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];
}
