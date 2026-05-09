const GIFT_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeGiftCode(code: string) {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function formatGiftCode(code: string) {
  const normalized = normalizeGiftCode(code);
  return normalized.match(/.{1,4}/g)?.join("-") ?? normalized;
}

export function createGiftCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let code = "FS";
  for (let index = 0; index < 14; index += 1) {
    code += GIFT_CODE_ALPHABET[bytes[index] % GIFT_CODE_ALPHABET.length];
  }
  return code;
}
