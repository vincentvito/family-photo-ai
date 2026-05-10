import fs from "fs";
import path from "path";

const POSTS_DIRECTORY = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  readingTime: string;
  published: boolean;
  isDraft: boolean;
  content: string;
};

export type BlogPostMeta = Omit<BlogPost, "content">;

type Frontmatter = Record<string, string | string[] | boolean>;

export function getAllBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => getBlogPost(fileName.replace(/\.md$/, "")))
    .filter((post): post is BlogPost => post !== null)
    .filter((post) => {
      if (process.env.NODE_ENV === "development") {
        return true;
      }

      return post.published && !post.isDraft;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(toPostMeta);
}

export function getBlogPost(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(POSTS_DIRECTORY, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { frontmatter, content } = parseFrontmatter(fileContents);
    const published = frontmatter.published !== false;
    const isDraft = frontmatter.draft === true;

    if (process.env.NODE_ENV !== "development" && (!published || isDraft)) {
      return null;
    }

    return {
      slug,
      title: asString(frontmatter.title),
      description: asString(frontmatter.description),
      date: asString(frontmatter.date),
      author: asString(frontmatter.author) || "FamilyShoot Team",
      tags: asStringArray(frontmatter.tags),
      image: asString(frontmatter.image) || undefined,
      imageAlt: asString(frontmatter.imageAlt) || undefined,
      readingTime: estimateReadingTime(content),
      published,
      isDraft,
      content,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return [];
  }

  return fs
    .readdirSync(POSTS_DIRECTORY)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

export function getRelatedPosts(currentSlug: string, tags: string[], limit = 3): BlogPostMeta[] {
  const posts = getAllBlogPosts().filter((post) => post.slug !== currentSlug);

  if (tags.length === 0) {
    return posts.slice(0, limit);
  }

  return posts
    .map((post) => ({
      ...post,
      score: post.tags.filter((tag) => tags.includes(tag)).length,
    }))
    .sort((a, b) => {
      if (a.score === b.score) {
        return a.date < b.date ? 1 : -1;
      }

      return b.score - a.score;
    })
    .slice(0, limit);
}

export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function parseFrontmatter(fileContents: string): { frontmatter: Frontmatter; content: string } {
  if (!fileContents.startsWith("---")) {
    return { frontmatter: {}, content: fileContents.trim() };
  }

  const end = fileContents.indexOf("\n---", 3);

  if (end === -1) {
    return { frontmatter: {}, content: fileContents.trim() };
  }

  const frontmatterBlock = fileContents.slice(3, end).trim();
  const content = fileContents.slice(end + 4).trim();

  return {
    frontmatter: parseFrontmatterBlock(frontmatterBlock),
    content,
  };
}

function parseFrontmatterBlock(block: string): Frontmatter {
  const data: Frontmatter = {};

  for (const line of block.split(/\r?\n/)) {
    const separator = line.indexOf(":");

    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    data[key] = parseValue(rawValue);
  }

  return data;
}

function parseValue(value: string): string | string[] | boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean);
  }

  return value.replace(/^['"]|['"]$/g, "");
}

function asString(value: string | string[] | boolean | undefined): string {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: string | string[] | boolean | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.length > 0) {
    return [value];
  }

  return [];
}

function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
}

function toPostMeta(post: BlogPost): BlogPostMeta {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    author: post.author,
    tags: post.tags,
    image: post.image,
    imageAlt: post.imageAlt,
    readingTime: post.readingTime,
    published: post.published,
    isDraft: post.isDraft,
  };
}
