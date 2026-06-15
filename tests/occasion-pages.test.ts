import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

import { OCCASION_PAGES } from "../src/data/occasion-pages";

const MAX_SEO_IMAGE_BYTES = 400 * 1024;

const requiredSlugs = [
  "fathers-day",
  "mothers-day",
  "womens-day",
  "grandparents-day",
  "family-reunion",
  "military-family-portraits",
  "anniversary-gift",
  "valentines-day",
];

test("high-intent occasion pages exist with clear CTAs", () => {
  const bySlug = new Map(OCCASION_PAGES.map((page) => [page.slug, page]));

  for (const slug of requiredSlugs) {
    const page = bySlug.get(slug);
    assert.ok(page, `${slug} should exist`);
    assert.match(page.ctaLabel, /^Create /, `${slug} should have an action-led CTA`);
    assert.ok(page.h1.length > 20, `${slug} should have a specific headline`);
    assert.ok(
      page.intro.toLowerCase().includes("preview"),
      `${slug} should mention preview-first trust path`,
    );
    assert.ok(page.related.length >= 3, `${slug} should link to related occasions/cards`);
  }
});

test("occasion page slugs are unique", () => {
  const slugs = OCCASION_PAGES.map((page) => page.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("valentine's day uses a dedicated valentine image", () => {
  const page = OCCASION_PAGES.find((item) => item.slug === "valentines-day");
  assert.ok(page, "valentines-day page should exist");
  assert.match(page.image, /valentine/i);
  assert.notEqual(page.image, "/samples/theme-card-mothers-day.jpg");
});

test("footer links to occasion pages and the occasions hub", () => {
  const footerSource = readFileSync("src/components/landing/Footer.tsx", "utf8");

  assert.match(footerSource, /Occasion pages/);
  assert.match(footerSource, /href=\"\/occasions\"/);
  assert.match(footerSource, /OCCASION_PAGES\.map/);
  assert.match(footerSource, /href: `\/\$\{page\.slug\}`/);
});

test("occasions hub is a route that lists every occasion page", () => {
  const hubSource = readFileSync("src/app/occasions/page.tsx", "utf8");

  assert.match(hubSource, /OCCASION_PAGES/);
  assert.match(hubSource, /\/studio\/roster/);
  assert.match(hubSource, /href=\{`\/\$\{page\.slug\}`\}/);
});

test("homepage card section deep-links priority occasion pages", () => {
  const source = readFileSync("src/components/landing/OccasionCards.tsx", "utf8");

  assert.match(source, /Create portraits for every family occasion/);
  assert.match(source, /FEATURED_OCCASION_SLUGS/);
  assert.match(source, /last-minute-personalized-birthday-card/);
  assert.match(source, /fathers-day/);
  assert.match(source, /mothers-day/);
  assert.match(source, /womens-day/);
  assert.match(source, /grandparents-day/);
  assert.match(source, /anniversary-gift/);
  assert.match(source, /family-reunion/);
  assert.match(source, /href=\{`\/\$\{page\.slug\}`\}/);
});

test("last-minute personalized birthday card page has approved SEO, CTA, sitemap and links", () => {
  const pageSource = readFileSync(
    "src/app/birthday-cards/last-minute-personalized-birthday-card/page.tsx",
    "utf8",
  );
  const dataSource = readFileSync("src/data/birthday-card-pages.ts", "utf8");
  const sitemapSource = readFileSync("src/app/sitemap.ts", "utf8");
  const cardsSource = readFileSync("src/data/cards.ts", "utf8");
  const dynamicSlugSource = readFileSync("src/app/[slug]/page.tsx", "utf8");

  assert.match(dataSource, /\/birthday-cards\/last-minute-personalized-birthday-card/);
  assert.match(dataSource, /Last-Minute Personalized Birthday Cards \| FamilyShoot/);
  assert.match(
    dataSource,
    /Create a thoughtful personalized birthday card using family, kid, couple, grandparent, or pet photos\./,
  );
  assert.match(
    dataSource,
    /Last-minute personalized birthday cards that still feel thoughtful/,
  );
  assert.match(dataSource, /Forgot a birthday\?/);
  assert.match(dataSource, /\/seo\/birthday-cards\/last-minute-personalized-birthday-card\.webp/);
  assert.doesNotMatch(dataSource, /\/samples\/theme-card-birthday\.jpg/);
  assert.match(pageSource, /page\.h1/);
  assert.match(pageSource, /page\.heroCopy/);
  assert.match(pageSource, /Create a birthday card/);
  assert.match(pageSource, /href=\{page\.ctaHref\}/);
  assert.match(pageSource, /FAQ: last-minute personalized birthday cards/);
  assert.match(pageSource, /For when &quot;Happy Birthday&quot; is not enough/);
  assert.match(
    pageSource,
    /Birthday cards for kids, partners, grandparents, friends, and pet lovers/,
  );
  assert.match(pageSource, /Ideas for same-day birthday messages/);
  assert.match(pageSource, /Birthday message examples by recipient/);
  assert.match(pageSource, /Happy birthday to the heart of our family/);
  assert.match(pageSource, /favorite little adventurer/);
  assert.match(pageSource, /We may be far apart today/);
  assert.match(sitemapSource, /BIRTHDAY_CARD_SEO_PAGES/);
  assert.match(sitemapSource, /`\$\{SITE_URL\}\$\{page\.path\}`/);
  assert.match(cardsSource, /birthday-cards\/last-minute-personalized-birthday-card/);
  assert.match(dynamicSlugSource, /BIRTHDAY_CARD_SEO_PAGES/);
  assert.match(dynamicSlugSource, /birthdayCardPage\.path/);

  const imagePath = "public/seo/birthday-cards/last-minute-personalized-birthday-card.webp";
  assert.ok(existsSync(imagePath), "last-minute birthday card SEO image should exist");
  assert.ok(
    statSync(imagePath).size <= MAX_SEO_IMAGE_BYTES,
    "last-minute birthday card SEO image should stay under 400 KB",
  );
});
