/**
 * Splitza — shared logo map
 * Import this wherever you need to resolve a service logo by name.
 */

export const SERVICE_LOGO_MAP: Record<string, string> = {
  netflix:   "https://cdn.simpleicons.org/netflix/E50914",
  spotify:   "https://cdn.simpleicons.org/spotify/1ED760",
  youtube:   "https://cdn.simpleicons.org/youtube/FF0000",
  apple:     "https://cdn.simpleicons.org/apple/000000",
  canva:     "https://cdn.simpleicons.org/canva/00C4CC",
  prime:     "https://cdn.simpleicons.org/amazonaws/FF9900",
  amazon:    "https://cdn.simpleicons.org/amazonaws/FF9900",
  disney:    "https://cdn.simpleicons.org/disneyplus/006E99",
  hotstar:   "https://cdn.simpleicons.org/disneyplus/006E99",
  microsoft: "https://cdn.simpleicons.org/microsoft/00A4EF",
  adobe:     "https://cdn.simpleicons.org/adobe/FF0000",
  figma:     "https://cdn.simpleicons.org/figma/F24E1E",
  notion:    "https://cdn.simpleicons.org/notion/000000",
};

/** Returns logo URL by matching service name against known keywords. */
export function resolveLogoUrl(
  platformLogoUrl: string | null | undefined,
  name: string
): string | null {
  if (platformLogoUrl) return platformLogoUrl;
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(SERVICE_LOGO_MAP)) {
    if (lower.includes(key)) return url;
  }
  return null;
}
