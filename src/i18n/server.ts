import { cookies, headers } from "next/headers";
import { isLocale, LOCALE_COOKIE, matchLocale, type Locale } from "./locales";

/**
 * The language to render this request in: the visitor's own choice if they
 * made one, otherwise the best match for what their browser asks for.
 */
export async function getLocale(): Promise<Locale> {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  return matchLocale((await headers()).get("accept-language"));
}
