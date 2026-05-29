import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { OCCASION_PAGES } from "../src/data/occasion-pages";

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
  assert.match(source, /fathers-day/);
  assert.match(source, /mothers-day/);
  assert.match(source, /womens-day/);
  assert.match(source, /grandparents-day/);
  assert.match(source, /anniversary-gift/);
  assert.match(source, /family-reunion/);
  assert.match(source, /href=\{`\/\$\{page\.slug\}`\}/);
});
