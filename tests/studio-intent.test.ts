import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  getPromptStudioHref,
  getThemeStudioHref,
  MAX_STUDIO_PROMPT_LENGTH,
  normalizeStudioPrompt,
} from "../src/lib/theme-links";
import {
  getStudioIntentDestination,
  getStudioIntentHref,
  getStudioNavigationHref,
  parseStudioIntent,
  studioSearchParamsFromUrl,
  type StudioIntent,
} from "../src/lib/studio-intent";
import { THEMES } from "../src/lib/themes";
import { getThemeDisplayName } from "../src/data/theme-display-names";
import ThemeBoard from "../src/components/studio/ThemeBoard";
import type { GenerationMethod } from "../src/lib/generation-method";

const origin = "https://familyshoot.com";
const portraitTheme = THEMES.find((theme) => theme.category === "photoreal")!;
const cardTheme = THEMES.find((theme) => theme.category === "card")!;
const prompt = 'Family reading together: warm light & rain, "cozy" #weekend.\n祖父母も一緒に。';
const query = (href: string) => studioSearchParamsFromUrl(new URL(href, origin).searchParams);

test("preset, card and custom look survive empty roster, format navigation and return with reference photos", () => {
  for (const href of [
    getThemeStudioHref(portraitTheme),
    getThemeStudioHref(cardTheme),
    getPromptStudioHref(prompt),
  ]) {
    const intent = parseStudioIntent(query(href), THEMES)!;
    assert.ok(intent);
    const onboarding = getStudioIntentDestination(intent, []);
    assert.equal(new URL(onboarding, origin).pathname, "/studio/roster");
    assert.equal(getStudioIntentDestination(intent, [{ photos: [] }]), onboarding);
    assert.deepEqual(parseStudioIntent(query(onboarding), THEMES), intent);

    const outputStep = getStudioNavigationHref("/studio/output", query(onboarding));
    const restored = parseStudioIntent(query(outputStep), THEMES)!;
    assert.deepEqual(restored, intent);
    assert.equal(getStudioIntentDestination(restored, [{ photos: ["reference-1"] }]), href);
    assert.equal(getStudioIntentHref(restored), href);

    const signIn = new URL(
      getStudioNavigationHref("/sign-in?next=/studio/album", query(onboarding)),
      origin,
    );
    assert.equal(signIn.pathname, "/sign-in");
    assert.equal(signIn.searchParams.get("next"), href);
    assert.deepEqual(parseStudioIntent(query(signIn.searchParams.get("next")!), THEMES), intent);
  }
});

test("the custom link encodes the complete prompt without introducing query parameters or a fragment", () => {
  const url = new URL(getPromptStudioHref(`  ${prompt}  `), origin);
  assert.deepEqual([...url.searchParams.keys()], ["output", "prompt"]);
  assert.equal(url.hash, "");
  assert.equal(url.searchParams.get("prompt"), prompt);
  assert.deepEqual(parseStudioIntent(query(url.href), THEMES), {
    kind: "prompt",
    output: "photoshoot",
    prompt,
  });
});

test("invalid, conflicting, duplicate and unknown deep-link values cannot select a look", () => {
  for (const params of [
    { theme: "missing-theme" },
    { theme: "../outside" },
    { theme: "x".repeat(101) },
    { card: portraitTheme.id },
    { theme: portraitTheme.id, output: "card" },
    { theme: portraitTheme.id, prompt },
    { theme: portraitTheme.id, card: cardTheme.id },
    { prompt, output: "card" },
    { prompt, output: "other" },
    { prompt: "abc" },
    { prompt: "x".repeat(MAX_STUDIO_PROMPT_LENGTH + 1) },
    { prompt: "hidden\u0000text" },
    query(`/studio/theme?output=photoshoot&theme=${portraitTheme.id}&theme=${portraitTheme.id}`),
    query(`/studio/theme?prompt=first&prompt=second`),
    query(`/studio/theme?output=card&output=card&card=${cardTheme.id}`),
  ]) {
    assert.equal(parseStudioIntent(params, THEMES), null, JSON.stringify(params));
  }
  assert.equal(
    normalizeStudioPrompt("x".repeat(MAX_STUDIO_PROMPT_LENGTH))?.length,
    MAX_STUDIO_PROMPT_LENGTH,
  );
  assert.throws(() => getPromptStudioHref("bad"), RangeError);
  assert.equal(getStudioNavigationHref("/studio/output", {}), "/studio/output");
  assert.equal(
    getStudioNavigationHref("/studio/album", query(getPromptStudioHref(prompt))),
    "/studio/album",
  );
});

test("legacy card theme links canonicalize to the card output", () => {
  const intent = parseStudioIntent({ theme: cardTheme.id }, THEMES)!;
  assert.equal(getStudioIntentHref(intent), getThemeStudioHref(cardTheme));
});

