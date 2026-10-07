import type { Locale } from "../locales";
import en, { type Messages } from "./en";

// Each language is its own chunk, so a page carries only the one it shows
const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: async () => ({ default: en }),
  zh: () => import("./zh"),
  hi: () => import("./hi"),
  es: () => import("./es"),
  ar: () => import("./ar"),
  fr: () => import("./fr"),
  bn: () => import("./bn"),
  pt: () => import("./pt"),
  id: () => import("./id"),
  ur: () => import("./ur"),
  ru: () => import("./ru"),
  de: () => import("./de"),
  ja: () => import("./ja"),
  pcm: () => import("./pcm"),
  arz: () => import("./arz"),
  mr: () => import("./mr"),
  vi: () => import("./vi"),
  te: () => import("./te"),
  sw: () => import("./sw"),
};

export async function loadMessages(locale: Locale): Promise<Messages> {
  return (await loaders[locale]()).default;
}
