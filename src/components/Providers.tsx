"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import rtlPlugin from "@mui/stylis-plugin-rtl";
import { prefixer } from "stylis";
import { I18nProvider } from "@/i18n/I18nProvider";
import { localeDir, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages/en";
import theme, { rtlTheme } from "@/theme";

/**
 * Everything the pages need around them: styles, theme and language. It is a
 * client component because the plugin that mirrors styles for right-to-left
 * languages is a function, which a server component can't hand down.
 */
export default function Providers({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  const rtl = localeDir(locale) === "rtl";
  return (
    <AppRouterCacheProvider
      options={
        rtl
          ? {
              key: "muirtl",
              enableCssLayer: true,
              stylisPlugins: [prefixer, rtlPlugin],
            }
          : { enableCssLayer: true }
      }
    >
      <ThemeProvider theme={rtl ? rtlTheme : theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
