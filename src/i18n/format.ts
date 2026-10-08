import type { PluralForms } from "./messages/en";
import { intlTag, type Locale } from "./locales";

/** Replaces each `{name}` in a message with its value. */
export function fill(
  message: string,
  values: Record<string, string | number>,
): string {
  return message.replace(/\{(\w+)\}/g, (placeholder, name) =>
    name in values ? String(values[name]) : placeholder,
  );
}

/**
 * The form of a message for a number, with `{count}` written the way the
 * language writes numbers.
 */
export function plural(
  locale: Locale,
  forms: PluralForms,
  count: number,
): string {
  const tag = intlTag(locale);
  const category = new Intl.PluralRules(tag).select(count);
  const form = (category !== "other" && forms[category]) || forms.other;
  return fill(form, { count: count.toLocaleString(tag) });
}
