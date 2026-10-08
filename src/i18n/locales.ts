/**
 * The languages the app is translated into: the most spoken in the world by
 * total speakers (Ethnologue 2026), in that order: the top twenty. The menu
 * has its own order; see `menuOrder`.
 *
 * `intl` is the tag handed to `Intl` for plural rules and number formatting,
 * where it differs from the code: browsers know few rules for `arz` and
 * `pcm`, and an unknown tag silently falls back to the system language.
 */
export const LOCALES = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "hi", name: "हिन्दी" },
  { code: "es", name: "Español" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "fr", name: "Français" },
  { code: "bn", name: "বাংলা" },
  { code: "pt", name: "Português" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ur", name: "اردو", dir: "rtl" },
  { code: "ru", name: "Русский" },
  { code: "de", name: "Deutsch" },
  { code: "ja", name: "日本語" },
  { code: "pcm", name: "Naijá", intl: "en-NG" },
  { code: "arz", name: "مصرى", dir: "rtl", intl: "ar-EG" },
  { code: "mr", name: "मराठी" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "te", name: "తెలుగు" },
  { code: "sw", name: "Kiswahili" },
  { code: "ha", name: "Hausa" },
] as const satisfies readonly {
  code: string;
  name: string;
  dir?: "rtl";
  intl?: string;
}[];

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

/** Where a visitor's own choice of language is kept. */
export const LOCALE_COOKIE = "locale";

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale.code === value);
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  const found = LOCALES.find((l) => l.code === locale);
  return found && "dir" in found ? found.dir : "ltr";
}

export function intlTag(locale: Locale): string {
  const found = LOCALES.find((l) => l.code === locale);
  return found && "intl" in found ? found.intl : locale;
}

/** The translation for one language tag a browser sent, if there is one. */
export function forTag(tag: string): Locale | undefined {
  const lower = tag.toLowerCase();
  // Egypt's Arabic has its own translation; every other Arabic gets Standard.
  // A script may come before the region and extensions after it.
  if (/^ar(-[a-z]{4})?-eg(-|$)/.test(lower)) return "arz";
  if (isLocale(lower)) return lower;
  const language = lower.split("-")[0];
  return isLocale(language) ? language : undefined;
}

/**
 * The best translation for an `Accept-Language` header: the visitor's most
 * preferred language that has one, or English.
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  const tags = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      const weight = q ? Number(q.trim().slice(2)) : 1;
      return { tag: tag.trim(), weight: Number.isNaN(weight) ? 0 : weight };
    })
    .filter(({ tag, weight }) => tag && weight > 0)
    // Stable, so equal weights keep the order the browser listed them in
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of tags) {
    const locale = forTag(tag);
    if (locale) return locale;
  }
  return DEFAULT_LOCALE;
}

// One fixed collation, so the list is in the same order for every visitor:
// Latin-script names first, then the other scripts, each grouped together
const byName = new Intl.Collator("en");

/**
 * The languages in the order the menu offers them. English leads, as the way
 * out for someone in a language they can't read; then the visitor's own
 * languages, most preferred first; then the rest by their own names.
 */
export function menuOrder(browserTags: readonly string[]): {
  pinned: Locale[];
  rest: Locale[];
} {
  const pinned: Locale[] = [DEFAULT_LOCALE];
  for (const tag of browserTags) {
    const locale = forTag(tag);
    if (locale && !pinned.includes(locale)) pinned.push(locale);
  }
  const rest = LOCALES.filter(({ code }) => !pinned.includes(code))
    .sort((a, b) => byName.compare(a.name, b.name))
    .map(({ code }) => code);
  return { pinned, rest };
}

export function localeName(locale: Locale): string {
  return LOCALES.find(({ code }) => code === locale)!.name;
}
