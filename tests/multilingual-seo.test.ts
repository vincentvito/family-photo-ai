import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { LOCALES } from "../src/lib/i18n/locales";
import {
  absoluteLocalizedUrl,
  languageAlternates,
  LOCALIZED_INDEX_PATHS,
} from "../src/lib/i18n/seo";

const SITE_URL = "https://familyshoot.com";

test("localized homepage URLs are self-canonical candidates with reciprocal language alternates", () => {
  assert.deepEqual(LOCALIZED_INDEX_PATHS, ["/"]);

  const alternates = languageAlternates("/", SITE_URL);
  assert.equal(alternates.en, "https://familyshoot.com/");
  assert.equal(alternates.es, "https://familyshoot.com/es");
  assert.equal(alternates.de, "https://familyshoot.com/de");
  assert.equal(alternates.ru, "https://familyshoot.com/ru");
  assert.equal(alternates.uk, "https://familyshoot.com/uk");
  assert.equal(alternates["x-default"], "https://familyshoot.com/");

  for (const locale of LOCALES) {
    assert.equal(alternates[locale], absoluteLocalizedUrl("/", locale, SITE_URL));
  }
});

test("monthly pricing labels cannot be mistaken for site-relative URLs", () => {
  for (const locale of LOCALES) {
    const messages = JSON.parse(readFileSync(`src/messages/${locale}.json`, "utf8")) as {
      Pricing: { perMonth: string };
    };

    assert.ok(messages.Pricing.perMonth.length > 0);
    assert.ok(
      !messages.Pricing.perMonth.startsWith("/"),
      `${locale} monthly pricing label must not start with a slash`,
    );
  }
});

test("layout and sitemap expose only approved localized index paths", () => {
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  const sitemapSource = readFileSync("src/app/sitemap.ts", "utf8");

  assert.match(layoutSource, /languages: languageAlternates\("\/", SITE_URL\)/);
  assert.match(layoutSource, /canonical = absoluteLocalizedUrl\("\/", locale, SITE_URL\)/);
  assert.match(sitemapSource, /LOCALIZED_INDEX_PATHS\.flatMap/);
});
