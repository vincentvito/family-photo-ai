import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

import { BIRTHDAY_CARD_PAGES, birthdayCardPageBySlug } from "../src/data/birthday-card-pages";

const requiredSlugs = ["kids-birthday-card-maker", "birthday-card-for-grandma", "partners"];
const MAX_BIRTHDAY_CARD_PAGE_IMAGE_BYTES = 400 * 1024;

test("birthday-card growth pages exist with clear metadata and CTAs", () => {
  const bySlug = new Map(BIRTHDAY_CARD_PAGES.map((page) => [page.slug, page]));
  const imagePaths = new Set<string>();

  for (const slug of requiredSlugs) {
    const page = bySlug.get(slug);
    assert.ok(page, `${slug} should exist`);
    assert.match(page.title, /Birthday|birthday/);
    assert.match(page.description, /birthday-card|birthday card/i);
    assert.ok(page.h1.length > 20, `${slug} should have a specific headline`);
    assert.ok(page.intro.length > 40, `${slug} should have a useful intro`);
    assert.ok(page.sections.length >= 4, `${slug} should have enough body sections`);
    assert.ok(page.messageExamples.length >= 3, `${slug} should have message examples`);
    assert.ok(page.faqs.length >= 3, `${slug} should have FAQ content`);
    assert.ok(page.related.length >= 3, `${slug} should link to related pages`);
    assert.ok(page.ctaLabel.length >= 12, `${slug} should have a clear CTA`);
    const expectedImageSlug = slug === "partners" ? "birthday-card-partners" : slug;
    assert.match(
      page.image,
      new RegExp(`/seo/birthday-cards/${expectedImageSlug}\\.webp$`),
    );
    assert.equal(imagePaths.has(page.image), false, `${slug} should use a distinct hero image`);
    imagePaths.add(page.image);

    const projectImagePath = page.image.replace(/^\/+/, "public/");
    assert.ok(existsSync(projectImagePath), `${page.image} should exist`);
    assert.ok(
      statSync(projectImagePath).size <= MAX_BIRTHDAY_CARD_PAGE_IMAGE_BYTES,
      `${page.image} should stay under 400 KB`,
    );
  }
});

test("birthday-card page slugs are unique and lookup works", () => {
  const slugs = BIRTHDAY_CARD_PAGES.map((page) => page.slug);

  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of requiredSlugs) {
    assert.equal(birthdayCardPageBySlug(slug)?.slug, slug);
  }
});

test("birthday-card routes and sitemap include every growth page", () => {
  const routeSource = readFileSync("src/app/birthday-cards/[slug]/page.tsx", "utf8");
  const hubSource = readFileSync("src/app/birthday-cards/page.tsx", "utf8");
  const sitemapSource = readFileSync("src/app/sitemap.ts", "utf8");

  assert.match(routeSource, /generateStaticParams/);
  assert.match(routeSource, /BIRTHDAY_CARD_PAGES/);
  assert.match(routeSource, /\/birthday-cards\/\$\{page\.slug\}/);
  assert.match(routeSource, /\/studio\/roster/);

  assert.match(hubSource, /BIRTHDAY_CARD_PAGES\.map/);
  assert.match(hubSource, /href=\{`\/birthday-cards\/\$\{page\.slug\}`\}/);

  assert.match(sitemapSource, /BIRTHDAY_CARD_PAGES\.map/);
  assert.match(sitemapSource, /\/birthday-cards\/\$\{page\.slug\}/);
  assert.match(sitemapSource, /`\$\{SITE_URL\}\/birthday-cards`/);
});

test("footer links to birthday-card hub and pages", () => {
  const footerSource = readFileSync("src/components/landing/Footer.tsx", "utf8");

  assert.match(footerSource, /Birthday card ideas/);
  assert.match(footerSource, /href=\"\/birthday-cards\"/);
  assert.match(footerSource, /BIRTHDAY_CARD_PAGES\.map/);
  assert.match(footerSource, /href: `\/birthday-cards\/\$\{page\.slug\}`/);
});

test("kids birthday-card page features child-focused design directions", () => {
  const page = birthdayCardPageBySlug("kids-birthday-card-maker");

  assert.ok(page, "kids birthday-card page should exist");
  assert.equal(page.image, "/seo/birthday-cards/kids-birthday-card-maker.webp");
  assert.equal(page.styleExamples?.length, 3);
  assert.match(page.styleHeading ?? "", /generic birthday template/i);
  assert.ok(page.styleExamples?.some((style) => /Minecraft/i.test(style.label)));
  assert.ok(page.styleExamples?.some((style) => /Storybook/i.test(style.label)));
  assert.ok(page.styleExamples?.some((style) => /Big-number/i.test(style.label)));
  assert.ok(page.styleExamples?.every((style) => style.src.startsWith("/samples/")));
});

test("partner birthday-card page keeps approved positioning", () => {
  const page = birthdayCardPageBySlug("partners");

  assert.ok(page, "partners page should exist");
  assert.equal(
    page.title,
    "Birthday Card Add-On for Party Planners and Cake Decorators | FamilyShoot",
  );
  assert.equal(page.h1, "A simple birthday-card add-on for your clients");
  assert.match(page.description, /cake decorators, party planners, family photographers/i);
  assert.match(page.intro, /cake order, birthday shoot, party package, or celebration gift/i);
  assert.equal(page.ctaLabel, "Request a sample birthday-card pack");
  assert.ok(page.sections.some((section) => /cake decorators/i.test(section.title)));
  assert.ok(page.sections.some((section) => /kids' party planners/i.test(section.title)));
  assert.ok(page.sections.some((section) => /family photographers/i.test(section.title)));
  assert.ok(page.sections.some((section) => /pet birthday creators/i.test(section.title)));
});
