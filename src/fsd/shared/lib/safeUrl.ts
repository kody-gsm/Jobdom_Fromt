const INTERNAL_URL_ORIGIN = "https://jobdam.invalid";

export const getSafeInternalPath = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) return null;

  try {
    const parsed = new URL(trimmed, INTERNAL_URL_ORIGIN);
    if (parsed.origin !== INTERNAL_URL_ORIGIN) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
};

export const getSafeLinkUrl = (value: string | null | undefined) => {
  const internalPath = getSafeInternalPath(value);
  if (internalPath) return internalPath;

  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
};
