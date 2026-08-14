import "server-only";

import {
  createRolinoBlogClient,
  getBlogSitemapEntries,
  getPublishedArticle,
  getPublishedArticles,
} from "@rolino/nextjs-blog";
import { cache } from "react";

import type { BlogPost, BlogPostMeta } from "@/lib/blog";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";

type RolinoArticleResult = Awaited<ReturnType<typeof getPublishedArticle>>;

export type BlogPostResult =
  | { post: BlogPost }
  | { redirect: { from: string; to: string; permanent: true } }
  | null;

export function isRolinoBlogConfigured() {
  return Boolean(
    process.env.ROLINO_URL?.trim()
      && process.env.ROLINO_BLOG_SITE_ID?.trim()
      && process.env.ROLINO_BLOG_DELIVERY_TOKEN?.trim(),
  );
}

export const getAllPublishedBlogPosts = cache(async (): Promise<BlogPostMeta[]> => {
  const localPosts = getAllBlogPosts();

  if (!isRolinoBlogConfigured()) {
    return localPosts;
  }

  try {
    const client = createRolinoBlogClient();
    const remotePosts = (await getPublishedArticles(client)).map(toPostMeta);
    const localSlugs = new Set(localPosts.map((post) => post.slug));

    return [...localPosts, ...remotePosts.filter((post) => !localSlugs.has(post.slug))]
      .sort((left, right) => (left.date < right.date ? 1 : -1));
  } catch (error) {
    console.error("Rolino published articles could not be loaded.", safeError(error));
    return localPosts;
  }
});

export const getPublishedBlogPost = cache(async (slug: string): Promise<BlogPostResult> => {
  const localPost = getBlogPost(slug);

  if (localPost) {
    return { post: localPost };
  }

  if (!isRolinoBlogConfigured()) {
    return null;
  }

  try {
    const client = createRolinoBlogClient();
    const result: RolinoArticleResult = await getPublishedArticle(client, slug);

    if ("redirect" in result) {
      return result;
    }

    return { post: toPost(result.article) };
  } catch (error) {
    console.error(`Rolino article ${JSON.stringify(slug)} could not be loaded.`, safeError(error));
    return null;
  }
});

export async function getPublishedBlogSitemapEntries() {
  if (!isRolinoBlogConfigured()) {
    return [];
  }

  try {
    return await getBlogSitemapEntries(createRolinoBlogClient());
  } catch (error) {
    console.error("Rolino Blog sitemap entries could not be loaded.", safeError(error));
    return [];
  }
}

function toPost(article: Extract<RolinoArticleResult, { article: unknown }>["article"]): BlogPost {
  const featuredImage = article.images.find((image) => image.purpose === "FEATURED")
    ?? article.images[0];

  return {
    slug: article.slug,
    title: article.title,
    description: article.description ?? article.excerpt ?? "",
    date: article.publishedAt.slice(0, 10),
    author: article.author,
    tags: article.tags,
    image: featuredImage?.url,
    imageAlt: featuredImage?.altText,
    readingTime: estimateReadingTime(article.markdown),
    published: true,
    isDraft: false,
    content: article.markdown,
  };
}

function toPostMeta(article: Awaited<ReturnType<typeof getPublishedArticles>>[number]): BlogPostMeta {
  const featuredImage = article.images.find((image) => image.purpose === "FEATURED")
    ?? article.images[0];

  return {
    slug: article.slug,
    title: article.title,
    description: article.description ?? article.excerpt ?? "",
    date: article.publishedAt.slice(0, 10),
    author: article.author,
    tags: article.tags,
    image: featuredImage?.url,
    imageAlt: featuredImage?.altText,
    readingTime: "Article",
    published: true,
    isDraft: false,
  };
}

function estimateReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function safeError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}
