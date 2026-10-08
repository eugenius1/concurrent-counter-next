"use client";

import * as React from "react";
import en, { type Messages } from "./messages/en";
import { DEFAULT_LOCALE, type Locale } from "./locales";

type I18n = { locale: Locale; m: Messages };

// English without a provider, which is what a component rendered on its own
// in a test gets
const I18nContext = React.createContext<I18n>({
  locale: DEFAULT_LOCALE,
  m: en,
});

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({ locale, m: messages }),
    [locale, messages],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** The current language and its messages. */
export function useI18n(): I18n {
  return React.useContext(I18nContext);
}
