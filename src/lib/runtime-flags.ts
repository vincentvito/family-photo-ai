export function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

export function isMockModeEnabled() {
  if (isProductionRuntime()) return false;
  return process.env.NEXT_PUBLIC_MOCK_MODE === "1" || process.env.MOCK_MODE === "1";
}

export function isPromptDebugOnlyModeEnabled() {
  if (isProductionRuntime()) return false;
  return process.env.PROMPT_DEBUG_ONLY === "1";
}

export function hasReplicateToken() {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

export function shouldUseMockProviderFallback() {
  return isMockModeEnabled() || (!isProductionRuntime() && !hasReplicateToken());
}
