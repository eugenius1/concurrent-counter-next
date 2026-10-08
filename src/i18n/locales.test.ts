import {
  intlTag,
  LOCALES,
  localeDir,
  localeName,
  matchLocale,
  menuOrder,
} from "./locales";

describe("matchLocale", () => {
  it.each([
    ["sw", "sw"],
    ["sw-TZ,sw;q=0.9,en;q=0.8", "sw"],
    ["pt-BR", "pt"],
    ["zh-Hans-CN", "zh"],
    ["ar-EG", "arz"],
    ["ar-SA", "ar"],
    ["PCM", "pcm"],
  ])("serves %s in %s", (header, locale) => {
    expect(matchLocale(header)).toBe(locale);
  });

  it("takes the most preferred language that is translated", () => {
    expect(matchLocale("it,fr;q=0.5,de;q=0.8")).toBe("de");
  });

  it("keeps the browser's order between equal preferences", () => {
    expect(matchLocale("es,fr")).toBe("es");
  });

  it("skips a language the visitor refuses", () => {
    expect(matchLocale("fr;q=0,de")).toBe("de");
  });

  it.each([null, undefined, "", "it", "*", ";;,,"])(
    "falls back to English for %p",
    (header) => {
      expect(matchLocale(header)).toBe("en");
    },
  );
});

describe("LOCALES", () => {
  it("lists each language once", () => {
    const codes = LOCALES.map(({ code }) => code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("writes Arabic and Urdu right to left", () => {
    expect(LOCALES.filter(({ code }) => localeDir(code) === "rtl")).toEqual([
      expect.objectContaining({ code: "ar" }),
      expect.objectContaining({ code: "ur" }),
      expect.objectContaining({ code: "arz" }),
    ]);
    expect(localeDir("en")).toBe("ltr");
  });

  it("gives Intl a tag it has rules for", () => {
    for (const { code } of LOCALES) {
      expect([
        code,
        Intl.PluralRules.supportedLocalesOf(intlTag(code)).length,
      ]).toEqual([code, 1]);
    }
  });
});

describe("menuOrder", () => {
  it("puts English first and the rest in order of their own names", () => {
    const { pinned, rest } = menuOrder([]);

    expect(pinned).toEqual(["en"]);
    expect(rest.map(localeName)).toEqual([
      "Bahasa Indonesia",
      "Deutsch",
      "Español",
      "Français",
      "Hausa",
      "Kiswahili",
      "Naijá",
      "Português",
      "Tiếng Việt",
      "Русский",
      "اردو",
      "العربية",
      "مصرى",
      "मराठी",
      "हिन्दी",
      "বাংলা",
      "తెలుగు",
      "中文",
      "日本語",
    ]);
  });

  it("puts the browser's languages after English, most preferred first", () => {
    const { pinned, rest } = menuOrder(["sw-TZ", "it", "fr", "en-GB", "sw"]);

    expect(pinned).toEqual(["en", "sw", "fr"]);
    expect(rest).not.toContain("sw");
    expect(rest).not.toContain("fr");
    expect(pinned.length + rest.length).toBe(LOCALES.length);
  });
});
