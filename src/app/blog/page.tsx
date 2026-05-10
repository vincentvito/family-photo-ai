import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Footer from "@/components/landing/Footer";
import Nav from "@/components/landing/Nav";
import { formatPostDate, getAllBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Family Photo Ideas & AI Portrait Tips",
  description:
    "Simple guidance for planning AI family portraits, holiday cards, photo gifts, and keepsake images with FamilyShoot.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <Nav links={[{ href: "/", label: "Home" }]} />
      <main className="min-h-screen bg-[color:var(--color-bg)] px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <section className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="small-caps text-[color:var(--color-coral-deep)]">FamilyShoot Blog</p>
            <h1 className="mt-4 text-5xl leading-[0.95] text-[color:var(--color-ink)] sm:text-6xl md:text-7xl">
              Better family photos from the pictures you already have.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--color-ink-muted)]">
              Practical notes on AI family portraits, holiday cards, photo gifts, and getting a
              natural result when everyone is rarely in the same frame.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex min-h-[320px] flex-col justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
              >
                <div>
                  {post.image && (
                    <div className="-mx-2 -mt-2 mb-5 overflow-hidden rounded-[var(--radius-md)] border border-[color:var(--color-line)] bg-[color:var(--color-bg-tinted-butter)]">
                      <Image
                        src={post.image}
                        alt={post.imageAlt ?? ""}
                        width={720}
                        height={420}
                        className="aspect-[12/7] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="chip chip-sage">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-6 text-3xl leading-tight transition-colors group-hover:text-[color:var(--color-coral-deep)]">
                    {post.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-[color:var(--color-ink-muted)]">
                    {post.description}
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-[color:var(--color-line)] pt-5 text-xs font-medium text-[color:var(--color-ink-muted)]">
                  <span>{formatPostDate(post.date)}</span>
                  <span>{post.readingTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
