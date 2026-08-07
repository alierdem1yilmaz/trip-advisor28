import { corsJson, corsPreflight } from "@/lib/cors";
import { getHotelReviews, translateReviews } from "@/lib/liteapi";
import type { Language } from "@/lib/i18n/dictionaries";

export const runtime = "nodejs";
export const maxDuration = 20;

const SUPPORTED_LANGUAGES: Language[] = ["en", "tr", "es"];

export async function OPTIONS() {
  return corsPreflight();
}

/**
 * Fetched client-side by the hotel detail page — twice, deliberately. The
 * page calls this once with no `language` (fast: real reviews, original
 * language, renders instantly) and once with `language` set (slower: same
 * reviews translated) to swap in once ready, rather than blocking the whole
 * reviews section behind the translation call. Site language lives in
 * localStorage only, so it isn't known at server-render time anyway.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ hotelId: string }> },
) {
  const { hotelId } = await params;
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("language");

  const reviews = await getHotelReviews(hotelId);
  if (!requested) {
    return corsJson({ reviews });
  }

  const language: Language = SUPPORTED_LANGUAGES.includes(requested as Language)
    ? (requested as Language)
    : "en";
  const translated = await translateReviews(reviews, language);
  return corsJson({ reviews: translated });
}
