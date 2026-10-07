import * as React from "react";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import Header from "@/components/Header";
import Providers from "@/components/Providers";
import { localeDir } from "@/i18n/locales";
import { loadMessages } from "@/i18n/messages";
import { getLocale } from "@/i18n/server";

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await loadMessages(locale);

  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <head>
        <title>Concurrent Counter | Eusebius.Tech</title>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icon/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <InitColorSchemeScript attribute="class" />
        <Providers locale={locale} messages={messages}>
          <Header />
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
