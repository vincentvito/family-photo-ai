import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("Rolino Blog delivery is pinned and documents every server-only value", () => {
  const manifest = JSON.parse(read("package.json")) as {
    dependencies?: Record<string, string>;
  };
  const environment = read(".env.example");

  assert.equal(manifest.dependencies?.["@rolino/nextjs-blog"], "0.5.0-beta.0");
  for (const name of [
    "ROLINO_URL",
    "ROLINO_BLOG_SITE_ID",
    "ROLINO_BLOG_DELIVERY_TOKEN",
    "ROLINO_BLOG_WEBHOOK_SECRET",
  ]) {
    assert.match(environment, new RegExp(`^${name}=`, "m"));
    assert.doesNotMatch(environment, new RegExp(`^NEXT_PUBLIC_${name}=`, "m"));
  }
});

test("Rolino Blog delivery covers list, article, sitemap, and signed revalidation routes", () => {
  const client = read("src/lib/rolino-blog.ts");
  const indexPage = read("src/app/blog/page.tsx");
  const articlePage = read("src/app/blog/[slug]/page.tsx");
  const sitemap = read("src/app/sitemap.ts");
  const revalidationRoute = read("src/app/api/rolino/revalidate/route.ts");

  assert.match(client, /getPublishedArticles/);
  assert.match(client, /getPublishedArticle/);
  assert.match(client, /getBlogSitemapEntries/);
  assert.match(indexPage, /getAllPublishedBlogPosts/);
  assert.match(articlePage, /getPublishedBlogPost/);
  assert.match(sitemap, /getPublishedBlogSitemapEntries/);
  assert.match(revalidationRoute, /createRolinoRevalidationHandler/);
});
