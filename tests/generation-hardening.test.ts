import assert from "node:assert/strict";
import test from "node:test";
import {
  GENERATION_TEMPORARILY_UNAVAILABLE_MESSAGE,
  isProviderRateLimitError,
  publicGenerationErrorMessage,
  toPublicGenerationFailure,
} from "../src/lib/generation-errors";
import { resolvePredictionRetryContext } from "../src/lib/replicate/generate";
import { getImageRatingEffects } from "../src/lib/album-queries";
import { isStoredImageMissingError } from "../src/lib/storage";

test("provider rate-limit details are replaced with a safe customer message", () => {
  const raw = new Error(
    'Request to https://api.replicate.com/v1/predictions failed with status 429 Too Many Requests: {"detail":"low credit"}',
  );

  assert.equal(isProviderRateLimitError(raw), true);
  assert.equal(toPublicGenerationFailure(raw), GENERATION_TEMPORARILY_UNAVAILABLE_MESSAGE);
  assert.equal(
    publicGenerationErrorMessage("error", raw.message),
    GENERATION_TEMPORARILY_UNAVAILABLE_MESSAGE,
  );
  assert.doesNotMatch(
    toPublicGenerationFailure(raw),
    /replicate|429|https:|rate limit|throttled|low credit/iu,
  );
});

test("non-error generation messages are not rewritten", () => {
  assert.equal(publicGenerationErrorMessage("pending", null), null);
  assert.equal(publicGenerationErrorMessage("done", "kept"), "kept");
});

test("prediction retries preserve their exact slot vibe", () => {
  assert.deepEqual(
    resolvePredictionRetryContext(
      { id: "prediction", retries: 0, basePrompt: "Lake house prompt", themeId: "lake-house" },
      { prompt: "Default prompt", themeId: "default-theme" },
    ),
    { basePrompt: "Lake house prompt", themeId: "lake-house" },
  );
});

test("rating effects keep only thumbs-up images in the album", () => {
  assert.deepEqual(getImageRatingEffects("up"), {
    isFavorite: true,
    shouldBeInAlbum: true,
  });
  assert.deepEqual(getImageRatingEffects("down"), {
    isFavorite: false,
    shouldBeInAlbum: false,
  });
  assert.deepEqual(getImageRatingEffects(null), {
    isFavorite: false,
    shouldBeInAlbum: false,
  });
});

test("missing R2 objects are recognized without exposing storage errors", () => {
  assert.equal(isStoredImageMissingError({ name: "NoSuchKey" }), true);
  assert.equal(isStoredImageMissingError({ $metadata: { httpStatusCode: 404 } }), true);
  assert.equal(isStoredImageMissingError(new Error("connection reset")), false);
});
