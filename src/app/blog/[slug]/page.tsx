import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import MarkdownContent from "@/components/blog/MarkdownContent";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import { formatPostDate, getAllBlogSlugs, getRelatedPosts } from "@/lib/blog";
import { getPublishedBlogPost } from "@/lib/rolino-blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyshoot.com";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedBlogPost(slug);

  if (!result || "redirect" in result) {
    return { title: "Post Not Found" };
  }

  const { post } = result;

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [{ url: post.image, alt: post.imageAlt ?? post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const result = await getPublishedBlogPost(slug);

  if (!result) {
    notFound();
  }

  if ("redirect" in result) {
    permanentRedirect(`/blog/${result.redirect.to}`);
  }

  const { post } = result;

  const relatedPosts = getRelatedPosts(slug, post.tags, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "FamilyShoot",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    image: post.image ? new URL(post.image, SITE_URL).toString() : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
  };

  return (
    <>
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Nav links={[{ href: "/", label: "Home" }]} />
      <main className="bg-[color:var(--color-bg)] px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="text-sm font-medium text-[color:var(--color-coral-deep)] transition-colors hover:text-[color:var(--color-ink)]"
          >
            Back to blog
          </Link>

          <header className="mt-8 border-b border-[color:var(--color-line)] pb-10">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="chip chip-butter">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-6 text-5xl leading-[0.95] sm:text-6xl">{post.title}</h1>
            <p className="mt-6 text-xl leading-8 text-[color:var(--color-ink-muted)]">
              {post.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--color-ink-muted)]">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span>{post.readingTime}</span>
              <span>By {post.author}</span>
            </div>
          </header>

          {post.image && (
            <div className="mt-10 overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-butter)] shadow-[var(--shadow-md)]">
              <Image
                src={post.image}
                alt={post.imageAlt ?? ""}
                width={1200}
                height={630}
                priority
                className="w-full object-cover"
              />
            </div>
          )}

          <MarkdownContent content={post.content} />

          <div className="mt-12 rounded-[var(--radius-lg)] border border-[color:var(--color-coral-soft)] bg-[color:var(--color-bg-tinted-coral)] p-6 sm:p-8">
            <p className="small-caps text-[color:var(--color-coral-deep)]">Make one now</p>
            <h2 className="mt-3 text-3xl leading-tight">
              Turn your photos into a family portrait.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-muted)]">
              Upload one clear photo per person, choose a portrait or card style, and keep the
              version that feels most like your family.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/studio/roster" className="btn btn-coral btn-sm">
                Start a shoot
              </Link>
              <Link href="/blog" className="btn btn-ghost btn-sm">
                Browse blog
              </Link>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="mx-auto mt-20 max-w-5xl border-t border-[color:var(--color-line)] pt-10">
            <h2 className="text-3xl">Keep reading</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-5 transition hover:border-[color:var(--color-coral-soft)] hover:shadow-[var(--shadow-md)]"
                >
                  <h3 className="text-2xl leading-tight">{relatedPost.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--color-ink-muted)]">
                    {relatedPost.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