const router = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
  bfcacheId: "test",
};

function renderIntent(
  intent: StudioIntent,
  admin = false,
  defaultGenerationMethod: GenerationMethod = "current-prompt",
) {
  const html = renderToStaticMarkup(
    createElement(
      AppRouterContext.Provider,
      { value: router },
      createElement(ThemeBoard, {
        key: getStudioIntentHref(intent),
        photoreal: [portraitTheme],
        stylized: [],
        cards: [cardTheme],
        isAdmin: admin,
        defaultGenerationMethod,
        creditBalance: 1,
        canStartFreePreview: false,
        roster: [
          { id: "person-1", name: "Person", role: "adult", hasReference: true, photoId: null },
        ],
        outputMode: intent.output,
        isProSubscriber: false,
        subscriptionRenewalDate: null,
        isAuthenticated: true,
        initialThemeId:
          intent.kind === "theme" && intent.output === "photoshoot" ? intent.themeId : null,
        initialCardId: intent.kind === "theme" && intent.output === "card" ? intent.themeId : null,
        initialPrompt: intent.kind === "prompt" ? intent.prompt : "",
      }),
    ),
  );
  return new JSDOM(html);
}

test("admin Studio shows separate method and model controls with clear scope", () => {
  const portrait = renderIntent(
    { kind: "theme", output: "photoshoot", themeId: portraitTheme.id },
    true,
  );
  const card = renderIntent({ kind: "theme", output: "card", themeId: cardTheme.id }, true);
  const portraitWithReferenceDefault = renderIntent(
    { kind: "theme", output: "photoshoot", themeId: portraitTheme.id },
    true,
    "vibe-reference",
  );
  const cardWithReferenceDefault = renderIntent(
    { kind: "theme", output: "card", themeId: cardTheme.id },
    true,
    "vibe-reference",
  );
  const customer = renderIntent({ kind: "theme", output: "photoshoot", themeId: portraitTheme.id });
  try {
    const method = portrait.window.document.querySelector(
      '[role="group"][aria-label="Generation method override"]',
    );
    assert.ok(method);
    assert.match(
      method.textContent ?? "",
      /Use app default.*Current prompts.*Vibe image reference/,
    );
    assert.match(
      portrait.window.document.body.textContent ?? "",
      /Cards and custom scenes use Current prompts/,
    );
    assert.match(portrait.window.document.body.textContent ?? "", /Admin · model/);
    assert.match(method.textContent ?? "", /Use app default \(Current prompts\)/);
    assert.match(
      portraitWithReferenceDefault.window.document.body.textContent ?? "",
      /Use app default \(Vibe image reference\).*This shoot will use Vibe image reference/s,
    );
    assert.match(
      cardWithReferenceDefault.window.document.body.textContent ?? "",
      /Use app default \(Current prompts for this output\).*This shoot will use Current prompts/s,
    );
    assert.equal(
      card.window.document.querySelector<HTMLButtonElement>('[role="group"] button:last-child')
        ?.disabled,
      true,
    );
    assert.equal(
      customer.window.document.querySelector(
        '[role="group"][aria-label="Generation method override"]',
      ),
      null,
    );
  } finally {
    portrait.window.close();
    card.window.close();
    portraitWithReferenceDefault.window.close();
    cardWithReferenceDefault.window.close();
    customer.window.close();
  }
});

test("studio renders the chosen custom prompt in the editable custom scene tab", () => {
  const dom = renderIntent({ kind: "prompt", output: "photoshoot", prompt });
  try {
    const document = dom.window.document;
    assert.equal(
      document.querySelector<HTMLTextAreaElement>("#custom-scene-prompt")?.value,
      prompt,
    );
    assert.match(
      document.querySelector('[role="tab"][aria-selected="true"]')?.textContent ?? "",
      /Design your own/,
    );
    assert.equal(document.querySelector("textarea")?.maxLength, MAX_STUDIO_PROMPT_LENGTH);
  } finally {
    dom.window.close();
  }
});

test("studio renders the chosen preset selected and the chosen card in its card editor", () => {
  const portrait = renderIntent({ kind: "theme", output: "photoshoot", themeId: portraitTheme.id });
  const card = renderIntent({ kind: "theme", output: "card", themeId: cardTheme.id });
  try {
    const selected = [...portrait.window.document.querySelectorAll('[aria-pressed="true"]')];
    assert.ok(
      selected.some((button) => button.textContent?.includes(getThemeDisplayName(portraitTheme))),
    );
    assert.ok(card.window.document.body.textContent?.includes(getThemeDisplayName(cardTheme)));
    assert.ok(card.window.document.body.textContent?.includes("Output styles"));
    assert.equal(card.window.document.querySelector("#custom-scene-prompt"), null);
  } finally {
    portrait.window.close();
    card.window.close();
  }
});
