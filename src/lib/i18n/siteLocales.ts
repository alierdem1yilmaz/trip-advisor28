// The full list of locales offered by the language switcher across all
// three merged sites (VoyageAI, the Keşfedin/VisitorGuide zone, and the
// Cruise zone) — mirrors VisitorGuide's src/data/regions.ts locale set
// exactly, so the same 50+ languages are offered everywhere. Only a subset
// of these have real translated content here (see dictionaries.ts's
// LANGUAGE_NAMES); anything else falls back to English.
export type SiteLocale =
  | "tr" | "en" | "de" | "fr" | "ru" | "zh" | "es" | "hi" | "pl"
  | "pt" | "it" | "nl" | "ja" | "ko" | "ar" | "th" | "vi" | "id" | "ms" | "tl"
  | "sv" | "no" | "da" | "fi" | "cs" | "sk" | "hu" | "ro" | "bg" | "el" | "he"
  | "uk" | "hr" | "sr" | "sl" | "lt" | "lv" | "et" | "is" | "fa" | "sw" | "af"
  | "bn" | "ur" | "ta" | "mn" | "ka" | "hy" | "az" | "km";

export const SITE_LOCALES: { locale: SiteLocale; label: string; flag: string }[] = [
  { locale: "tr", label: "Türkçe", flag: "🇹🇷" },
  { locale: "en", label: "English", flag: "🇺🇸" },
  { locale: "de", label: "Deutsch", flag: "🇩🇪" },
  { locale: "fr", label: "Français", flag: "🇫🇷" },
  { locale: "ru", label: "Русский", flag: "🇷🇺" },
  { locale: "zh", label: "中文", flag: "🇨🇳" },
  { locale: "es", label: "Español", flag: "🇪🇸" },
  { locale: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { locale: "pl", label: "Polski", flag: "🇵🇱" },
  { locale: "pt", label: "Português", flag: "🇧🇷" },
  { locale: "it", label: "Italiano", flag: "🇮🇹" },
  { locale: "nl", label: "Nederlands", flag: "🇳🇱" },
  { locale: "ja", label: "日本語", flag: "🇯🇵" },
  { locale: "ko", label: "한국어", flag: "🇰🇷" },
  { locale: "ar", label: "العربية", flag: "🇦🇪" },
  { locale: "th", label: "ไทย", flag: "🇹🇭" },
  { locale: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { locale: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { locale: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { locale: "tl", label: "Filipino", flag: "🇵🇭" },
  { locale: "sv", label: "Svenska", flag: "🇸🇪" },
  { locale: "no", label: "Norsk", flag: "🇳🇴" },
  { locale: "da", label: "Dansk", flag: "🇩🇰" },
  { locale: "fi", label: "Suomi", flag: "🇫🇮" },
  { locale: "cs", label: "Čeština", flag: "🇨🇿" },
  { locale: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { locale: "hu", label: "Magyar", flag: "🇭🇺" },
  { locale: "ro", label: "Română", flag: "🇷🇴" },
  { locale: "bg", label: "Български", flag: "🇧🇬" },
  { locale: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { locale: "he", label: "עברית", flag: "🇮🇱" },
  { locale: "uk", label: "Українська", flag: "🇺🇦" },
  { locale: "hr", label: "Hrvatski", flag: "🇭🇷" },
  { locale: "sr", label: "Srpski", flag: "🇷🇸" },
  { locale: "sl", label: "Slovenščina", flag: "🇸🇮" },
  { locale: "lt", label: "Lietuvių", flag: "🇱🇹" },
  { locale: "lv", label: "Latviešu", flag: "🇱🇻" },
  { locale: "et", label: "Eesti", flag: "🇪🇪" },
  { locale: "is", label: "Íslenska", flag: "🇮🇸" },
  { locale: "fa", label: "فارسی", flag: "🇮🇷" },
  { locale: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { locale: "af", label: "Afrikaans", flag: "🇿🇦" },
  { locale: "bn", label: "বাংলা", flag: "🇧🇩" },
  { locale: "ur", label: "اردو", flag: "🇵🇰" },
  { locale: "ta", label: "தமிழ்", flag: "🇱🇰" },
  { locale: "mn", label: "Монгол", flag: "🇲🇳" },
  { locale: "ka", label: "ქართული", flag: "🇬🇪" },
  { locale: "hy", label: "Հայերեն", flag: "🇦🇲" },
  { locale: "az", label: "Azərbaycan dili", flag: "🇦🇿" },
  { locale: "km", label: "ខ្មែរ", flag: "🇰🇭" },
];

// The next-intl convention this whole merged site standardizes on, so a
// language change on any one of the three zones (VoyageAI, Keşfedin,
// Cruise) is picked up by the other two — they all read/write the same
// cookie on the shared top-level domain.
export const LOCALE_COOKIE = "NEXT_LOCALE";
