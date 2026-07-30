import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

test("default email popup is mounted instead of the seasonal Father's Day popup", () => {
  const layoutSource = readFileSync(join(root, "src/app/layout.tsx"), "utf8");
  const popupSource = readFileSync(
    join(root, "src/components/landing/MarketingEmailPopup.tsx"),
    "utf8",
  );

  assert.match(layoutSource, /MarketingEmailPopup/);
  assert.doesNotMatch(layoutSource, /FathersDayPopup/);
  assert.equal(existsSync(join(root, "src/components/landing/FathersDayPopup.tsx")), false);
  assert.match(popupSource, /First generation free/);
  assert.match(popupSource, /default_email_popup/);
  assert.match(popupSource, /marketingOptIn, setMarketingOptIn\] = useState\(true\)/);
  assert.match(popupSource, /authClient\.useSession/);
  assert.match(popupSource, /session\?\.user/);
});

test("hero title is explicitly split into lines in every locale", () => {
  for (const locale of ["en", "de", "es", "ru", "uk"]) {
    const messages = JSON.parse(
      readFileSync(join(root, `src/messages/${locale}.json`), "utf8"),
    );

    assert.ok(Array.isArray(messages.Hero.titleLines), `${locale} titleLines must be an array`);
    assert.ok(messages.Hero.titleLines.length > 0, `${locale} titleLines must not be empty`);
    assert.ok(
      messages.Hero.titleLines.every(
        (line: unknown) => typeof line === "string" && line.length > 0,
      ),
      `${locale} titleLines must contain non-empty strings`,
    );
  }
});

test("desktop storyboard hero centers the title above the image row", () => {
  const heroSource = readFileSync(join(root, "src/components/landing/Hero.tsx"), "utf8");
  const storyboardStart = heroSource.indexOf("function StoryboardHero()");
  const classicStart = heroSource.indexOf("export function ClassicHero()");
  const storyboardSource = heroSource.slice(storyboardStart, classicStart);

  assert.match(storyboardSource, /flex w-full max-w-\[1480px\] flex-col items-center/);
  assert.match(storyboardSource, /className="mx-auto max-w-\[920px\] text-center"/);
  assert.match(storyboardSource, /<HeroTitle className="mx-auto/);
  assert.match(storyboardSource, /w-fit max-w-full/);
  assert.match(heroSource, /titleLines\.map/);
  assert.match(heroSource, /sm:whitespace-nowrap/);
  assert.match(storyboardSource, /lg:flex lg:flex-row lg:justify-center/);
  assert.doesNotMatch(storyboardSource, /initial=\{\{ opacity: 0/);
  assert.doesNotMatch(storyboardSource, /lg:text-left/);
  assert.doesNotMatch(storyboardSource, /lg:grid-cols/);
});
